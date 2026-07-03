<?php
$pageTitle = 'Categoria | ATURP - Pancas, ES';
$customCss = ['./css/directory-cards.css', './css/categoria.css'];
require_once __DIR__ . '/includes/security.php';

// Pega o slug da URL
$catSlug = $_GET['cat'] ?? '';
$categoria = null;
$itens = [];

if ($catSlug && preg_match('/^[a-z0-9-]{1,80}$/', $catSlug)) {
    // Conecta somente nesta pagina, antes de montar o header com o titulo correto.
    require_once __DIR__ . '/config/database.php';
    $pdo = getDbConnection();
    
    $stmt = $pdo->prepare("SELECT id, nome FROM categorias WHERE slug = ? AND ativo = 1 AND deletado_em IS NULL LIMIT 1");
    $stmt->execute([$catSlug]);
    $categoria = $stmt->fetch();
    
    if ($categoria) {
        $pageTitle = $categoria['nome'] . ' | ATURP - Pancas, ES';
        
        $stmtItens = $pdo->prepare("
            SELECT
                titulo, descricao_completa, imagem_capa, horario_funcionamento,
                endereco, link_google_maps, telefone_whatsapp
            FROM itens
            WHERE categoria_id = ? AND ativo = 1 AND deletado_em IS NULL
            ORDER BY titulo ASC
        ");
        $stmtItens->execute([$categoria['id']]);
        $itens = $stmtItens->fetchAll();
    }
}

include 'includes/header.php';
?>

<section class="page-hero" aria-labelledby="page-hero-title" id="category-hero" style="background-position: center; background-size: cover; min-height: 50vh; display: flex; align-items: flex-end; padding-bottom: 3.5rem; padding-top: 8rem; background-image: linear-gradient(180deg, rgba(8, 10, 11, 0.6) 0%, rgba(8, 10, 11, 0.9) 52%, rgba(8, 10, 11, 0.94) 100%), url('./assets/hero/o-que-fazer.jpg');">
    <div class="page-hero__content layout-container">
        <p class="eyebrow eyebrow--on-dark" id="category-eyebrow">
            <?= $categoria ? aturpHtml($categoria['nome']) : 'Erro' ?>
        </p>
        <h1 id="page-hero-title" class="page-hero__title section-title--on-dark" style="color: #fff; font-size: clamp(2.5rem, 7vw, 4.75rem); font-weight: 700; line-height: 0.95;">
            <?= $categoria ? aturpHtml($categoria['nome']) : 'Categoria Não Encontrada' ?>
        </h1>
        <p class="page-hero__description" id="category-description" style="max-width: 40rem; margin-top: 1.5rem; color: #e5e5e5; font-size: 1rem; line-height: 1.7;">
            <?= $categoria ? 'Explore os melhores locais e serviços desta categoria em Pancas.' : 'A categoria solicitada não existe ou foi removida.' ?>
        </p>
    </div>
</section>

<main class="directory-page">
    <div class="back-link-container layout-container" style="padding-top: 2rem; margin-bottom: 0;">
        <?php
        $backLink = './o-que-fazer.php';
        if ($catSlug === 'servicos') {
            $backLink = './index.php';
        }
        ?>
        <a href="<?= $backLink ?>" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="back-link__icon" width="16" height="16" style="width: 16px; height: 16px; fill: currentColor;">
                <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
            </svg>
            Voltar
        </a>
    </div>

    <section class="directory-section">
        <div class="layout-container">
            <div class="directory-section__intro">
                <h2 class="section-title" id="category-section-title">
                    <?= $categoria ? 'Locais Disponíveis' : 'Erro' ?>
                </h2>
            </div>

            <div class="directory-grid" id="category-grid" style="margin-top: 2rem;">
                <?php if (!$categoria): ?>
                    <p class="directory-grid__status" style="color: #6b7280; padding: 20px 0;">A categoria especificada é inválida.</p>
                <?php elseif (empty($itens)): ?>
                    <p class="directory-grid__status" style="color: #6b7280; padding: 20px 0;">Nenhum item cadastrado nesta categoria ainda.</p>
                <?php else: ?>
                    <?php foreach ($itens as $item): ?>
                        <article class="directory-card">
                            <h3 class="directory-card__title"><?= aturpHtml($item['titulo']) ?></h3>
                            
                            <?php $imagemCapa = aturpPublicImageSrc($item['imagem_capa'] ?? ''); ?>
                            <?php if ($imagemCapa): ?>
                                <div class="directory-card__image-link">
                                    <img src="<?= aturpHtml($imagemCapa) ?>" alt="<?= aturpHtml($item['titulo']) ?>" class="directory-card__image" loading="lazy">
                                </div>
                            <?php endif; ?>

                            <p class="directory-card__description"><?= aturpHtml($item['descricao_completa']) ?></p>

                            <ul class="detail-meta-list">
                                <?php if ($item['horario_funcionamento']): ?>
                                    <li class="detail-meta-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="detail-meta-icon" aria-hidden="true"><path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.3 25.9 4.3 33.2-6.7s4.3-25.9-6.7-33.2L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>
                                        <span><?= aturpHtml($item['horario_funcionamento']) ?></span>
                                    </li>
                                <?php endif; ?>
                                
                                <?php if ($item['endereco']): ?>
                                    <li class="detail-meta-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="detail-meta-icon" aria-hidden="true"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 256c-35.3 0-64-28.7-64-64s28.7-64 64-64s64 28.7 64 64s-28.7 64-64 64z"/></svg>
                                        <span><?= aturpHtml($item['endereco']) ?></span>
                                    </li>
                                <?php endif; ?>
                            </ul>

                            <div class="directory-card__footer">
                                <hr class="directory-card__divider">
                                
                                <?php $mapUrl = aturpPublicHttpUrl($item['link_google_maps'] ?? ''); ?>
                                <?php if ($mapUrl): ?>
                                    <a href="<?= aturpHtml($mapUrl) ?>" target="_blank" rel="noreferrer" class="directory-card__link">
                                        <span class="directory-card__link-main">
                                            <span class="directory-card__icon directory-card__icon--leading">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true"><path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z"/></svg>
                                            </span>
                                            <span class="directory-card__link-text">Ver no mapa</span>
                                        </span>
                                        <span class="directory-card__icon directory-card__icon--trailing">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true"><path d="M384 64C366.3 64 352 78.3 352 96C352 113.7 366.3 128 384 128L466.7 128L265.3 329.4C252.8 341.9 252.8 362.2 265.3 374.7C277.8 387.2 298.1 387.2 310.6 374.7L512 173.3L512 256C512 273.7 526.3 288 544 288C561.7 288 576 273.7 576 256L576 96C576 78.3 561.7 64 544 64L384 64zM144 160C99.8 160 64 195.8 64 240L64 496C64 540.2 99.8 576 144 576L400 576C444.2 576 480 540.2 480 496L480 416C480 398.3 465.7 384 448 384C430.3 384 416 398.3 416 416L416 496C416 504.8 408.8 512 400 512L144 512C135.2 512 128 504.8 128 496L128 240C128 231.2 135.2 224 144 224L224 224C241.7 224 256 209.7 256 192C256 174.3 241.7 160 224 160L144 160z"/></svg>
                                        </span>
                                    </a>
                                <?php endif; ?>
                                
                                <?php $whatsUrl = aturpWhatsAppUrl($item['telefone_whatsapp'] ?? ''); ?>
                                <?php if ($whatsUrl): ?>
                                    <a href="<?= aturpHtml($whatsUrl) ?>" target="_blank" rel="noreferrer" class="directory-card__social">
                                        Falar no WhatsApp
                                    </a>
                                <?php endif; ?>
                            </div>
                        </article>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </section>
</main>

<?php
// Não precisa mais do js/categoria.js pois o PHP faz o trabalho.
$customJs = []; 
include 'includes/footer.php';
?>
