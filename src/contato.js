// Seção Contato: formulário que abre o aplicativo de e-mail (mailto) e botão "Copiar e-mail".
// Não precisa de servidor nem cadastro: a mensagem sai da conta de quem escreveu.

const EMAIL = "contato.erick2026@outlook.com";

export function iniciarContato() {
  iniciarFormulario();
  iniciarCopiarEmail();
}

/* ---------- Formulário: abre o app de e-mail com assunto e mensagem preenchidos ---------- */
function iniciarFormulario() {
  const form = document.querySelector("#form-contato");

  // O "submit" só dispara com os campos obrigatórios preenchidos (validação do próprio navegador).
  // Os campos têm nomes em português de propósito: form.name já existe e daria conflito.
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const assunto = form.assunto.value.trim();
    const corpo = `${form.mensagem.value.trim()}\n\n— ${nome}`;

    // encodeURIComponent garante que acentos e quebras de linha cheguem certos
    window.location.href =
      `mailto:${EMAIL}` + `?subject=${encodeURIComponent(assunto)}` + `&body=${encodeURIComponent(corpo)}`;
  });
}

/* ---------- Botão "Copiar e-mail" ---------- */
function iniciarCopiarEmail() {
  const botao = document.querySelector("#copiar-email");
  const texto = botao.querySelector(".botao-copiar__texto"); // troca só o texto, o ícone fica
  const status = document.querySelector("#copiar-status"); // aviso para leitores de tela
  const textoOriginal = texto.textContent;
  let temporizador;

  botao.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      texto.textContent = "Copiado!";
      status.textContent = "E-mail copiado para a área de transferência.";
      botao.classList.add("botao-copiar--copiado");
    } catch {
      // Sem permissão para a área de transferência: seleciona o e-mail para a pessoa copiar
      const link = document.querySelector(".email-visivel a");
      window.getSelection().selectAllChildren(link);
      texto.textContent = "Selecione e copie o e-mail";
      status.textContent = "Não foi possível copiar. O e-mail foi selecionado para você copiar.";
    }

    // Volta ao normal depois de 2 segundos (cliques seguidos reiniciam a contagem)
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      texto.textContent = textoOriginal;
      status.textContent = "";
      botao.classList.remove("botao-copiar--copiado");
    }, 2000);
  });
}
