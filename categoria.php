<?php
$pageTitle = 'Categoria | ATURP - Pancas, ES';
$customCss = ['./css/directory-cards.css', './css/categoria.css'];
$headerStartsTransparent = true;
require_once __DIR__ . '/includes/security.php';

// Pega o slug da URL
$catSlug = aturpCanonicalCategorySlug($_GET['cat'] ?? '');

if (in_array($catSlug, ['onde-ficar', 'hospedagem', 'hospedagens'], true)) {
    header('Location: ./onde-ficar.php', true, 302);
    exit;
}

if (in_array($catSlug, ['onde-comer', 'gastronomia'], true)) {
    header('Location: ./onde-comer.php', true, 302);
    exit;
}

if ($catSlug === 'servicos') {
    header('Location: ./servicos.php', true, 302);
    exit;
}

$categoria = null;
$itens = [];

function aturpCategoryCardDescription(array $item, int $limit = 250): string
{
    $extra = [];
    $dadosExtra = trim((string) ($item['dados_extra'] ?? ''));
    if ($dadosExtra !== '') {
        $decoded = json_decode($dadosExtra, true);
        $extra = is_array($decoded) ? $decoded : [];
    }

    $text = trim((string) ($extra['descricao_card'] ?? ''));
    if ($text === '') {
        $text = trim((string) ($item['descricao_completa'] ?? ''));
    }

    $text = trim(preg_replace('/\s+/', ' ', strip_tags($text)));
    if ($text === '') {
        return 'Informações em atualização.';
    }

    if (function_exists('mb_strlen') && function_exists('mb_substr')) {
        if (mb_strlen($text, 'UTF-8') <= $limit) {
            return $text;
        }

        return rtrim(mb_substr($text, 0, $limit, 'UTF-8')) . '...';
    }

    return strlen($text) <= $limit ? $text : rtrim(substr($text, 0, $limit)) . '...';
}

function aturpCategoryDetailType(string $catSlug): string
{
    return $catSlug === 'experiencias' ? 'experiencias' : 'outros';
}

function aturpCategoryDetailUrl(array $item, string $catSlug): string
{
    $identifier = trim((string) ($item['slug'] ?? ''));
    if ($identifier === '') {
        $identifier = (string) ($item['id'] ?? '');
    }

    return './detalhe.php?type=' . rawurlencode(aturpCategoryDetailType($catSlug)) . '&id=' . rawurlencode($identifier);
}

function aturpCategoryFocusId(array $item): string
{
    $identifier = trim((string) ($item['slug'] ?? ''));
    if ($identifier === '') {
        $identifier = (string) ($item['id'] ?? '');
    }

    return aturpCanonicalCategorySlug($identifier);
}

function aturpCategoryLongDescription(?array $categoria): string
{
    if (!$categoria) {
        return 'A categoria solicitada nao existe ou foi removida.';
    }

    $description = trim((string) ($categoria['seo_description'] ?? ''));
    return $description !== '' ? $description : 'Explore locais, experiencias e informacoes cadastradas nesta categoria em Pancas.';
}

