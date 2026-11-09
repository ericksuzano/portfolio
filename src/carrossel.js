// Carrossel de projetos: esteira contínua, de ponta a ponta da tela, em loop infinito.
//
// Como funciona: os cards são duplicados (cópias escondidas de leitores de tela e do teclado)
// e o trilho anda para a esquerda sem parar. Quando anda a largura de um conjunto inteiro,
// volta a posição em exatamente essa largura, e o salto não se vê.
//
// Pausa (desacelerando suave) com o mouse em cima, com o dedo na tela, com o foco do teclado,
// fora da tela ou com a aba em segundo plano. Dá para arrastar com o mouse ou o dedo.
// Com "reduzir movimento", nada disso liga: fica a fileira que se desliza manualmente (CSS).

const VELOCIDADE = 45; // pixels por segundo
const RETOMAR_APOS_TOQUE_MS = 2500;
const LIMIAR_ARRASTO = 6; // px: abaixo disso, é um clique normal

export function iniciarCarrossel() {
  const carrossel = document.querySelector(".carrossel");
  if (!carrossel) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const trilho = carrossel.querySelector(".carrossel__trilho");
  const originais = [...trilho.children];
  carrossel.classList.add("carrossel--continuo");

  /* ---------- Cópias para o loop ---------- */
  let larguraConjunto = 0;

  function montarCopias() {
    trilho.querySelectorAll("[data-copia]").forEach((el) => el.remove());

    // Uma cópia já basta para medir a largura exata de um conjunto (cards + espaços)
    const adicionarConjunto = () =>
      originais.forEach((card) => {
        const copia = card.cloneNode(true);
        copia.dataset.copia = "";
        // Escondida de leitores de tela e fora do Tab, mas ainda responde ao mouse e ao toque
        // (não usar "inert": ele também desliga o hover e os cliques)
        copia.setAttribute("aria-hidden", "true");
        copia.querySelectorAll("a, button").forEach((el) => el.setAttribute("tabindex", "-1"));
        trilho.append(copia);
      });

    adicionarConjunto();
    const primeiraCopia = trilho.querySelector("[data-copia]");
    larguraConjunto = primeiraCopia.offsetLeft - originais[0].offsetLeft;

    // Conjuntos suficientes para cobrir a tela inteira mais uma volta
    const necessarios = Math.ceil(window.innerWidth / larguraConjunto) + 1;
    for (let i = 1; i < necessarios; i++) adicionarConjunto();
  }

  montarCopias();

  /* ---------- Movimento ---------- */
  // Começa com o primeiro card alinhado à margem do conteúdo da página
  const margemInicial = () => Math.max(24, (window.innerWidth - 1200) / 2);
  let posicao = margemInicial();
  let velocidade = VELOCIDADE;
  let ultimoQuadro = performance.now();

  const pausas = { mouse: false, toque: false, foco: false, foraDaTela: true, arrasto: false };
  const pausado = () => document.hidden || Object.values(pausas).some(Boolean);

  // Mantém a posição dentro de um conjunto, para o loop nunca ter fim
  function normalizar() {
    while (posicao > 0) posicao -= larguraConjunto;
    while (posicao <= -larguraConjunto) posicao += larguraConjunto;
  }

  function aplicar() {
    trilho.style.transform = `translate3d(${posicao}px, 0, 0)`;
  }

  function quadro(agora) {
    const dt = Math.min((agora - ultimoQuadro) / 1000, 0.05); // evita saltos depois de trocar de aba
    ultimoQuadro = agora;

    // Para na hora ao pausar: enquanto o trilho desliza por baixo do cursor, o navegador adia
    // o hover dos cards e links. Só a volta ao movimento é suave.
    if (pausado()) velocidade = 0;
    else velocidade += (VELOCIDADE - velocidade) * Math.min(1, dt * 3);

    if (!pausas.arrasto && Math.abs(velocidade) > 0.05) {
      posicao -= velocidade * dt;
      normalizar();
      aplicar();
    }
    requestAnimationFrame(quadro);
  }

  normalizar();
  aplicar();
  requestAnimationFrame(quadro);

  /* ---------- Pausas ---------- */
  // Mouse em cima (só mouse: no toque, "enter" ficaria preso)
  carrossel.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") pausas.mouse = true;
  });
  carrossel.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") pausas.mouse = false;
  });

  // Foco do teclado: pausa e traz para a tela o card do link focado
  carrossel.addEventListener("focusin", (e) => {
    pausas.foco = true;
    const card = e.target.closest(".card");
    if (!card) return;
    const esquerda = card.offsetLeft + posicao;
    if (esquerda < 0 || esquerda + card.offsetWidth > window.innerWidth) {
      posicao = margemInicial() - card.offsetLeft;
      normalizar();
      aplicar();
    }
  });
  carrossel.addEventListener("focusout", (e) => {
    if (!carrossel.contains(e.relatedTarget)) pausas.foco = false;
  });

  // Só anda enquanto está visível na tela
  new IntersectionObserver(([entrada]) => (pausas.foraDaTela = !entrada.isIntersecting), {
    threshold: 0.2,
  }).observe(carrossel);

  /* ---------- Arrastar com o mouse ou o dedo ---------- */
  let inicioX = 0;
  let posicaoInicial = 0;
  let apertado = false;
  let arrastou = false;
  let retomarToque = null;

  trilho.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    apertado = true;
    arrastou = false;
    inicioX = e.clientX;
    posicaoInicial = posicao;
    if (e.pointerType !== "mouse") {
      clearTimeout(retomarToque);
      pausas.toque = true;
    }
  });

  trilho.addEventListener("pointermove", (e) => {
    if (!apertado) return;
    const dx = e.clientX - inicioX;
    if (!arrastou && Math.abs(dx) < LIMIAR_ARRASTO) return;
    if (!arrastou) {
      // Só "captura" o ponteiro quando vira arrasto, para os cliques nos links continuarem normais
      arrastou = true;
      pausas.arrasto = true;
      carrossel.classList.add("carrossel--arrastando");
      trilho.setPointerCapture(e.pointerId);
    }
    posicao = posicaoInicial + dx;
    normalizar();
    aplicar();
  });

  function soltar(e) {
    if (!apertado) return;
    apertado = false;
    pausas.arrasto = false;
    velocidade = 0; // depois de arrastar, volta a andar com aceleração suave
    carrossel.classList.remove("carrossel--arrastando");
    if (e.pointerType !== "mouse") {
      clearTimeout(retomarToque);
      retomarToque = setTimeout(() => (pausas.toque = false), RETOMAR_APOS_TOQUE_MS);
    }
  }
  trilho.addEventListener("pointerup", soltar);
  trilho.addEventListener("pointercancel", soltar);

  // Um arrasto não deve abrir o link que estava embaixo do dedo/mouse
  trilho.addEventListener(
    "click",
    (e) => {
      if (arrastou) {
        e.preventDefault();
        e.stopPropagation();
        arrastou = false;
      }
    },
    true,
  );

  /* ---------- Redimensionar a janela ---------- */
  let redimensionando = null;
  window.addEventListener("resize", () => {
    clearTimeout(redimensionando);
    redimensionando = setTimeout(() => {
      montarCopias();
      normalizar();
      aplicar();
    }, 150);
  });
}
