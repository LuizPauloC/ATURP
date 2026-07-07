<?php
$pageTitle = 'Serviços | ATURP - Pancas, ES';
$customCss = ['./css/directory-cards.css', './css/servicos.css'];

require_once __DIR__ . '/includes/security.php';

$categoria = null;
$itens = [];
$loadError = '';

function aturpServiceExcerpt($value, int $limit = 190): string
{
    $text = trim((string) ($value ?? ''));
    $text = trim(preg_replace('/\s+/', ' ', strip_tags($text)));

    if ($text === '') {
        return 'Informações em atualização.';
    }

    if (function_exists('mb_strlen') && function_exists('mb_substr')) {
        if (mb_strlen($text, 'UTF-8') <= $limit) {
            return $text;
        }

        $excerpt = rtrim(mb_substr($text, 0, $limit, 'UTF-8'));
    } else {
        if (strlen($text) <= $limit) {
            return $text;
        }

        $excerpt = rtrim(substr($text, 0, $limit));
    }

    $lastSpace = strrpos($excerpt, ' ');
    if ($lastSpace !== false && $lastSpace > (int) ($limit * 0.65)) {
        $excerpt = substr($excerpt, 0, $lastSpace);
    }

    return rtrim($excerpt, " \t\n\r\0\x0B.,;:") . '...';
}

function aturpServiceDetailUrl(array $item): string
{
    $identifier = trim((string) ($item['slug'] ?? ''));
    if ($identifier === '') {
        $identifier = (string) ($item['id'] ?? '');
    }

    return './detalhe.php?type=servicos&id=' . rawurlencode($identifier);
}