if ($catSlug && preg_match('/^[a-z0-9-]{1,80}$/', $catSlug)) {
    // Conecta somente nesta pagina, antes de montar o header com o titulo correto.
    require_once __DIR__ . '/config/database.php';
    $pdo = getDbConnection();
    
    $categorySlugAliases = aturpCategorySlugAliases($catSlug);
    $categorySlugPlaceholders = implode(', ', array_fill(0, count($categorySlugAliases), '?'));
    $stmt = $pdo->prepare("SELECT id, nome, slug, icone_svg, seo_title, seo_description FROM categorias WHERE slug IN ($categorySlugPlaceholders) AND ativo = 1 AND deletado_em IS NULL LIMIT 1");
    $stmt->execute($categorySlugAliases);
    $categoria = $stmt->fetch();
    
    if ($categoria) {
        $pageTitle = $categoria['nome'] . ' | ATURP - Pancas, ES';
        
        $stmtItens = $pdo->prepare("
            SELECT
                id, slug, titulo, subtitulo, descricao_completa, imagem_capa, horario_funcionamento,
                endereco, link_google_maps, telefone_whatsapp, instagram, website, dados_extra
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
            <?= $categoria ? aturpHtml(trim((string) ($categoria['seo_title'] ?? '')) ?: $categoria['nome']) : 'Categoria Não Encontrada' ?>
        </h1>
        <p class="page-hero__description" id="category-description" style="max-width: 40rem; margin-top: 1.5rem; color: #e5e5e5; font-size: 1rem; line-height: 1.7;">
            <?= aturpHtml(aturpCategoryLongDescription($categoria)) ?>
        </p>
    </div>
</section>

<main class="directory-page">
    <?php
    $breadcrumbs = [
        ['label' => 'Início', 'url' => './index.php'],
        ['label' => 'O que fazer', 'url' => './o-que-fazer.php'],
        ['label' => $categoria ? $categoria['nome'] : 'Categoria'],
    ];
    include 'includes/breadcrumb.php';
    ?>

    <section class="directory-section">
        <div class="layout-container">
            <?php if ($categoria): ?>
                <div class="category-detail__overview">
                    <div class="category-detail__copy">
                        <p class="eyebrow">Categoria</p>
                    </div>
                </div>
            <?php endif; ?>

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
                        <?php
                        $detailUrl = aturpCategoryDetailUrl($item, $catSlug);
                        $focusId = aturpCategoryFocusId($item);
                        $subtitle = trim((string) ($item['subtitulo'] ?? ''));
                        $hours = trim((string) ($item['horario_funcionamento'] ?? ''));
                        $address = trim((string) ($item['endereco'] ?? ''));
                        $mapUrl = aturpPublicHttpUrl($item['link_google_maps'] ?? '');
                        $whatsUrl = aturpWhatsAppUrl($item['telefone_whatsapp'] ?? '');
                        ?>
                        <article class="directory-card" id="item-<?= aturpHtml($focusId) ?>" data-detail-id="<?= aturpHtml($focusId) ?>">
                            <h3 class="directory-card__title">
                                <a href="<?= aturpHtml($detailUrl) ?>" class="directory-card__title-link">
                                    <?= aturpHtml($item['titulo']) ?>
                                </a>
                            </h3>

                            <?php $imagemCapa = aturpPublicImageSrc($item['imagem_capa'] ?? ''); ?>
                            <?php if ($imagemCapa): ?>
                                <a href="<?= aturpHtml($detailUrl) ?>" class="directory-card__image-link">
                                    <img src="<?= aturpHtml($imagemCapa) ?>" alt="<?= aturpHtml($item['titulo']) ?>" class="directory-card__image" loading="lazy">
                                </a>
                            <?php endif; ?>

                            <?php if ($subtitle !== ''): ?>
                                <p class="category-item-card__subtitle"><?= aturpHtml($subtitle) ?></p>
                            <?php endif; ?>

                            <p class="directory-card__description"><?= aturpHtml(aturpCategoryCardDescription($item)) ?></p>

                            <?php if ($hours !== '' || $address !== ''): ?>
                                <ul class="detail-meta-list">
                                    <?php if ($hours !== ''): ?>
                                        <li class="detail-meta-item">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="detail-meta-icon" aria-hidden="true"><path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.3 25.9 4.3 33.2-6.7s4.3-25.9-6.7-33.2L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>
                                            <span><?= aturpHtml($hours) ?></span>
                                        </li>
                                    <?php endif; ?>

                                    <?php if ($address !== ''): ?>
                                        <li class="detail-meta-item">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="detail-meta-icon" aria-hidden="true"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 256c-35.3 0-64-28.7-64-64s28.7-64 64-64s64 28.7 64 64s-28.7 64-64 64z"/></svg>
                                            <span><?= aturpHtml($address) ?></span>
                                        </li>
                                    <?php endif; ?>
                                </ul>
                            <?php endif; ?>

                            <div class="directory-card__footer">
                                <hr class="directory-card__divider">

                                <?php if ($mapUrl): ?>
                                    <a href="<?= aturpHtml($mapUrl) ?>" target="_blank" rel="noreferrer" class="directory-card__link">
                                        <span class="directory-card__link-main">
                                            <span class="directory-card__icon directory-card__icon--leading">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true"><path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z"/></svg>
                                            </span>
                                            <span class="directory-card__link-text">Ver no mapa</span>
                                        </span>
                                    </a>
                                <?php endif; ?>

                                <?php if ($whatsUrl): ?>
                                    <a href="<?= aturpHtml($whatsUrl) ?>" target="_blank" rel="noreferrer" class="directory-card__social">
                                        Falar no WhatsApp
                                    </a>
                                <?php endif; ?>

                                <a href="<?= aturpHtml($detailUrl) ?>" class="directory-card__cta">
                                    <span class="directory-card__link-text">Ver mais detalhes &rarr;</span>
                                </a>
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
?>
<script>
(() => {
    const focus = new URLSearchParams(window.location.search).get('focus');
    if (!focus || !window.CSS || !CSS.escape) return;

    const target = document.querySelector(`[data-detail-id="${CSS.escape(focus)}"]`);
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('directory-card--focused');
    setTimeout(() => target.classList.remove('directory-card--focused'), 2200);
})();
</script>
<?php
include 'includes/footer.php';
?>
