import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";

const App = () => {
  // Estados de Transcrição e Áudio
  const [estaGravando, setEstaGravando] = useState(false);
  const [textoTranscrito, setTextoTranscrito] = useState("");
  const [mostrarTemas, setMostrarTemas] = useState(false);
  const [temaSelecionado, setTemaSelecionado] = useState("Aula / Palestra");
  const [origemAudio, setOrigemAudio] = useState("microfone"); 

  // NOVO ESTADO: Lista de Histórico real para exibir na barra lateral
  const [historico, setHistorico] = useState([]);

  // Estados de Controle de Telas (Segurança e Manual)
  const [telaAutenticacao, setTelaAutenticacao] = useState(null); 
  const [abrirManual, setAbrirManual] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [abaCadastro, setAbaCadastro] = useState("pessoal");

  // Dados dos Formulários
  const [credenciais, setCredenciais] = useState({ email: "", senha: "" });
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [dadosCadastro, setDadosCadastro] = useState({
    nome: "",
    ra: "",
    rgCpf: "",
    whatsApp: "",
    codigoLiberacao: ""
  });

  // Referências para a API de Reconhecimento de Voz e controle de estado
  const reconhecimentoRef = useRef(null);
  const estaGravandoRef = useRef(estaGravando);

  useEffect(() => {
    estaGravandoRef.current = estaGravando;
  }, [estaGravando]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "pt-BR";

      recognition.onresult = (event) => {
        let textoFinal = "";
        let textoProvisorio = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcricao = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            textoFinal += transcricao + " ";
          } else {
            textoProvisorio += transcricao;
          }
        }

        if (textoFinal) {
          setTextoTranscrito((prev) => prev + textoFinal);
        }
      };

      recognition.onerror = (event) => {
        console.error("Erro no microfone: ", event.error);
        if (event.error === "not-allowed") {
          alert("Permissão de microfone negada! Verifique as configurações no ícone do cadeado ao lado do link.");
          setEstaGravando(false);
        }
      };

      recognition.onend = () => {
        if (estaGravandoRef.current) {
          try {
            reconhecimentoRef.current.start();
          } catch (err) {
            console.error("Erro ao reiniciar gravação automática:", err);
          }
        }
      };

      reconhecimentoRef.current = recognition;
    }

    return () => {
      if (reconhecimentoRef.current) {
        reconhecimentoRef.current.stop();
      }
    };
  }, []);

  const alternarGravacao = () => {
    if (!reconhecimentoRef.current) {
      alert("Seu navegador não suporta captura de voz nativa. Use o Google Chrome.");
      return;
    }

    if (!estaGravando) {
      try {
        reconhecimentoRef.current.start();
        setEstaGravando(true);
      } catch (err) {
        console.error("Erro ao iniciar:", err);
      }
    } else {
      setEstaGravando(false);
      reconhecimentoRef.current.stop();
    }
  };

  // FUNÇÃO CORRIGIDA: Agora adiciona o item na lista visível da direita!
  const handleSalvarHistorico = () => {
    if (!textoTranscrito.trim()) {
      alert("Não há texto para salvar no histórico!");
      return;
    }

    const novoItem = {
      id: Date.now(),
      texto: textoTranscrito,
      categoria: temaSelecionado,
      data: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    // Adiciona o novo item no topo do histórico
    setHistorico((prev) => [novoItem, ...prev]);
    alert(`Salvo com sucesso na categoria: ${temaSelecionado}!`);
  };

  const handleGerarPDF = () => {
    if (!textoTranscrito) {
      alert("Por favor, capture algum texto antes de exportar.");
      return;
    }
    const doc = new jsPDF();
    doc.text("Voz Ativa - Transcrição", 10, 10);
    doc.text(`Categoria: ${temaSelecionado}`, 10, 18);
    doc.text(textoTranscrito, 10, 28, { maxWidth: 180 });
    doc.save("transcricao.pdf");
  };

  const ejecutarLogin = (e) => {
    e.preventDefault();
    if (!credenciais.email || !credenciais.senha) {
      alert("Preencha todos os campos!");
      return;
    }
    setUsuarioLogado(true);
    setTelaAutenticacao("cadastro"); 
  };

  const ejecutarRecuperacao = (e) => {
    e.preventDefault();
    if (!emailRecuperacao) {
      alert("Insira seu e-mail.");
      return;
    }
    alert(`Link de recuperação enviado com sucesso para: ${emailRecuperacao}`);
    setTelaAutenticacao("login");
  };

  return (
    <div className="min-h-screen bg-[#F5EBE0] text-[#5C3E21] font-sans antialiased flex flex-col relative">
      
      {/* CABEÇALHO */}
      <header className="px-8 py-4 flex justify-between items-center bg-[#EADCC9] border-b border-[#D2C1AC]">
        <div className="text-3xl font-extrabold text-[#A06030] tracking-wider uppercase">Voz Ativa</div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setAbrirManual(true)}
            className="text-[#A06030] font-bold text-sm tracking-wider hover:underline bg-transparent border-none cursor-pointer uppercase"
          >
            COMO USAR
          </button>
          <button 
            onClick={() => setTelaAutenticacao(usuarioLogado ? "cadastro" : "login")}
            className="bg-white border border-[#A06030] text-[#A06030] font-bold px-5 py-2 rounded hover:bg-gray-50 transition-all cursor-pointer text-xs tracking-wider"
          >
            👤 Perfil / Cadastro
          </button>
        </div>
      </header>

      {/* AVISO DO PERÍODO DE AVALIAÇÃO */}
      <div className="bg-[#788A72] text-white text-center py-1.5 text-xs font-semibold tracking-wider">
        ⏳ Período de Avaliação: 7 dias restantes.
      </div>

      {/* ÁREA PRINCIPAL DO PROJETO */}
      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 max-w-7xl w-full mx-auto items-stretch">
        
        {/* CONTAINER DA ESQUERDA (ÁREA DE TEXTO) */}
        <main className="flex-1 bg-white rounded-xl p-8 shadow-sm flex flex-col justify-between relative border border-[#E3D4C1]">
          
          <div>
            {/* SELETOR DE MODO DE CAPTURA */}
            <div className="flex justify-center gap-4 mb-4 bg-[#F5EBE0] p-2 rounded-lg border border-[#E3D4C1]">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer">
                <input 
                  type="radio" 
                  name="origemAudio" 
                  value="microfone" 
                  checked={origemAudio === "microfone"}
                  onChange={() => setOrigemAudio("microfone")}
                  disabled={estaGravando}
                />
                🎙️ Conversas Presenciais / Celular
              </label>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer">
                <input 
                  type="radio" 
                  name="origemAudio" 
                  value="sistema" 
                  checked={origemAudio === "sistema"}
                  onChange={() => setOrigemAudio("sistema")}
                  disabled={estaGravando}
                />
                💻 Aula Online / Google Meet (PC)
              </label>
            </div>

            {/* BOTÃO PRINCIPAL DE GRAVAÇÃO */}
            <button
              onClick={alternarGravacao}
              className={`w-full py-4 mb-6 rounded-xl font-bold text-base tracking-wider transition-all border-none text-white cursor-pointer ${
                estaGravando 
                  ? "bg-red-600 animate-pulse" 
                  : "bg-[#A36237] hover:bg-[#8C522E]"
              }`}
            >
              {estaGravando ? "🛑 PARAR GRAVAÇÃO DE ÁUDIO" : "ASSISTIR AULA E GRAVAR"}
            </button>

            {/* SELETOR DE TEMAS */}
            <div className="relative inline-block mb-4">
              <button
                onClick={() => setMostrarTemas(!mostrarTemas)}
                className="text-[#A36237] font-bold text-xs tracking-wider flex items-center gap-1 bg-transparent border-none cursor-pointer uppercase"
              >
                SELECIONAR TEMA PARA SALVAR <span className="text-blue-500 text-sm">⬇️</span>
                <span className="text-gray-500 font-normal normal-case ml-1">({temaSelecionado})</span>
              </button>

              {/* Dropdown de Temas */}
              {mostrarTemas && (
                <div className="absolute left-0 mt-1 w-56 bg-white border border-[#A36237]/40 rounded-lg shadow-lg z-30 overflow-hidden">
                  {["Aula / Palestra", "Saúde / Médica", "Conversas / Diversas", "Aleatório"].map((tema) => (
                    <button
                      key={tema}
                      type="button"
                      onClick={() => { setTemaSelecionado(tema); setMostrarTemas(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F5EBE0] text-[#5C3E21] bg-transparent border-none cursor-pointer block"
                    >
                      {tema}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="text-[11px] font-bold text-[#A36237] mb-2 uppercase tracking-wider">
              Texto transcrito automaticamente:
            </div>

            {/* CAIXA DE TEXTO */}
            <div className="relative w-full mb-6 bg-white rounded-xl border border-[#E3D4C1] p-4">
              <button 
                onClick={() => setTextoTranscrito("")}
                className="absolute top-4 right-4 text-xl text-gray-300 hover:text-red-500 bg-transparent border-none cursor-pointer z-10 p-1"
                title="Apagar aula / Limpar texto"
              >
                🗑️
              </button>
              <textarea
                value={textoTranscrito}
                onChange={(e) => setTextoTranscrito(e.target.value)}
                placeholder={origemAudio === "sistema" ? "Deixe o som do notebook alto para o microfone captar o áudio do Meet..." : "O som convertido aparecerá aqui..."}
                className="w-full h-64 bg-transparent border-none text-[#5C3E21] focus:outline-none resize-none leading-relaxed text-base pt-2 pr-10"
              />
            </div>

            {/* ÍCONE DO MICROFONE INFERIOR */}
            <div className="flex justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-inner ${
                estaGravando ? "bg-red-600 text-white animate-bounce" : "bg-[#5A6B65] text-white"
              }`}>
                🎙️
              </div>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO DO RODAPÉ */}
          <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
            <button
              onClick={handleGerarPDF}
              className="bg-[#798A73] hover:bg-[#65755F] text-white font-medium px-6 py-2 rounded text-xs uppercase tracking-wider border-none cursor-pointer"
            >
              Gerar PDF
            </button>
            <button
              onClick={handleSalvarHistorico}
              className="bg-[#A36237] hover:bg-[#8C522E] text-white font-medium px-6 py-2 rounded text-xs uppercase tracking-wider border-none cursor-pointer"
            >
              Salvar no Histórico
            </button>
            <button
              onClick={() => setTextoTranscrito("")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-500 px-4 py-2 rounded text-xs uppercase tracking-wider border-none cursor-pointer"
            >
              Limpar
            </button>
          </div>
        </main>

        {/* CONTAINER DA DIREITA */}
        <aside className="w-full lg:w-80 flex flex-col gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E3D4C1]">
            <h3 className="font-bold text-xs text-[#A36237] mb-4 flex items-center gap-1 tracking-wider uppercase">
              🗂️ Pastas Organizadas
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setTemaSelecionado("Aula / Palestra")} className="bg-white border border-gray-300 hover:bg-gray-50 py-2 px-3 rounded text-xs font-semibold text-gray-600 flex items-center justify-center gap-1 cursor-pointer">
                📚 AULAS
              </button>
              <button onClick={() => setTemaSelecionado("Saúde / Médica")} className="bg-white border border-gray-300 hover:bg-gray-50 py-2 px-3 rounded text-xs font-semibold text-gray-600 flex items-center justify-center gap-1 cursor-pointer">
                🔮 SAÚDE
              </button>
              <button onClick={() => setTemaSelecionado("Conversas / Diversas")} className="bg-white border border-gray-300 hover:bg-gray-50 py-2 px-3 rounded text-xs font-semibold text-gray-600 flex items-center justify-center gap-1 cursor-pointer">
                🌲 PASSEIOS
              </button>
              <button onClick={() => setTemaSelecionado("Aleatório")} className="bg-white border border-gray-300 hover:bg-gray-50 py-2 px-3 rounded text-xs font-semibold text-gray-600 flex items-center justify-center gap-1 cursor-pointer">
                🔸 ALEATÓRIO
              </button>
            </div>
          </div>

          {/* CAIXA DE RECENTES COMPLETA E DETALHADA COM O SEU HISTÓRICO REAL */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E3D4C1] flex-1 flex flex-col overflow-hidden">
            <h3 className="font-bold text-xs text-gray-400 mb-3 tracking-wider uppercase">📁 Recentes</h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[320px]">
              {historico.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-xs italic text-gray-400 pt-10">
                  Nenhum registro salvo ainda.<br />
                  <span className="block mt-2 font-normal not-italic text-xs text-gray-400">Categoria em foco:</span>
                  <strong className="text-[#A36237] not-italic block mt-1">{temaSelecionado}</strong>
                </div>
              ) : (
                historico.map((item) => (
                  <div key={item.id} className="bg-[#F5EBE0]/60 border border-[#E3D4C1] p-3 rounded-lg text-xs shadow-sm">
                    <div className="flex justify-between font-bold text-[#A36237] mb-1">
                      <span className="uppercase tracking-wide">🏷️ {item.categoria}</span>
                      <span className="text-gray-400 font-normal">{item.data}</span>
                    </div>
                    <p className="text-[#5C3E21] font-medium line-clamp-3 text-left leading-relaxed">
                      {item.texto}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* MODAL DO MANUAL COMPLETO */}
      {abrirManual && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl relative text-[#5C3E21] border border-[#E3D4C1]">
            <button onClick={() => setAbrirManual(false)} className="absolute top-4 right-4 bg-transparent border-none text-gray-400 hover:text-gray-600 text-lg cursor-pointer">✕</button>
            <h2 className="text-xl font-bold text-[#A36237] mb-4 uppercase border-b pb-2">Manual de Uso do Voz Ativa</h2>
            <div className="space-y-3 text-sm leading-relaxed text-gray-600 overflow-y-auto max-h-96 pr-2">
              <p><strong>1. Seleção de Tema:</strong> Clique na seta azul abaixo do botão principal para escolher a pasta onde deseja categorizar o documento.</p>
              <p><strong>2. Iniciar Transcrição:</strong> Posicione a janela ao lado de sua aula ou videoconferência e clique em <strong>"ASSISTIR AULA E GRAVAR"</strong>. Dê a permissão de microfone solicitada pelo navegador.</p>
              <p><strong>3. Limpeza do Campo:</strong> Use o botão de lixeira (🗑️) posicionado no canto superior direito do bloco de texto para limpar a transcrição atual instantaneamente.</p>
              <p><strong>4. Exportação Segura:</strong> Ao terminar, salve seu documento clicando em <em>"Gerar PDF"</em> ou arquive diretamente no seu painel local usando o botão <em>"Salvar no Histórico"</em>.</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AUTENTICAÇÃO E CADASTRO COMPLETO */}
      {telaAutenticacao && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl bg-white rounded-2xl p-8 shadow-2xl relative text-[#5C3E21] border border-[#E3D4C1]">
            
            <button onClick={() => setTelaAutenticacao(null)} className="absolute top-4 right-4 bg-transparent border-none text-gray-400 hover:text-gray-600 text-lg cursor-pointer">✕</button>

            {telaAutenticacao === "login" && (
              <div>
                <h2 className="text-xl font-bold text-[#A36237] mb-6 uppercase text-center tracking-wider">Acesse sua conta</h2>
                <form onSubmit={ejecutarLogin} className="space-y-4 max-w-sm mx-auto">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">E-mail:</label>
                    <input type="email" required value={credenciais.email} onChange={(e) => setCredenciais({...credenciais, email: e.target.value})} className="w-full px-3 py-2 rounded border border-[#E3D4C1] text-sm focus:outline-none focus:border-[#A36237]" placeholder="seuemail@provedor.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Senha:</label>
                    <input type="password" required value={credenciais.senha} onChange={(e) => setCredenciais({...credenciais, senha: e.target.value})} className="w-full px-3 py-2 rounded border border-[#E3D4C1] text-sm focus:outline-none focus:border-[#A36237]" placeholder="Sua senha" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <button type="submit" className="bg-[#798A73] hover:bg-[#65755F] text-white font-bold px-4 py-2 rounded border-none cursor-pointer text-xs uppercase tracking-wider">Entrar</button>
                    <button type="button" onClick={() => setTelaAutenticacao("recuberar")} className="text-blue-600 hover:underline bg-transparent border-none cursor-pointer text-xs font-medium">Esqueceu sua senha?</button>
                  </div>
                </form>
                <div className="text-center mt-6 border-t pt-4">
                  <button onClick={() => { setUsuarioLogado(true); setTelaAutenticacao("cadastro"); }} className="text-blue-700 font-bold tracking-wider hover:underline bg-transparent border-none cursor-pointer text-xs uppercase">Clique e Faça seu cadastro</button>
                </div>
              </div>
            )}

            {telaAutenticacao === "recuberar" && (
              <div className="max-w-sm mx-auto">
                <h2 className="text-xl font-bold text-[#A36237] mb-3 uppercase text-center tracking-wider">Recuperar Senha</h2>
                <p className="text-xs text-gray-500 text-center mb-4">Insira o e-mail da sua conta para criar uma nova senha.</p>
                <form onSubmit={ejecutarRecuperacao} className="space-y-4">
                  <input type="email" required value={emailRecuperacao} onChange={(e) => setEmailRecuperacao(e.target.value)} className="w-full px-3 py-2 rounded border border-[#E3D4C1] text-sm focus:outline-none" placeholder="exemplo@email.com" />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-[#A36237] text-white font-bold py-2 rounded border-none cursor-pointer text-xs uppercase">Enviar</button>
                    <button type="button" onClick={() => setTelaAutenticacao("login")} className="bg-gray-100 text-gray-500 px-3 py-2 rounded border-none cursor-pointer text-xs uppercase">Voltar</button>
                  </div>
                </form>
              </div>
            )}

            {telaAutenticacao === "cadastro" && (
              <div>
                <h2 className="text-xl font-bold text-center text-[#A36237] mb-6 uppercase tracking-wider">Perfil do Usuário</h2>
                <div className="flex justify-center gap-6 border-b mb-6">
                  <button type="button" onClick={() => setAbaCadastro("pessoal")} className={`font-bold text-xs pb-2 bg-transparent border-none cursor-pointer uppercase ${abaCadastro === "pessoal" ? "text-[#A36237] border-b-2 border-[#A36237]" : "text-gray-400"}`}>👤 Dados Pessoais</button>
                  <button type="button" onClick={() => setAbaCadastro("academico")} className={`font-bold text-xs pb-2 bg-transparent border-none cursor-pointer uppercase ${abaCadastro === "academico" ? "text-[#A36237] border-b-2 border-[#A36237]" : "text-gray-400"}`}>🎓 Acadêmico</button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); alert('Perfil updated com segurança!'); setTelaAutenticacao(null); }} className="space-y-4">
                  {abaCadastro === "pessoal" ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-0.5 uppercase">Nome completo do aluno</label>
                        <input type="text" className="w-full px-3 py-2 rounded bg-gray-50 border border-gray-200 text-sm focus:outline-none" value={dadosCadastro.nome} onChange={(e) => setDadosCadastro({...dadosCadastro, nome: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-0.5 uppercase">CPF ou RG</label>
                          <input type="text" className="w-full px-3 py-2 rounded bg-gray-50 border border-gray-200 text-sm focus:outline-none" value={dadosCadastro.rgCpf} onChange={(e) => setDadosCadastro({...dadosCadastro, rgCpf: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-0.5 uppercase">WhatsApp</label>
                          <input type="text" className="w-full px-3 py-2 rounded bg-gray-50 border border-gray-200 text-sm focus:outline-none" value={dadosCadastro.whatsApp} onChange={(e) => setDadosCadastro({...dadosCadastro, whatsApp: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 items-end">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-0.5 uppercase">Número do RA</label>
                        <input type="text" className="w-full px-3 py-2 rounded bg-gray-50 border border-gray-200 text-sm focus:outline-none" value={dadosCadastro.ra} onChange={(e) => setDadosCadastro({...dadosCadastro, ra: e.target.value})} />
                      </div>
                      <div className="border border-amber-300 rounded p-2 bg-amber-50/40">
                        <label className="block text-[10px] font-bold text-amber-700 mb-1 text-center uppercase tracking-wider">Código de Liberação</label>
                        <input type="text" className="w-full px-2 py-1 bg-white border border-amber-200 text-center text-xs font-mono focus:outline-none" value={dadosCadastro.codigoLiberacao} onChange={(e) => setDadosCadastro({...dadosCadastro, codigoLiberacao: e.target.value})} />
                      </div>
                    </div>
                  )}
                  <button type="submit" className="w-full mt-4 bg-[#A36237] text-white font-bold py-3 rounded text-xs uppercase tracking-widest border-none cursor-pointer">💾 Salvar Dados do Perfil</button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default App;