import { defineConfig } from "vite";

// base "./" gera caminhos relativos: o site funciona tanto na raiz de um domínio
// quanto numa subpasta, como no GitHub Pages (ericksuzano.github.io/nome-do-repo/).
export default defineConfig({
  base: "./",
});
