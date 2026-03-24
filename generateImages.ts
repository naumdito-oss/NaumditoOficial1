import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { microGestures } from './src/data/microGestures';

// Initialize Supabase
// We need to read the config from src/config/supabase.ts or env vars
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateAndUpload() {
  const updatedGestures = [...microGestures];
  
  // Let's process the first 5 to avoid timeout, or we can do all if we add a delay
  for (let i = 0; i < 5; i++) {
    const gesture = updatedGestures[i];
    console.log(`Generating image for gesture ${gesture.id}: ${gesture.title}`);
    
    try {
      // Generate image
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: gesture.imagePrompt,
            },
          ],
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
        console.error(`Failed to generate image for gesture ${gesture.id}`);
        continue;
      }
      
      // Convert base64 to Buffer
      const buffer = Buffer.from(base64Image, 'base64');
      const fileName = `gesture-${gesture.id}-${Date.now()}.png`;
      
      console.log(`Uploading to Supabase: ${fileName}`);
      
      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from('assets')
        .upload(`gestures/${fileName}`, buffer, {
          contentType: 'image/png',
          upsert: true
        });
        
      if (error) {
        console.error(`Supabase upload error for gesture ${gesture.id}:`, error);
        continue;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(`gestures/${fileName}`);
        
      console.log(`Success! URL: ${publicUrl}`);
      
      // Update the gesture object
      updatedGestures[i].imageUrl = publicUrl;
      
    } catch (err) {
      console.error(`Error processing gesture ${gesture.id}:`, err);
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Write the updated file
  const fileContent = `export interface MicroGesture {
  id: number;
  title: string;
  description: string;
  imagePrompt: string;
  imageUrl: string;
}

export const microGestures: MicroGesture[] = ${JSON.stringify(updatedGestures, null, 2)};
`;

  fs.writeFileSync(path.join(process.cwd(), 'src/data/microGestures.ts'), fileContent);
  console.log('Finished updating microGestures.ts');
}

generateAndUpload();
