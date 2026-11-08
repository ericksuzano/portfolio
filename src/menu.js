// Navbar e menu mobile.
// Ficam fora do matchMedia de "reduzir movimento" porque precisam funcionar para todo mundo;
// para quem pediu menos movimento, o menu só aparece com fade, sem deslocamento.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { inicioDoSite } from "./intro.js";

gsap.registerPlugin(ScrollTrigger);

const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function iniciarMenu() {
  iniciarMenuMobile();
  iniciarNavbar();
  iniciarLinkAtivo();
  iniciarVoltarTopo();
}

/* ---------- Botão flutuante "voltar ao topo": aparece quando o footer entra na tela ---------- */
function iniciarVoltarTopo() {
  const botao = document.querySelector(".voltar-topo");

  ScrollTrigger.create({
    trigger: ".footer",
    start: "top bottom", // o topo do footer chegou na parte de baixo da tela
    onToggle: ({ isActive }) => botao.classList.toggle("voltar-topo--visivel", isActive),
  });
}

/* ---------- Menu mobile em tela cheia ---------- */
function iniciarMenuMobile() {
  const nav = document.querySelector(".nav");
  const botao = document.querySelector(".menu-botao");
  const menu = document.querySelector(".menu-mobile");
  const links = menu.querySelectorAll("a");
  // Enquanto o menu está aberto, o resto da página fica inacessível ao Tab e a leitores de tela
  const fundo = document.querySelectorAll("main, footer");
  const estaAberto = () => botao.getAttribute("aria-expanded") === "true";

  // Timeline pausada: play() abre, reverse() fecha
  const animacaoMenu = gsap
    .timeline({ paused: true })
    .to(menu, { autoAlpha: 1, duration: 0.3, ease: "power2.out" })
    .from(
      links,
      { y: reduzirMovimento ? 0 : 40, autoAlpha: 0, stagger: 0.06, duration: 0.4, ease: "power3.out" },
      "-=0.1",
    )
    // Só dá para focar um link depois que ele aparece; o "if" ignora a passagem do reverse()
    .call(() => estaAberto() && links[0].focus({ preventScroll: true }), null, 0.25);

  function alternarMenu(abrir) {
    botao.setAttribute("aria-expanded", String(abrir));
    document.body.classList.toggle("sem-scroll", abrir);
    nav.classList.toggle("nav--menu-aberto", abrir);
    fundo.forEach((el) => (el.inert = abrir));

    abrir ? animacaoMenu.play() : animacaoMenu.reverse();
  }

  botao.addEventListener("click", () => alternarMenu(!estaAberto()));

  // Clicar num link fecha o menu (o navegador segue para a seção normalmente)
  links.forEach((link) => link.addEventListener("click", () => alternarMenu(false)));

  // Esc fecha o menu e devolve o foco ao botão
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && estaAberto()) {
      alternarMenu(false);
      botao.focus();
    }
  });

  // Se a tela crescer até o layout de desktop com o menu aberto, fecha
  window.matchMedia("(min-width: 768px)").addEventListener("change", (e) => {
    if (e.matches && estaAberto()) alternarMenu(false);
  });
}

/* ---------- Navbar: sólida depois de 80px; some ao descer e volta ao subir ---------- */
function iniciarNavbar() {
  const nav = document.querySelector(".nav");

  // A rolagem conta a partir de onde o site começa (depois da intro do computador, se houver)
  const rolagemNoSite = (rolagem) => rolagem - inicioDoSite();

  // Estado inicial (ex.: a página recarregou no meio da rolagem)
  nav.classList.toggle("nav--solida", rolagemNoSite(window.scrollY) > 80);

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const rolagem = rolagemNoSite(self.scroll());
      nav.classList.toggle("nav--solida", rolagem > 80);
      nav.classList.toggle("nav--escondida", self.direction === 1 && rolagem > 400);
    },
  });
}

/* ---------- Link ativo: destaca em amarelo a seção que está no meio da tela ---------- */
function iniciarLinkAtivo() {
  // A seção do Início (a intro) indica o link pelo data-link; as outras, pelo próprio id
  document.querySelectorAll("main > section").forEach((secao) => {
    const id = secao.dataset.link || secao.id;
    const links = document.querySelectorAll(`.nav__links a[href="#${id}"], .menu-mobile a[href="#${id}"]`);

    ScrollTrigger.create({
      trigger: secao,
      start: "top center",
      end: "bottom center",
      onToggle: ({ isActive }) => {
        links.forEach((link) => {
          if (isActive) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      },
    });
  });
}
