// Intro do computador.
// A página abre com um computador de tela desligada. Ao rolar, a tela liga e a "câmera"
// se aproxima até a tela do computador preencher a janela e virar o próprio site.
//
// O truque: o grupo .monitor tem o tamanho exato da janela, então na escala 1 a tela É a janela.
// No começo o grupo está reduzido (scale) e a rolagem o traz de volta à escala 1. Como a tela
// mostra o Início de verdade (não uma imagem), a passagem para o site não tem corte.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const html = document.documentElement;

/** Posição de rolagem em que a intro termina e o site começa (0 quando não há intro). */
export function inicioDoSite() {
  const intro = document.querySelector(".intro");
  const cena = document.querySelector(".intro__cena");
  if (!html.classList.contains("com-intro") || !intro || !cena) return 0;
  return intro.offsetTop + intro.offsetHeight - cena.offsetHeight;
}

/**
 * Monta a intro. Retorna uma função de limpeza, ou null se a intro não deve existir.
 * @param {{ aoLigar: () => void }} opcoes aoLigar roda quando a tela liga pela primeira vez
 */
export function iniciarIntro({ aoLigar }) {
  const intro = document.querySelector(".intro");

  // A rede de segurança do <head> desistiu da intro (JS demorou demais): fica o site normal
  if (!intro || html.classList.contains("sem-intro")) return null;

  html.classList.add("com-intro", "intro-em-andamento");

  const monitor = intro.querySelector(".monitor");
  const tela = intro.querySelector(".monitor__tela");
  const corpo = intro.querySelector(".monitor__corpo");
  const base = intro.querySelector(".monitor__base");
  const ehRetrato = () => window.matchMedia("(orientation: portrait)").matches;

  /* ---------- Medidas: escala e posição iniciais para o computador caber na cena ---------- */
  let medidas = null;

  function medir() {
    // offsetTop/offsetHeight ignoram o transform, então dá para medir com o zoom aplicado
    const largura = monitor.offsetWidth;
    const altura = monitor.offsetHeight;
    const topo = corpo.offsetTop; // negativo: a moldura fica acima da tela
    const baseVisivel = base.offsetParent !== null; // no celular a base não existe
    const fundo = Math.max(corpo.offsetTop + corpo.offsetHeight, baseVisivel ? base.offsetTop + base.offsetHeight : 0);
    const retrato = ehRetrato();

    // Ocupa no máximo ~74% da largura e ~64% da altura da cena (no celular, um pouco mais alto)
    const escala = Math.min(
      ((retrato ? 0.64 : 0.74) * largura) / corpo.offsetWidth,
      ((retrato ? 0.7 : 0.64) * altura) / (fundo - topo),
    );

    // Centraliza o aparelho inteiro (com pé e base), um pouco acima do meio para a dica caber embaixo
    const centroAparelho = (topo + fundo) / 2;
    const y = altura * (retrato ? 0.48 : 0.47) - altura / 2 - escala * (centroAparelho - altura / 2);

    return {
      escala,
      y,
      rotacao: retrato ? -5 : 0, // o celular começa levemente inclinado
      raio: retrato ? 0.07 * largura : 0, // cantos arredondados da tela do celular
    };
  }

  const m = () => (medidas ??= medir());
  const limparMedidas = () => (medidas = null);
  ScrollTrigger.addEventListener("refreshInit", limparMedidas);

  /* ---------- Liga e desliga a tela ---------- */
  let ligada = false;
  let jaLigou = false;

  function atualizarEstado(progresso) {
    const ligar = progresso > 0.004; // um toque de rolagem já liga
    if (ligar !== ligada) {
      ligada = ligar;
      intro.classList.toggle("intro--ligada", ligar);
      if (ligar && !jaLigou) {
        jaLigou = true;
        aoLigar();
      }
    }
    // A navbar aparece quando a tela já preencheu a janela
    html.classList.toggle("intro-em-andamento", progresso < 0.985);
  }

  /* ---------- Zoom ligado à rolagem ---------- */
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: intro,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6, // pequena suavização: o zoom "alcança" a rolagem
      invalidateOnRefresh: true, // recalcula as medidas quando a janela muda de tamanho
      onUpdate: (self) => atualizarEstado(self.progress),
      onRefresh: (self) => atualizarEstado(self.progress),
    },
  });

  tl.to(".intro__hud", { autoAlpha: 0, duration: 0.12 }, 0)
    .fromTo(
      monitor,
      { scale: () => m().escala, y: () => m().y, rotation: () => m().rotacao },
      // force3D: false mantém o transform 2D: o navegador redesenha o texto a cada escala,
      // e ele chega nítido ao tamanho real (com 3D ele seria ampliado como uma imagem borrada)
      { scale: 1, y: 0, rotation: 0, ease: "power2.inOut", duration: 1, force3D: false },
      0,
    )
    // Cantos arredondados do celular somam no fim, quando a tela encosta nas bordas da janela
    .fromTo(tela, { borderRadius: () => m().raio }, { borderRadius: 0, duration: 0.3, ease: "power1.in" }, 0.7)
    .to(".monitor__reflexo", { autoAlpha: 0, duration: 0.3 }, 0.55);

  /* ---------- Atalhos ---------- */
  const irParaOSite = (comportamento) => window.scrollTo({ top: inicioDoSite(), behavior: comportamento });

  // "Pular intro" e clique na tela desligada: a rolagem suave passa pelo zoom rapidinho
  const pular = () => irParaOSite("smooth");
  const botaoPular = intro.querySelector(".intro__pular");
  const vidro = intro.querySelector(".monitor__vidro");
  botaoPular.addEventListener("click", pular);
  vidro.addEventListener("click", pular);

  // Navegando pelo teclado: se o foco entrar no Início durante a intro, vai direto para o site
  const hero = intro.querySelector(".hero");
  const aoFocar = () => {
    if (html.classList.contains("intro-em-andamento")) irParaOSite("instant");
  };
  hero.addEventListener("focusin", aoFocar);

  // Tudo posicionado: a cena aparece (com fade, ver CSS)
  html.classList.add("intro-pronta");

  /* ---------- Limpeza (ex.: a pessoa ativou "reduzir movimento" com a página aberta) ---------- */
  return () => {
    ScrollTrigger.removeEventListener("refreshInit", limparMedidas);
    botaoPular.removeEventListener("click", pular);
    vidro.removeEventListener("click", pular);
    hero.removeEventListener("focusin", aoFocar);
    intro.classList.remove("intro--ligada");
    html.classList.remove("com-intro", "intro-em-andamento", "intro-pronta");
  };
}
