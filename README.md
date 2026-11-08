# Portfólio — Erick Suzano

Portfólio pessoal de **Erick Suzano**, desenvolvedor web e mobile no Rio de Janeiro. Página única com Início, Sobre, Projetos e Contato.

O site abre com um computador de tela desligada. Ao rolar, a tela liga e a câmera se aproxima até a tela virar o próprio site. No celular, o computador vira um celular.

**Site:** _em breve_ · **GitHub:** [github.com/ericksuzano](https://github.com/ericksuzano) · **LinkedIn:** [erick-suzano](https://www.linkedin.com/in/erick-suzano-367102266)

## Tecnologias

- **HTML, CSS e JavaScript puro**, sem framework. CSS com variáveis e JavaScript em módulos.
- **[Vite](https://vite.dev)** para o ambiente de desenvolvimento e o build.
- **[GSAP](https://gsap.com)** com ScrollTrigger e SplitText para as animações.
- **Google Fonts:** Archivo nos títulos, Manrope no texto e JetBrains Mono nos rótulos.
- **Ícones:** [Lucide](https://lucide.dev) e [Font Awesome Free](https://fontawesome.com), embutidos como sprite SVG.

## Como rodar

Requisito: Node.js 20.19+ ou 22.12+ (exigência do Vite 8).

```bash
npm install
npm run dev       # servidor local em http://localhost:5173
npm run build     # versão otimizada na pasta dist/
npm run preview   # testa a versão otimizada localmente
```

## Estrutura

```
portfolio/
├── index.html            todo o conteúdo do site (textos, projetos, links)
├── public/
│   ├── favicon.svg       monograma "ES"
│   └── img/              foto do Sobre e prints dos projetos
└── src/
    ├── main.js           ponto de entrada: importa os estilos e inicia os módulos
    ├── intro.js          intro do computador que liga e aproxima
    ├── animacoes.js      entrada do Início, revelação ao rolar, parallax
    ├── menu.js           navbar, menu mobile, link ativo e botão "voltar ao topo"
    ├── carrossel.js      carrossel de projetos
    ├── contato.js        formulário (mailto) e botão "Copiar e-mail"
    └── styles/
        ├── variaveis.css tokens: cores, fontes, tamanhos, espaçamentos
        ├── base.css      reset, tipografia, botões, links, acessibilidade
        └── secoes.css    estilos de cada seção
```

## Como editar o conteúdo

Todo o conteúdo fica no `index.html`.

| O quê | Onde |
|---|---|
| Nome, cargo, frase e status do Início | `index.html`, bloco `hero__conteudo` |
| Texto do Sobre | `index.html`, bloco `sobre__texto` |
| Foto do Sobre | salve em `public/img/` e troque o `src` da imagem; ela aparece em preto e branco |
| Projetos | `index.html`, cada `<article class="card">` (ver abaixo) |
| E-mail de contato | `index.html` (`mailto:`) e `src/contato.js` (`EMAIL`) |
| WhatsApp, LinkedIn e GitHub | `index.html`, lista `redes` no Contato |
| Currículo | salve o PDF como `public/curriculo-erick-suzano.pdf` |
| Cores, fontes e tamanhos | `src/styles/variaveis.css` |

### Adicionar ou trocar um projeto

Copie um `<article class="card">` inteiro dentro do carrossel e troque:

1. **Imagem:** print do projeto em 16:10, de preferência `.webp`, salvo em `public/img/`;
2. **Título e descrição:** de 2 a 4 linhas;
3. **Tags:** as tecnologias usadas;
4. **Links:** GitHub e, se existir, uma demo.

O contador e a barra de progresso do carrossel se ajustam sozinhos à quantidade de projetos.

## Recursos

- **Intro do computador:** a tela do computador é o Início de verdade, não uma imagem, por isso a passagem para o site não tem corte. Tem botão "Pular intro", e clicar na tela desligada também liga. Os links "Início" e "Voltar ao topo" levam direto ao site.
- **Animações:** as letras do nome sobem uma a uma e os títulos, textos e cards aparecem ao rolar. A palavra-chave dos títulos pulsa em amarelo e as camadas do fundo têm parallax.
- **Carrossel de projetos:** desliza com o dedo, o trackpad, as setas do teclado ou os botões, e cada projeto encaixa no lugar.
- **Contato sem servidor:** o formulário abre o aplicativo de e-mail de quem escreve com a mensagem pronta (`mailto`). O botão "Copiar e-mail" serve para quem não tem aplicativo de e-mail configurado.

## Acessibilidade

- HTML semântico em português (`lang="pt-BR"`), com textos alternativos e rótulos nos formulários.
- Navegação completa pelo teclado, com foco amarelo visível e o link "Pular para o conteúdo".
- Com **"reduzir movimento"** ativado no sistema, a intro e os deslocamentos são desligados e o site aparece completo, só com fades.
- Áreas de toque de no mínimo 44 px e contraste dentro do padrão WCAG AA.

## Publicar (Vercel)

1. Suba esta pasta para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com), escolha **Add New → Project** e importe o repositório. A Vercel detecta o Vite sozinha (build `npm run build`, saída `dist`).
3. A cada `git push`, o site é atualizado automaticamente.

## Licença

© Erick Suzano. Todos os direitos reservados. O código pode servir de referência; o conteúdo (textos, imagens e projetos) é pessoal.

Os ícones são do Lucide (licença ISC) e do Font Awesome Free (CC BY 4.0, com a atribuição no `index.html`).
