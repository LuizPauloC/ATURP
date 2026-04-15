# 🚧 EM DESENVOLVIMENTO

# 🌎 ATURP - Pancas Guia Turístico

Um site institucional e responsivo para a Associação de Turismo de Pancas (ATURP), com uma home editorial sobre o destino e uma página dedicada de hospedagem com filtros por categoria.

## ✨ Características

- 📱 **Design Responsivo** - Otimizado para dispositivos mobile, tablet e desktop
- 🎨 **Interface Moderna** - Layout focado em turismo, navegação rápida e destaque visual para Pancas
- 🧭 **Navegação Client-side** - Smooth scroll na home e menu lateral/modal com interações em JavaScript
- 🏨 **Hospedagem com Filtros** - Página `Onde Ficar` renderizada a partir de JSON local com categorias e CTAs externos

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica das páginas
- **CSS3** - Estilização responsiva, layout e componentes visuais
- **JavaScript** - Scroll suave, menu modal, filtros e renderização dinâmica dos cards
- **JSON** - Fonte de dados local da página `Onde Ficar`

## 📁 Estrutura do Projeto

```
ATURP/
├── assets/
│   └── img/               # Imagens do projeto
├── css/                   # Estilos globais, home, modal e hospedagem
├── js/                    # Scripts de navegação, modal e renderização
├── json/                  # Dados locais consumidos no navegador
├── pages/
│   └── onde-ficar.html    # Página de hospedagem
├── index.html             # Página principal
└── README.md              # Documentação
```

## ▶️ Execução Local

Para testar a página `pages/onde-ficar.html`, sirva o projeto por um servidor local HTTP. Abrir os arquivos diretamente via `file://` pode impedir o carregamento de `json/onde-ficar.json` por causa do `fetch()`.
