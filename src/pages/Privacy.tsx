import { useNavigate } from 'react-router-dom';

export function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-24 transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1">
        <header className="flex items-center p-4 md:p-8 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-primary/10">
          <div onClick={() => navigate(-1)} className="flex size-10 md:size-12 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-navy-main dark:text-slate-100">arrow_back</span>
          </div>
          <h1 className="text-lg md:text-2xl font-black leading-tight tracking-tighter flex-1 text-center text-navy-main dark:text-slate-100">Privacidade</h1>
          <div className="flex size-10 md:size-12 items-center justify-center rounded-full opacity-0">
            <span className="material-symbols-outlined">info</span>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 space-y-8">
          <section className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-primary/5">
            <h3 className="text-lg font-black text-navy-main dark:text-slate-100 tracking-tight mb-6">Política de Privacidade</h3>
            
            <div className="space-y-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              <p>
                A sua privacidade é importante para nós. É política do NaumDito respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no aplicativo.
              </p>
              
              <div>
                <h4 className="font-bold text-navy-main dark:text-slate-200 mb-2">1. Informações que Coletamos</h4>
                <p>
                  Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-navy-main dark:text-slate-200 mb-2">2. Uso das Informações</h4>
                <p>
                  Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-navy-main dark:text-slate-200 mb-2">3. Compartilhamento de Dados</h4>
                <p>
                  Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei. Os dados do seu relacionamento são compartilhados apenas com o seu parceiro(a) vinculado(a) à conta.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-navy-main dark:text-slate-200 mb-2">4. Seus Direitos</h4>
                <p>
                  Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados. O uso continuado de nosso aplicativo será considerado como aceitação de nossas práticas em torno de privacidade e informações pessoais.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-primary/5">
            <h3 className="text-lg font-black text-navy-main dark:text-slate-100 tracking-tight mb-6">Controle de Dados</h3>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">download</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-navy-main dark:text-slate-200 text-sm">Baixar Meus Dados</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Exportar histórico e check-ins</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 hover:border-red-500/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                    <span className="material-symbols-outlined">delete_forever</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-red-500 text-sm">Excluir Conta</p>
                    <p className="text-xs text-red-400/70">Apagar permanentemente todos os dados</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-red-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
