<?php
require_once __DIR__ . '/includes/session.php';
startAdminSession();

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$adminNome = $_SESSION['admin_nome'] ?? 'Admin';
$csrfToken = getAdminCsrfToken();
$adminAssetVersion = function ($path) {
    $filePath = __DIR__ . '/' . ltrim($path, './');
    return file_exists($filePath) ? filemtime($filePath) : '1';
};
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ATURP | Admin Panel</title>
    <!-- Modern Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/admin.css?v=<?= $adminAssetVersion('assets/admin.css') ?>">
</head>
<body class="dark-theme">
    <div class="app-container">
        <button type="button" class="mobile-menu-toggle" id="admin-menu-toggle" aria-controls="admin-sidebar" aria-expanded="false" aria-label="Abrir menu do painel">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <!-- Sidebar -->
        <aside class="sidebar glass-panel" id="admin-sidebar">
            <div class="sidebar-header">
                <img src="../assets/branding/aturp-logo-horizontal-transparent.png" alt="ATURP Logo" class="brand-logo">
                <span class="badge">Admin</span>
            </div>
            
            <nav class="sidebar-nav">
                <button class="nav-item active" data-target="dashboard-view">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                    Dashboard
                </button>
                <button class="nav-item" data-target="categories-view">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false"><path d="M128 464L512 464C520.8 464 528 456.8 528 448L528 208C528 199.2 520.8 192 512 192L362.7 192C345.4 192 328.5 186.4 314.7 176L276.3 147.2C273.5 145.1 270.2 144 266.7 144L128 144C119.2 144 112 151.2 112 160L112 448C112 456.8 119.2 464 128 464zM512 512L128 512C92.7 512 64 483.3 64 448L64 160C64 124.7 92.7 96 128 96L266.7 96C280.5 96 294 100.5 305.1 108.8L343.5 137.6C349 141.8 355.8 144 362.7 144L512 144C547.3 144 576 172.7 576 208L576 448C576 483.3 547.3 512 512 512z"/></svg>
                    Categorias
                </button>
                <button class="nav-item" data-target="items-view" data-item-context="hospedagens">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false"><path d="M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528 336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z"/></svg>
                    Hospedagens
                </button>
                <button class="nav-item" data-target="items-view" data-item-context="gastronomia">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false"><path d="M127.9 78.4C127.1 70.2 120.2 64 112 64C103.8 64 96.9 70.2 96 78.3L81.9 213.7C80.6 219.7 80 225.8 80 231.9C80 277.8 115.1 315.5 160 319.6L160 544C160 561.7 174.3 576 192 576C209.7 576 224 561.7 224 544L224 319.6C268.9 315.5 304 277.8 304 231.9C304 225.8 303.4 219.7 302.1 213.7L287.9 78.3C287.1 70.2 280.2 64 272 64C263.8 64 256.9 70.2 256.1 78.4L242.5 213.9C241.9 219.6 237.1 224 231.4 224C225.6 224 220.8 219.6 220.2 213.8L207.9 78.6C207.2 70.3 200.3 64 192 64C183.7 64 176.8 70.3 176.1 78.6L163.8 213.8C163.3 219.6 158.4 224 152.6 224C146.8 224 142 219.6 141.5 213.9L127.9 78.4zM512 64C496 64 384 96 384 240L384 352C384 387.3 412.7 416 448 416L480 416L480 544C480 561.7 494.3 576 512 576C529.7 576 544 561.7 544 544L544 96C544 78.3 529.7 64 512 64z"/></svg>
                    Gastronomia
                </button>
                <button class="nav-item" data-target="items-view" data-item-context="servicos">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false"><path d="M102.8 57.3C108.2 51.9 116.6 51.1 123 55.3L241.9 134.5C250.8 140.4 256.1 150.4 256.1 161.1L256.1 210.7L346.9 301.5C380.2 286.5 420.8 292.6 448.1 320L574.2 446.1C592.9 464.8 592.9 495.2 574.2 514L514.1 574.1C495.4 592.8 465 592.8 446.2 574.1L320.1 448C292.7 420.6 286.6 380.1 301.6 346.8L210.8 256L161.2 256C150.5 256 140.5 250.7 134.6 241.8L55.4 122.9C51.2 116.6 52 108.1 57.4 102.7L102.8 57.3zM247.8 360.8C241.5 397.7 250.1 436.7 274 468L179.1 563C151 591.1 105.4 591.1 77.3 563C49.2 534.9 49.2 489.3 77.3 461.2L212.7 325.7L247.9 360.8zM416.1 64C436.2 64 455.5 67.7 473.2 74.5C483.2 78.3 485 91 477.5 98.6L420.8 155.3C417.8 158.3 416.1 162.4 416.1 166.6L416.1 208C416.1 216.8 423.3 224 432.1 224L473.5 224C477.7 224 481.8 222.3 484.8 219.3L541.5 162.6C549.1 155.1 561.8 156.9 565.6 166.9C572.4 184.6 576.1 203.9 576.1 224C576.1 267.2 558.9 306.3 531.1 335.1L482 286C448.9 253 403.5 240.3 360.9 247.6L304.1 190.8L304.1 161.1L303.9 156.1C303.1 143.7 299.5 131.8 293.4 121.2C322.8 86.2 366.8 64 416.1 63.9z"/></svg>
                    Serviços
                </button>
                <button class="nav-item" data-target="items-view" data-item-context="experiencias">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false"><path d="M288.4 72.3C308 61.2 332 61.2 351.6 72.3L527.6 172C547.6 183.4 560 204.6 560 227.7L560 425.1C560 448.1 547.6 469.4 527.6 480.8L351.6 580.5C332 591.6 308 591.6 288.5 580.5L112.5 480.8C92.4 469.5 80 448.2 80 425.2L80 227.8C80 204.8 92.4 183.5 112.4 172.1L288.4 72.4zM166.6 219.6C157.8 216.5 147.8 219.9 142.8 228.2C137.8 236.5 139.6 246.9 146.4 253.2L149.6 255.6L299.8 345.8L299.8 494.5C299.8 505.5 308.8 514.5 319.8 514.5C330.8 514.5 339.8 505.5 339.8 494.5L339.8 345.8L490.1 255.6C499.6 249.9 502.7 237.6 497 228.2C491.3 218.8 479 215.7 469.6 221.3L319.9 311.1L170.2 221.3L166.5 219.6z"/></svg>
                    Experiências
                </button>
                <button class="nav-item" data-target="items-view" data-item-context="outros">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false"><path d="M320 64C331.2 64 341.7 69.9 347.4 79.5L443.4 239.5C449.3 249.4 449.5 261.7 443.8 271.7C438.1 281.7 427.5 288 416 288L224 288C212.5 288 201.8 281.8 196.2 271.8C190.6 261.8 190.7 249.5 196.6 239.6L292.6 79.6C298.3 69.9 308.8 64 320 64zM192 336C253.9 336 304 386.1 304 448C304 509.9 253.9 560 192 560C130.1 560 80 509.9 80 448C80 386.1 130.1 336 192 336zM392 352L504 352C526.1 352 544 369.9 544 392L544 504C544 526.1 526.1 544 504 544L392 544C369.9 544 352 526.1 352 504L352 392C352 369.9 369.9 352 392 352z"/></svg>
                    Outros itens
                </button>
                <button class="nav-item" data-target="events-view">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false"><path d="M224 64C206.3 64 192 78.3 192 96L192 128L160 128C124.7 128 96 156.7 96 192L96 240L544 240L544 192C544 156.7 515.3 128 480 128L448 128L448 96C448 78.3 433.7 64 416 64C398.3 64 384 78.3 384 96L384 128L256 128L256 96C256 78.3 241.7 64 224 64zM96 288L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 288L96 288z"/></svg>
                    Eventos
                </button>
                <button class="nav-item" data-target="gallery-view">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 640 640" fill="currentColor" aria-hidden="true" focusable="false"><path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM224 176C250.5 176 272 197.5 272 224C272 250.5 250.5 272 224 272C197.5 272 176 250.5 176 224C176 197.5 197.5 176 224 176zM368 288C376.4 288 384.1 292.4 388.5 299.5L476.5 443.5C481 450.9 481.2 460.2 477 467.8C472.8 475.4 464.7 480 456 480L184 480C175.1 480 166.8 475 162.7 467.1C158.6 459.2 159.2 449.6 164.3 442.3L220.3 362.3C224.8 355.9 232.1 352.1 240 352.1C247.9 352.1 255.2 355.9 259.7 362.3L286.1 400.1L347.5 299.6C351.9 292.5 359.6 288.1 368 288.1z"/></svg>
                    Galeria Principal
                </button>
            </nav>
            
            <div class="sidebar-footer">
                <div class="user-profile">
                    <div class="avatar"><?= htmlspecialchars(strtoupper(substr($adminNome, 0, 1))) ?></div>
                    <div class="user-info">
                        <span class="user-name"><?= htmlspecialchars($adminNome) ?></span>
                        <span class="user-role">Super Admin</span>
                    </div>
                </div>
                <button id="logout-btn" class="logout-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Dynamic Views Container -->
            <div id="views-container">
                <!-- Dashboard View -->
                <section id="dashboard-view" class="view-section active">
                    <header class="view-header">
                        <h1 class="gradient-text">Bem-vindo ao ATURP Admin</h1>
                        <p class="subtitle">Gerencie o conteúdo do seu portal de forma rápida e fluida.</p>
                    </header>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon category-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                            <div class="stat-details">
                                <h3>Categorias</h3>
                                <p class="stat-number" id="stat-categories">--</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon items-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                            </div>
                            <div class="stat-details">
                                <h3>Comércios e Itens</h3>
                                <p class="stat-number" id="stat-items">--</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Categorias View -->
                <section id="categories-view" class="view-section">
                    <header class="view-header flex-between">
                        <div>
                            <h2>Gestão de Categorias</h2>
                            <p class="subtitle">Organize os grupos do seu portal</p>
                        </div>
                        <button class="btn btn-primary" id="btn-new-category">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Nova Categoria
                        </button>
                    </header>
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th><div style="display: flex; align-items: center; gap: 4px;">Nome <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div></th>
                                    <th><div style="display: flex; align-items: center; gap: 4px;">Tipo <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div></th>
                                    <th><div style="display: flex; align-items: center; gap: 4px;">Ordem <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div></th>
                                    <th><div style="display: flex; align-items: center; gap: 4px;">Status <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div></th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="categories-tbody">
                                <!-- Preenchido via JS -->
                            </tbody>
                        </table>
                    </div>
                </section>
                
                <!-- Items View Placeholder -->
                <section id="items-view" class="view-section">
                    <header class="view-header flex-between">
                        <div>
                            <h2 id="item-context-title">Hospedagens</h2>
                            <p class="subtitle" id="item-context-subtitle">Gerencie hospedagens cadastradas no site</p>
                        </div>
                        <button class="btn btn-primary" id="btn-new-item">
                            Nova Publicação
                        </button>
                    </header>
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Capa</th>
                                    <th><div style="display: flex; align-items: center; gap: 4px;">Título <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div></th>
                                    <th><div style="display: flex; align-items: center; gap: 4px;">Tipo <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div></th>
                                    <th><div style="display: flex; align-items: center; gap: 4px;">Status <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div></th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="items-tbody">
                                <!-- Preenchido via JS -->
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- Eventos View -->
                <section id="events-view" class="view-section">
                    <header class="view-header flex-between">
                        <div>
                            <h2>Agenda de Eventos</h2>
                            <p class="subtitle">Gerencie os eventos da cidade</p>
                        </div>
                        <button class="btn btn-primary" id="btn-new-event">
                            Novo Evento
                        </button>
                    </header>
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Capa</th>
                                    <th><div style="display: flex; align-items: center; gap: 4px;">Título <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div></th>
                                    <th><div style="display: flex; align-items: center; gap: 4px;">Data <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div></th>
                                    <th><div style="display: flex; align-items: center; gap: 4px;">Local <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div></th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="events-tbody">
                                <!-- Preenchido via JS -->
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- Galeria View -->
                <section id="gallery-view" class="view-section">
                    <header class="view-header flex-between">
                        <div>
                            <h2>Galeria Principal</h2>
                            <p class="subtitle">Gerencie as fotos da cidade</p>
                        </div>
                    </header>
                    <section class="entity-media gallery-media" data-gallery-manager data-gallery-dropzone>
                        <div class="entity-media__header">
                            <h3>Fotos da galeria</h3>
                            <label class="entity-media__upload">
                                <span class="entity-media__upload-icon" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M304 112L192 112C183.2 112 176 119.2 176 128L176 512C176 520.8 183.2 528 192 528L448 528C456.8 528 464 520.8 464 512L464 272L376 272C336.2 272 304 239.8 304 200L304 112zM444.1 224L352 131.9L352 200C352 213.3 362.7 224 376 224L444.1 224zM128 128C128 92.7 156.7 64 192 64L325.5 64C342.5 64 358.8 70.7 370.8 82.7L493.3 205.3C505.3 217.3 512 233.6 512 250.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM387.4 496L252.6 496C236.8 496 224 483.2 224 467.4C224 461 226.1 454.9 230 449.8L297.6 362.9C303 356 311.3 352 320 352C328.7 352 337 356 342.4 362.9L410 449.9C413.9 454.9 416 461.1 416 467.5C416 483.3 403.2 496.1 387.4 496.1zM240 288C257.7 288 272 302.3 272 320C272 337.7 257.7 352 240 352C222.3 352 208 337.7 208 320C208 302.3 222.3 288 240 288z"/></svg>
                                </span>
                                <small>Adicionar imagem</small>
                                <input type="file" id="gallery-upload-input" accept="image/jpeg,image/png,image/webp" multiple data-gallery-action="upload">
                            </label>
                        </div>
                        <div class="entity-media__status" data-gallery-status>Carregando imagens...</div>
                        <div class="entity-media__grid gallery-media__grid" id="gallery-grid" data-gallery-grid>
                            <!-- Preenchido via JS -->
                        </div>
                    </section>
                </section>
            </div>
        </main>
    </div>

    <!-- Modais Dinâmicos -->
    <div id="modal-overlay" class="modal-overlay hidden">
        <div class="modal">
            <div class="modal-header">
                <h3 id="modal-title">Título do Modal</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body" id="modal-body">
                <!-- Conteúdo injetado via JS -->
            </div>
        </div>
    </div>

    <script>
        window.ADMIN_CSRF_TOKEN = <?= json_encode($csrfToken) ?>;
    </script>
    <script src="assets/app.js?v=<?= $adminAssetVersion('assets/app.js') ?>"></script>
</body>
</html>
