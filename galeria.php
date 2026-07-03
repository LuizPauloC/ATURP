<?php
$pageTitle = 'Pancas Guia Turístico';
$customCss = ['css/galeria.css'];
require_once __DIR__ . '/includes/security.php';
include 'includes/header.php';
require_once __DIR__ . '/config/database.php';

$pdo = getDbConnection();
$stmt = $pdo->query("
    SELECT id, url_imagem, legenda
    FROM fotos
    WHERE entidade_tipo = 'galeria_global'
    ORDER BY ordem ASC, id DESC
");
$fotos = $stmt->fetchAll();
$renderedPhotos = 0;
$invalidPhotos = 0;
?>

<main class="gallery-main layout-container">
    <h1 class="gallery-title">Galeria de Fotos</h1>
    <section class="gallery-section">
        <?php foreach($fotos as $foto): ?>
            <?php $imageSrc = aturpPublicImageSrc($foto['url_imagem'] ?? ''); ?>
            <?php if (!$imageSrc) { $invalidPhotos++; continue; } ?>
            <?php $renderedPhotos++; ?>
            <div class="gallery-item">
                <img src="<?= aturpHtml($imageSrc) ?>" alt="<?= aturpHtml($foto['legenda']) ?>" loading="lazy">
                <?php if (!empty($foto['legenda'])): ?>
                    <p style="text-align: center; font-size: 0.9rem; margin-top: 8px; color: #555;"><?= aturpHtml($foto['legenda']) ?></p>
                <?php endif; ?>
            </div>
        <?php endforeach; ?>
    </section>

    <?php if ($invalidPhotos > 0): ?>
        <?php error_log('[ATURP] galeria.php ignorou ' . $invalidPhotos . ' foto(s) com caminho invalido ou arquivo ausente.'); ?>
    <?php endif; ?>

    <?php if ($renderedPhotos === 0): ?>
    <div class="gallery-fallback">
        <div class="gallery-fallback__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
                <path fill="currentColor" d="M448 80c8.8 0 16 7.2 16 16V415.8l-149.6-150c-12-12-31.5-12-43.5 0L192 344.8 125.8 278.6c-12-12-31.5-12-43.5 0L48 312.2V96c0-8.8 7.2-16 16-16H448zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm80 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/>
            </svg>
        </div>
        <h2 class="gallery-fallback__text">Nenhuma imagem encontrada</h2>
        <p class="gallery-fallback__subtext">Ainda não há fotos nesta galeria. Volte mais tarde para ver novas fotos de Pancas!</p>
        <a href="./index.php" class="gallery-fallback__btn">Voltar ao Início</a>
    </div>
    <?php endif; ?>
</main>

<?php
include 'includes/footer.php';
?>
