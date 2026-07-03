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
        <!-- Sidebar -->
        <aside class="sidebar glass-panel">
            <div class="sidebar-header">
                <img src="../assets/branding/aturp-logo-horizontal-transparent.png" alt="ATURP Logo" class="brand-logo">
                <span class="badge">Admin</span>
            </div>
            
            <nav class="sidebar-nav">
                <button class="nav-item active" data-target="dashboard-view">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                    Dashboard
                </button>
                <button class="nav-item" data-target="categories-view">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    Categorias
                </button>
                <button class="nav-item" data-target="items-view">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    Comércios & Serviços
                </button>
                <button class="nav-item" data-target="events-view">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Eventos
                </button>
                <button class="nav-item" data-target="gallery-view">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
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
                        <div class="stat-card glass-panel">
                            <div class="stat-icon category-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                            <div class="stat-details">
                                <h3>Categorias</h3>
                                <p class="stat-number" id="stat-categories">--</p>
                            </div>
                        </div>
                        <div class="stat-card glass-panel">
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
                    <div class="data-table-container glass-panel">
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
                            <h2>Comércios e Serviços</h2>
                            <p class="subtitle">Gerencie os estabelecimentos do site</p>
                        </div>
                        <button class="btn btn-primary" id="btn-new-item">
                            Nova Publicação
                        </button>
                    </header>
                    <div class="data-table-container glass-panel">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Capa</th>
                                    <th><div style="display: flex; align-items: center; gap: 4px;">Título <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div></th>
                                    <th><div style="display: flex; align-items: center; gap: 4px;">Categoria <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div></th>
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
                    <div class="data-table-container glass-panel">
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
                        <button class="btn btn-primary" onclick="document.getElementById('gallery-upload-input').click()">
                            Enviar Foto
                        </button>
                        <input type="file" id="gallery-upload-input" accept="image/jpeg, image/png, image/webp" style="display: none;" onchange="uploadGalleryPhoto(event)">
                    </header>
                    <div class="gallery-grid-admin" id="gallery-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
                        <!-- Preenchido via JS -->
                    </div>
                </section>
            </div>
        </main>
    </div>

    <!-- Modais Dinâmicos -->
    <div id="modal-overlay" class="modal-overlay hidden">
        <div class="modal glass-panel">
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
