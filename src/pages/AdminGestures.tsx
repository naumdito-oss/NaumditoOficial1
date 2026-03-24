import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { microGestures as initialGestures } from '../data/microGestures';
import { GoogleGenAI } from '@google/genai';

export const AdminGestures: React.FC = () => {
  const [gestures, setGestures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    fetchGestures();
  }, []);

  const fetchGestures = async () => {
    try {
      const { data, error } = await supabase
        .from('micro_gestures')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setGestures(data);
      } else {
        // Populate database if empty
        const { data: insertedData, error: insertError } = await supabase
          .from('micro_gestures')
          .insert(
            initialGestures.map((g) => ({
              id: g.id,
              title: g.title,
              description: g.description,
              image_prompt: g.imagePrompt,
              image_url: null, // Start without images
            }))
          )
          .select();

        if (insertError) throw insertError;
        if (insertedData) setGestures(insertedData);
      }
    } catch (error) {
      console.error('Error fetching gestures:', error);
    }
  };

  const generateImages = async () => {
    if (!apiKey) {
      alert('Por favor, insira sua chave da API do Gemini.');
      return;
    }

    setLoading(true);
    const ai = new GoogleGenAI({ apiKey });
    const gesturesToProcess = gestures.filter((g) => !g.image_url);
    setProgress({ current: 0, total: gesturesToProcess.length });

    for (let i = 0; i < gesturesToProcess.length; i++) {
      const gesture = gesturesToProcess[i];
      try {
        console.log(`Gerando imagem para: ${gesture.title}`);
        
        // 1. Generate image with Gemini
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: gesture.image_prompt }],
          },
        });

        let base64Image = '';
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            base64Image = part.inlineData.data;
            break;
          }
        }

        if (!base64Image) {
          throw new Error('Falha ao gerar imagem');
        }

        // 2. Convert base64 to Blob
        const byteCharacters = atob(base64Image);
        const byteNumbers = new Array(byteCharacters.length);
        for (let j = 0; j < byteCharacters.length; j++) {
          byteNumbers[j] = byteCharacters.charCodeAt(j);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        const file = new File([blob], `gesture-${gesture.id}-${Date.now()}.png`, { type: 'image/png' });

        // 3. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(`gestures/${file.name}`, file, { upsert: true });

        if (uploadError) throw uploadError;

        // 4. Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('assets')
          .getPublicUrl(`gestures/${file.name}`);

        // 5. Update database
        const { error: updateError } = await supabase
          .from('micro_gestures')
          .update({ image_url: publicUrl })
          .eq('id', gesture.id);

        if (updateError) throw updateError;

        // Update local state
        setGestures((prev) =>
          prev.map((g) => (g.id === gesture.id ? { ...g, image_url: publicUrl } : g))
        );

      } catch (error) {
        console.error(`Erro ao processar gesto ${gesture.id}:`, error);
      }

      setProgress((prev) => ({ ...prev, current: prev.current + 1 }));
      
      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    setLoading(false);
    alert('Geração de imagens concluída!');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gerador de Imagens com IA (Gestos do Dia)</h1>
      
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-4">Configuração</h2>
        <p className="text-slate-600 mb-4">
          Para gerar as imagens, você precisa inserir sua chave da API do Google Gemini. 
          As imagens serão geradas, salvas no Supabase Storage (bucket 'assets') e o banco de dados será atualizado automaticamente.
        </p>
        <input
          type="password"
          placeholder="Cole sua Gemini API Key aqui"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-300 mb-4"
        />
        <button
          onClick={generateImages}
          disabled={loading || !apiKey}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50"
        >
          {loading ? `Gerando... (${progress.current}/${progress.total})` : 'Gerar Imagens Faltantes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gestures.map((gesture) => (
          <div key={gesture.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
            {gesture.image_url ? (
              <img src={gesture.image_url} alt={gesture.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-slate-100 flex items-center justify-center text-slate-400">
                Sem Imagem
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{gesture.title}</h3>
              <p className="text-sm text-slate-600 mb-2">{gesture.description}</p>
              <p className="text-xs text-slate-400 italic">Prompt: {gesture.image_prompt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
