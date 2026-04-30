# 🚧 EM DESENVOLVIMENTO

# 🌎 ATURP - Pancas Guia Turístico

Site institucional e responsivo para a Associação de Turismo de Pancas (ATURP), com foco em apresentar Pancas/ES, orientar visitantes e reunir atalhos práticos de turismo, hospedagem e gastronomia.

O projeto é um site estático multipágina: não há backend, etapa de build, banco de dados ou dependências instaláveis no estado atual.

## ✨ Características

- 📱 **Design responsivo** - Layout adaptado para mobile, tablet e desktop.
- 🧭 **Navegação client-side** - Smooth scroll por `data-scroll` e menu lateral/modal reutilizado nas páginas.
- 🏞️ **Home editorial** - Destaques de Pancas, Monumento Natural dos Pontões, experiências e atalhos para os guias.
- ⚡ **Guia Rápido** - Página com atalhos para comer, se hospedar, ver atrações e consultar dicas essenciais da viagem.
- 🏨 **Onde Ficar** - Diretório de hospedagens renderizado a partir de `json/onde-ficar.json`, com filtros por categoria.
- 🍽️ **Onde Comer** - Diretório de gastronomia renderizado a partir de `json/onde-comer.json`, com filtros por refeição e tipo de estabelecimento.

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica das páginas.
- **CSS3** - Estilos globais, temas de página, cards compartilhados, responsividade e estados visuais.
- **JavaScript vanilla** - Loading inicial, smooth scroll, menu modal, filtros, renderização dinâmica e acordeões.
- **JSON local** - Fonte de dados dos diretórios `Onde Ficar` e `Onde Comer`.

## 📄 Páginas

- `index.html` - Página principal com apresentação de Pancas, guia rápido, experiências, contatos e navegação.
- `pages/guia-rapido.html` - Guia do turista com atalhos, três experiências essenciais e acordeões de orientação.
- `pages/onde-ficar.html` - Diretório de hospedagem com filtros `Todos`, `Hotel`, `Pousada` e `Camping`.
- `pages/onde-comer.html` - Diretório gastronômico com filtros por momento da refeição e tipo de estabelecimento.

## 📁 Estrutura do Projeto

```text
ATURP/
├── assets/
│   ├── branding/          # Logo e identidade visual
│   ├── cards/             # Imagens de cards e experiências
│   ├── food/              # Imagens de gastronomia
│   ├── hero/              # Imagens de destaque das páginas
│   ├── icons/             # Ícones rasterizados usados na interface
│   ├── landmarks/         # Pontos naturais e formações rochosas
│   ├── lodging/           # Imagens de hospedagem
│   ├── patterns/          # Padrões e texturas de fundo
│   ├── placeholders/      # Imagens auxiliares sem uso ativo
│   └── quick-guide/       # Imagens dos atalhos do Guia Rápido
├── codex/                 # Contexto e auditorias auxiliares para IA
├── css/
│   ├── main.css           # Tokens, layout base, header, botão de menu e footer
│   ├── nav-modal.css      # Menu lateral/modal
│   ├── directory-cards.css # Layout compartilhado dos diretórios
│   ├── index.css          # Estilos da home
│   ├── guia-rapido.css    # Estilos do Guia Rápido
│   ├── onde-ficar.css     # Tema da página Onde Ficar
│   └── onde-comer.css     # Tema da página Onde Comer
├── js/
│   ├── script.js          # Loading inicial e smooth scroll
│   ├── nav-modal.js       # Abertura, fechamento e acessibilidade do menu modal
│   ├── guia-rapido.js     # Acordeões animados do Guia Rápido
│   ├── onde-ficar.js      # Fetch, filtros e cards de hospedagem
│   └── onde-comer.js      # Fetch, filtros e cards de gastronomia
├── json/
│   ├── onde-ficar.json    # Dados locais de hospedagem
│   └── onde-comer.json    # Dados locais de gastronomia
├── pages/
│   ├── guia-rapido.html
│   ├── onde-ficar.html
│   └── onde-comer.html
├── index.html
└── README.md
```

## ▶️ Execução Local

Sirva a raiz do projeto por HTTP antes de testar as páginas que usam `fetch()`:

```bash
python -m http.server 8000
```

Depois acesse:

- `http://localhost:8000/`
- `http://localhost:8000/pages/guia-rapido.html`
- `http://localhost:8000/pages/onde-ficar.html`
- `http://localhost:8000/pages/onde-comer.html`

Abrir os arquivos diretamente via `file://` pode impedir o carregamento de `json/onde-ficar.json` e `json/onde-comer.json`.

## 📌 Estado Atual

- O conteúdo de hospedagem e gastronomia está em JSON local provisório.
- O telefone de turismo usado no rodapé e no guia rápido é placeholder: `(27) 12345-6789`.