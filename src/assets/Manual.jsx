import React from 'react';

export default function Manual({ aoFechar }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-[#F2E8D5] text-[#3D2B1F] rounded-2xl p-6 md:p-8 shadow-2xl border border-[#A65D37]/20 max-h-[90vh] overflow-y-auto">
        
        <header className="border-b-2 border-[#A65D37]/20 pb-4 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#A65D37]">Guia de Uso — Voz Ativa</h1>
            <p className="text-sm opacity-80">Como usar a transcrição e salvar seus registros.</p>
          </div>
          <button 
            onClick={aoFechar}
            className="bg-[#A65D37] hover:bg-[#8e4e2e] text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors cursor-pointer"
          >
            Fechar Guia
          </button>
        </header>

        <div className="space-y-6">
          <section className="bg-white/60 p-4 rounded-xl border-l-4 border-[#A65D37]">
            <h2 className="font-bold text-[#A65D37] mb-1">🎙️ 1. Transcrever Aula ou Consulta</h2>
            <p className="text-sm leading-relaxed">
              Clique no botão **"ASSISTIR AULA E GRAVAR"** ou no ícone do **Microfone**. O aplicativo vai ouvir o que o professor, médico ou palestrante está falando e transformará a voz em texto automaticamente na tela.
            </p>
          </section>

          <section className="bg-white/60 p-4 rounded-xl border-l-4 border-[#7D8C69]">
            <h2 className="font-bold text-[#7D8C69] mb-1">📂 2. Categorias e Organização</h2>
            <p className="text-sm leading-relaxed">
              Antes de salvar, você pode selecionar o tema do conteúdo. O sistema organiza tudo em pastas visuais na lateral direita, como **Aulas** ou **Saúde**, facilitando encontrar os registros depois.
            </p>
          </section>

          <section className="bg-white/60 p-4 rounded-xl border-l-4 border-[#3D2B1F]">
            <h2 className="font-bold text-[#3D2B1F] mb-1">📄 3. Histórico e Gerar PDF</h2>
            <p className="text-sm leading-relaxed">
              Você pode clicar em **"SALVAR NO HISTÓRICO"** para guardar o texto no app, ou clicar em **"GERAR PDF"** para baixar o documento formatado direto para o seu dispositivo.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
