// Carrossel de projetos.
// O deslize é nativo (scroll-snap no CSS): dedo, trackpad e teclado já funcionam sozinhos.
// Aqui ficam os botões anterior/próximo, o contador "01 / 04" e a barra de progresso.

const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

export function iniciarCarrossel() {
  const carrossel = document.querySelector(".carrossel");
  if (!carrossel) return;

  const trilho = carrossel.querySelector(".carrossel__trilho");
  const slides = [...trilho.children];
  const atual = carrossel.querySelector(".carrossel__atual");
  const total = carrossel.querySelector(".carrossel__total");
  const barra = carrossel.querySelector(".carrossel__barra");
  const [anterior, proximo] = carrossel.querySelectorAll(".carrossel__botao");

  const doisDigitos = (n) => String(n).padStart(2, "0");
  total.textContent = doisDigitos(slides.length);

  // Distância de um slide para o outro (largura do card + espaço entre eles)
  const passo = () => (slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : trilho.clientWidth);

  function indiceAtual() {
    const maximo = trilho.scrollWidth - trilho.clientWidth;
    if (trilho.scrollLeft >= maximo - 2) return slides.length - 1; // chegou ao fim
    return Math.round(trilho.scrollLeft / passo());
  }

  let indice = -1;
  function atualizar() {
    const novo = indiceAtual();
    if (novo === indice) return;
    indice = novo;
    atual.textContent = doisDigitos(indice + 1);
    barra.style.transform = `scaleX(${(indice + 1) / slides.length})`;
    anterior.disabled = indice === 0;
    proximo.disabled = indice === slides.length - 1;
  }

  function irPara(novoIndice) {
    const alvo = Math.max(0, Math.min(slides.length - 1, novoIndice));
    trilho.scrollTo({ left: slides[alvo].offsetLeft - slides[0].offsetLeft, behavior: reduzirMovimento.matches ? "auto" : "smooth" });
  }

  anterior.addEventListener("click", () => irPara(indice - 1));
  proximo.addEventListener("click", () => irPara(indice + 1));

  // Atualiza no máximo uma vez por quadro enquanto desliza
  let agendado = false;
  trilho.addEventListener(
    "scroll",
    () => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(() => {
        agendado = false;
        atualizar();
      });
    },
    { passive: true },
  );
  window.addEventListener("resize", () => {
    indice = -1;
    atualizar();
  });

  atualizar();
}
