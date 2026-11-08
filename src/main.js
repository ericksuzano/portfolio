// Ponto de entrada do site: importa os estilos e inicia cada módulo.

import "./styles/variaveis.css";
import "./styles/base.css";
import "./styles/secoes.css";

import { iniciarMenu } from "./menu.js";
import { iniciarContato } from "./contato.js";
import { iniciarCarrossel } from "./carrossel.js";
import { iniciarAnimacoes } from "./animacoes.js";

// Footer: o ano do "©" se atualiza sozinho
document.querySelector("#ano").textContent = new Date().getFullYear();

iniciarMenu();
iniciarContato();
iniciarCarrossel();
iniciarAnimacoes();
