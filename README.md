# ATURP - Guia Turistico de Pancas

Portal turistico da Associacao de Turismo de Pancas (ATURP), criado para apresentar Pancas/ES e organizar informacoes uteis para visitantes. O site reune hospedagens, gastronomia, experiencias, servicos locais, eventos, galeria e guia rapido em uma aplicacao PHP com painel administrativo.

## Visao Geral

O projeto combina paginas publicas, APIs JSON e um painel administrativo para manter o conteudo do portal. A parte publica e responsiva e foi estruturada para facilitar navegacao por categorias, consulta de detalhes e descoberta de eventos e atrativos.

## Recursos

- Home com destaques, agenda de eventos, galeria e atalhos para secoes principais.
- Diretorios publicos para hospedagem, gastronomia, servicos, experiencias e outros itens.
- Paginas dinamicas de detalhe para itens e eventos.
- Agenda de eventos publicada por API JSON.
- Galeria principal e galerias vinculadas a entidades.
- Painel administrativo para categorias, itens, eventos, fotos, galeria e uploads.
- APIs administrativas com sessoes, CSRF, validacao de entrada e respostas JSON padronizadas.
- Tratamento de HTML, URLs, caminhos de imagem e SVGs para reduzir riscos comuns de conteudo dinamico.

## Tecnologias

- PHP com PDO
- MySQL ou MariaDB
- JavaScript vanilla
- HTML5
- CSS3
- Apache com suporte a `.htaccess`

Extensoes PHP usadas pelo projeto:

- `pdo_mysql`
- `gd`
- `fileinfo`
- `mbstring` recomendado

## Estrutura do Projeto

```text
ATURP/
|-- admin/
|   |-- api/                 # APIs do painel administrativo
|   |-- assets/              # CSS e JS do painel
|   |-- includes/            # Sessao e protecoes do admin
|   |-- index.php            # Painel administrativo
|   `-- login.php            # Login do painel
|-- api/
|   |-- legacy_itens.php     # API de compatibilidade para itens
|   |-- public_eventos.php   # Eventos publicados em JSON
|   `-- public_servicos.php  # Servicos publicados em JSON
|-- assets/                  # Imagens, logos, icones e midias publicas
|-- config/                  # Configuracao local do banco
|-- css/                     # Estilos publicos por pagina e componentes
|-- includes/                # Header, footer, breadcrumb e seguranca
|-- js/                      # Scripts publicos por pagina
|-- uploads/                 # Arquivos enviados pelo painel em ambiente local/producao
|-- categoria.php            # Listagem por categoria
|-- detalhe.php              # Detalhe dinamico
|-- eventos.php              # Agenda de eventos
|-- galeria.php              # Galeria principal
|-- guia-rapido.php          # Guia rapido do visitante
|-- index.php                # Home
|-- o-que-fazer.php          # Experiencias e atrativos
|-- onde-comer.php           # Gastronomia
|-- onde-ficar.php           # Hospedagem
|-- servicos.php             # Servicos locais
`-- README.md
```

## Configuracao Local

1. Configure um ambiente com Apache, PHP e MySQL/MariaDB.
2. Crie um banco de dados para o projeto.
3. Crie `config/database.php` com as credenciais do seu ambiente local.
4. Importe o esquema de banco correspondente ao ambiente de desenvolvimento.
5. Aponte o servidor web para a raiz do projeto.

Exemplo de estrutura esperada para `config/database.php`:

```php
<?php

define('DB_HOST', '127.0.0.1');
define('DB_USER', 'seu_usuario');
define('DB_PASS', 'sua_senha');
define('DB_NAME', 'seu_banco');

function getDbConnection(): PDO
{
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    return new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}
```

Com o servidor embutido do PHP:

```bash
php -S localhost:8000
```

Rotas uteis para desenvolvimento:

- `http://localhost:8000/`
- `http://localhost:8000/admin/login.php`
- `http://localhost:8000/onde-ficar.php`
- `http://localhost:8000/onde-comer.php`
- `http://localhost:8000/o-que-fazer.php`
- `http://localhost:8000/eventos.php`
- `http://localhost:8000/servicos.php`

## Painel Administrativo

O painel fica em `admin/` e permite gerenciar:

- categorias
- hospedagens
- gastronomia
- servicos
- experiencias
- outros itens
- eventos
- galeria principal
- fotos de entidades

As APIs do painel ficam em `admin/api/` e usam sessao administrativa, token CSRF para escrita, validacao de dados e respostas JSON consistentes.

## APIs Publicas

- `api/public_eventos.php`: retorna eventos ativos e nao removidos.
- `api/public_servicos.php`: retorna servicos ativos consumidos pelas paginas publicas.
- `api/legacy_itens.php`: mantem compatibilidade com o formato legado de itens.

## Seguranca e Dados Locais

Este repositorio nao deve conter credenciais reais, dumps de banco, backups, arquivos enviados por usuarios ou configuracoes sensiveis de producao. Mantenha esses dados fora do versionamento.

Antes de publicar uma instalacao em producao, revise:

- credenciais do banco de dados
- usuario administrador inicial
- permissoes da pasta de uploads
- HTTPS e configuracoes do servidor
- limites de upload e validacao de midia
- backups e rotinas de recuperacao

## Versionamento

Arquivos como `config/database.php`, uploads, dumps, backups, logs e variaveis de ambiente devem permanecer ignorados pelo Git. O repositorio publico deve conter apenas codigo-fonte, assets publicos e documentacao necessaria para desenvolvimento e manutencao.