try {
    require_once __DIR__ . '/config/database.php';
    $pdo = getDbConnection();

    $stmt = $pdo->prepare("
        SELECT id, nome
        FROM categorias
        WHERE slug = ? AND ativo = 1 AND deletado_em IS NULL
        LIMIT 1
    ");
    $stmt->execute(['servicos']);
    $categoria = $stmt->fetch();

    if ($categoria) {
        $stmtItens = $pdo->prepare("
            SELECT
                id, slug, titulo, subtitulo, descricao_completa, imagem_capa,
                horario_funcionamento, endereco, link_google_maps,
                telefone_whatsapp, website, instagram
            FROM itens
            WHERE categoria_id = ? AND ativo = 1 AND deletado_em IS NULL
            ORDER BY titulo ASC
        ");
        $stmtItens->execute([$categoria['id']]);
        $itens = $stmtItens->fetchAll();
    } else {
        $loadError = 'A categoria de serviços não foi localizada.';
    }
} catch (Throwable $e) {
    error_log($e->getMessage());
    $loadError = 'Não foi possível carregar os serviços no momento.';
}

include 'includes/header.php';
?>

<section class="services-hero" aria-labelledby="services-hero-title">
    <div class="services-hero__content layout-container">
        <p class="eyebrow eyebrow--on-dark">Apoio ao visitante</p>
        <h1 id="services-hero-title" class="services-hero__title section-title--on-dark">Serviços em Pancas</h1>
        <p class="services-hero__description">
            Encontre serviços turísticos e locais que ajudam a planejar melhor sua visita, com contatos,
            horários e localização em um só lugar.
        </p>
    </div>
</section>

<main class="directory-page services-page">
    <section class="directory-section services-directory" aria-labelledby="services-directory-title">
        <div class="layout-container">
            <div class="directory-section__intro">
                <p class="eyebrow">Serviços locais</p>
                <h2 id="services-directory-title" class="section-title">Encontre apoio para sua viagem</h2>
            </div>

            <div class="directory-grid services-grid" role="list">
                <?php if ($loadError !== ''): ?>
                    <p class="directory-grid__status"><?= aturpHtml($loadError) ?></p>
                <?php elseif (empty($itens)): ?>
                    <p class="directory-grid__status">Nenhum serviço cadastrado no momento.</p>
                <?php else: ?>
                    <?php foreach ($itens as $item): ?>
                        <?php
                        $detailUrl = aturpServiceDetailUrl($item);
                        $serviceCategory = trim((string) ($item['subtitulo'] ?? ''));
                        if ($serviceCategory === '') {
                            $serviceCategory = (string) ($categoria['nome'] ?? 'Serviços');
                        }

                        $imageSrc = aturpPublicImageSrc(
                            $item['imagem_capa'] ?? '',
                            'assets/placeholders/rock-silhouette-placeholder.png'
                        );
                        $hours = trim((string) ($item['horario_funcionamento'] ?? ''));
                        $address = trim((string) ($item['endereco'] ?? ''));
                        $mapUrl = aturpPublicHttpUrl($item['link_google_maps'] ?? '');
                        $whatsappUrl = aturpWhatsAppUrl($item['telefone_whatsapp'] ?? '');
                        ?>
                        <article class="directory-card services-card" role="listitem">
                            <p class="services-card__category"><?= aturpHtml($serviceCategory) ?></p>

                            <h3 class="directory-card__title">
                                <a href="<?= aturpHtml($detailUrl) ?>" class="directory-card__title-link">
                                    <?= aturpHtml($item['titulo']) ?>
                                </a>
                            </h3>

                            <a href="<?= aturpHtml($detailUrl) ?>" class="directory-card__image-link">
                                <img
                                    src="<?= aturpHtml($imageSrc) ?>"
                                    alt="<?= aturpHtml($item['titulo']) ?>"
                                    class="directory-card__image"
                                    loading="lazy"
                                    decoding="async"
                                >
                            </a>

                            <p class="directory-card__description">
                                <?= aturpHtml(aturpServiceExcerpt($item['descricao_completa'] ?? '')) ?>
                            </p>

                            <ul class="services-card__meta-list">
                                <li class="services-card__meta-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="services-card__meta-icon" aria-hidden="true">
                                        <path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.3 25.9 4.3 33.2-6.7s4.3-25.9-6.7-33.2L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
                                    </svg>
                                    <span><strong>Horário:</strong> <?= aturpHtml($hours !== '' ? $hours : 'Sob consulta') ?></span>
                                </li>

                                <li class="services-card__meta-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="services-card__meta-icon" aria-hidden="true">
                                        <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 256c-35.3 0-64-28.7-64-64s28.7-64 64-64s64 28.7 64 64s-28.7 64-64 64z"/>
                                    </svg>
                                    <span><strong>Localização:</strong> <?= aturpHtml($address !== '' ? $address : 'Pancas, ES') ?></span>
                                </li>
                            </ul>

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
                                        <span class="directory-card__icon directory-card__icon--trailing">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true"><path d="M384 64C366.3 64 352 78.3 352 96C352 113.7 366.3 128 384 128L466.7 128L265.3 329.4C252.8 341.9 252.8 362.2 265.3 374.7C277.8 387.2 298.1 387.2 310.6 374.7L512 173.3L512 256C512 273.7 526.3 288 544 288C561.7 288 576 273.7 576 256L576 96C576 78.3 561.7 64 544 64L384 64zM144 160C99.8 160 64 195.8 64 240L64 496C64 540.2 99.8 576 144 576L400 576C444.2 576 480 540.2 480 496L480 416C480 398.3 465.7 384 448 384C430.3 384 416 398.3 416 416L416 496C416 504.8 408.8 512 400 512L144 512C135.2 512 128 504.8 128 496L128 240C128 231.2 135.2 224 144 224L224 224C241.7 224 256 209.7 256 192C256 174.3 241.7 160 224 160L144 160z"/></svg>
                                        </span>
                                    </a>
                                <?php endif; ?>

                                <?php if ($whatsappUrl): ?>
                                    <a href="<?= aturpHtml($whatsappUrl) ?>" target="_blank" rel="noreferrer" class="directory-card__social">
                                        Falar no WhatsApp
                                    </a>
                                <?php endif; ?>

                                <a href="<?= aturpHtml($detailUrl) ?>" class="directory-card__cta">
                                    <span class="directory-card__link-text">Ver mais detalhes</span>
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
$customJs = [];
include 'includes/footer.php';
?>
