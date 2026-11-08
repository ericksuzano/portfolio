// Animações com GSAP + ScrollTrigger + SplitText.
// Tudo que se mexe fica dentro do matchMedia: quem ativou "reduzir movimento" no sistema
// vê o site completo, só com fades, sem deslocamentos nem parallax.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { iniciarIntro } from "./intro.js";

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE = "power3.out";

// Peças do Início que entram em sequência
const PECAS_INICIO = ".hero__nome, .hero__regua, .hero__texto > *, .hero__meta li, .hero__acoes > *";

export function iniciarAnimacoes() {
  const mm = gsap.matchMedia();

  // Esconde o conteúdo do Início já no carregamento, para ele não "piscar" antes da animação
  gsap.set(PECAS_INICIO, { autoAlpha: 0 });

  /* ================= Movimento completo ================= */
  mm.add("(prefers-reduced-motion: no-preference)", (contexto) => {
    let ativo = true;
    let entradaDoInicio = null;
    let telaLigou = false;

    // A intro do computador começa já (sem esperar as fontes), para a cena aparecer rápido.
    // A entrada do Início toca quando a tela do computador liga.
    const desfazerIntro = iniciarIntro({
      aoLigar: () => {
        telaLigou = true;
        entradaDoInicio?.play();
      },
    });

    // O SplitText precisa das fontes finais para medir as letras certo.
    // contexto.add registra o que for criado depois, para o matchMedia conseguir desfazer.
    document.fonts.ready.then(() => {
      if (!ativo) return;
      contexto.add(() => {
        entradaDoInicio = animarInicio();
        // Sem intro, toca ao carregar; com intro, só quando a tela liga
        if (!desfazerIntro || telaLigou) entradaDoInicio.play();

        revelarAoRolar({ y: 40 });
        animarMarcaTexto();
        animarParallax({ comIntro: Boolean(desfazerIntro) });

        // Recalcula as posições dos gatilhos depois que as fontes mudaram a altura do texto
        ScrollTrigger.refresh();
      });
    });

    return () => {
      ativo = false;
      desfazerIntro?.();
    };
  });

  /* ================= Movimento reduzido: só fade, sem intro ================= */
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.to(PECAS_INICIO, { autoAlpha: 1, duration: 0.6, stagger: 0.06 });
    revelarAoRolar({ y: 0 });
  });
}

/* ---------- Início: letras do nome sobem, a régua se desenha e as informações entram ----------
   (timeline pausada; quem chama dá o play) */
function animarInicio() {
  const nome = new SplitText(".hero__nome", { type: "chars" });
  // O SplitText põe o texto original num aria-label (leitores de tela leem o nome inteiro,
  // não letra por letra); aqui só tiramos as quebras de linha do HTML
  const titulo = document.querySelector(".hero__nome");
  titulo.setAttribute("aria-label", titulo.getAttribute("aria-label").replace(/\s+/g, " ").trim());
  const oculto = { y: 24, autoAlpha: 0 };
  const visivel = { y: 0, autoAlpha: 1, duration: 0.7 };

  // fromTo (e não from): o estado atual já é "invisível" por causa do gsap.set inicial
  return gsap
    .timeline({ paused: true, defaults: { ease: EASE } })
    .set(".hero__nome", { autoAlpha: 1 }) // o título aparece; quem anima são as letras
    .fromTo(nome.chars, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.03, duration: 0.8 }, 0)
    // A régua se desenha da esquerda para a direita, embaixo do nome
    .fromTo(".hero__regua", { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 1.1, ease: "power3.inOut" }, 0.35)
    .fromTo(".hero__texto > *, .hero__meta li", oculto, { ...visivel, stagger: 0.07 }, 0.65)
    // clearProps devolve o transform ao CSS, senão o hover do botão (subir 2px) não funciona
    .fromTo(".hero__acoes > *", oculto, { ...visivel, stagger: 0.08, clearProps: "transform" }, 0.9);
  // Ao sair do matchMedia (ex.: ativou "reduzir movimento"), o próprio contexto do GSAP
  // desfaz o SplitText e devolve o texto original
}

/* ---------- Títulos, textos e cards (data-reveal) sobem com fade ao entrar na tela ---------- */
function revelarAoRolar({ y }) {
  gsap.set("[data-reveal]", { autoAlpha: 0, y });

  ScrollTrigger.batch("[data-reveal]", {
    start: "top 85%",
    once: true,
    onEnter: (elementos) =>
      gsap.to(elementos, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: EASE,
        stagger: 0.1,
        // Devolve o transform ao CSS: sem isso, o hover dos cards (subir 6px) para de funcionar
        clearProps: "transform",
      }),
  });
}

/* ---------- Marca-texto: a faixa amarela cresce atrás da palavra-chave ---------- */
function animarMarcaTexto() {
  gsap.utils.toArray(".marca-texto").forEach((el) => {
    const noParagrafo = el.closest("p") !== null;

    // Nos títulos a faixa ocupa 40% da altura (como no briefing). No texto corrido ela cobre
    // a palavra inteira e o texto escurece junto, para continuar legível em cima do amarelo.
    const de = noParagrafo
      ? { backgroundSize: "0% 100%", color: "#f4f1ea" }
      : { backgroundSize: "0% 40%" };
    const para = noParagrafo
      ? { backgroundSize: "100% 100%", color: "#0b0b0c" }
      : { backgroundSize: "100% 40%" };

    gsap.fromTo(el, de, {
      ...para,
      duration: 0.8,
      ease: "power2.out",
      delay: 0.3, // espera o título ou o parágrafo terminar de subir
      scrollTrigger: { trigger: el, start: "top 80%", once: true },
    });
  });
}

/* ---------- Parallax do Início: quanto maior o data-speed, mais longe a camada parece ---------- */
function animarParallax({ comIntro }) {
  // Com a intro, o Início só começa a sair da tela quando a intro termina (a cena "desgruda")
  const gatilho = comIntro
    ? { trigger: ".intro", start: "bottom bottom", end: "bottom top" }
    : { trigger: ".hero", start: "top top", end: "bottom top" };

  gsap.utils.toArray("[data-speed]").forEach((camada) => {
    gsap.to(camada, {
      yPercent: Number(camada.dataset.speed) * 40,
      ease: "none",
      scrollTrigger: { ...gatilho, scrub: true },
    });
  });
}
