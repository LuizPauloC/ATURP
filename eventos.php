<?php
$pageTitle = 'Eventos | ATURP - Pancas, ES';
$customCss = ['./css/eventos.css'];
$headerStartsTransparent = true;
require_once __DIR__ . '/includes/security.php';
include 'includes/header.php';
require_once __DIR__ . '/config/database.php';

$pdo = getDbConnection();
$stmt = $pdo->query("
    SELECT slug, titulo, imagem_capa, data_inicio, data_fim, local_nome, endereco
    FROM eventos
    WHERE deletado_em IS NULL AND ativo = 1
    ORDER BY data_inicio ASC
");
$eventos = $stmt->fetchAll();

$hoje = new DateTime();
$todos = [];
$proximos = [];
$passados = [];

foreach($eventos as $ev) {
    if (!$ev['data_inicio'] || !$ev['data_fim'] || $ev['data_inicio'] == '0000-00-00 00:00:00') {
        $todos[] = $ev;
        continue;
    } else {
        $dataInicio = new DateTime($ev['data_inicio']);
        if ($dataInicio >= $hoje) {
            $proximos[] = $ev;
        } else {
            $passados[] = $ev;
        }
    }
    $todos[] = $ev;
}

function renderEventCard($ev) {
    $link = "./detalhe.php?type=evento&id=" . urlencode($ev['slug']);
    $focusId = aturpHtml(aturpCanonicalCategorySlug($ev['slug'] ?? ''));
    $imagem = aturpPublicImageSrc($ev['imagem_capa'] ?? '');
    
    $dataStr = "A definir";
    if ($ev['data_inicio'] && $ev['data_inicio'] != '0000-00-00 00:00:00') {
        $di = new DateTime($ev['data_inicio']);

        $dataStr = $di->format('d/m/Y');

        if (!empty($ev['data_fim']) && $ev['data_fim'] !== '0000-00-00 00:00:00') {
            $df = new DateTime($ev['data_fim']);
            $dataStr .= " > " . $df->format('d/m/Y');
        }
    }
    
    $local = aturpHtml($ev['local_nome'] ?: $ev['endereco']);
    $titulo = aturpHtml($ev['titulo']);
    $imagem = aturpHtml($imagem);
    $backgroundStyle = $imagem
        ? "background-image: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.2) 100%), url('{$imagem}'); background-size: cover; background-position: center;"
        : '';
    
    return <<<HTML
    <a href="{$link}" id="item-{$focusId}" data-detail-id="{$focusId}" class="calendar-grid__event-card" style="{$backgroundStyle}">
        <div class="event-card__content-wrapper">
            <h3 class="event-card__event-title">{$titulo}</h3>
            <span class="event-card__event-local">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="event-card__local-icon"><path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z"/></svg>
                <span class="event-card__text">{$local}</span>
            </span>
            <span class="event-card__event-date">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="event-card__date-icon"><path d="M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM480 496C488.8 496 496 488.8 496 480L496 416L408 416L408 496L480 496zM496 368L496 288L408 288L408 368L496 368zM360 368L360 288L280 288L280 368L360 368zM232 368L232 288L144 288L144 368L232 368zM144 416L144 480C144 488.8 151.2 496 160 496L232 496L232 416L144 416zM280 416L280 496L360 496L360 416L280 416zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176z"/></svg>
                <span class="event-card__text">{$dataStr}</span>
            </span>
        </div>
    </a>
HTML;
}
?>

<section class="page-hero" aria-labelledby="page-hero-title" style="background-image: linear-gradient(180deg, rgba(8, 10, 11, 0.72) 0%, rgba(8, 10, 11, 0.92) 52%, rgba(8, 10, 11, 0.96) 100%); background-color: #111827; background-position: center; background-size: cover; min-height: 50vh; display: flex; align-items: flex-end; padding-bottom: 3.5rem; padding-top: 8rem;">
    <div class="page-hero__content layout-container">
        <p class="eyebrow eyebrow--on-dark">Calendário</p>
        <h1 id="page-hero-title" class="page-hero__title section-title--on-dark" style="color: #fff; font-size: clamp(2.5rem, 7vw, 4.75rem); font-weight: 700; line-height: 0.95;">Todos os Eventos</h1>
        <p class="page-hero__description" style="max-width: 40rem; margin-top: 1.5rem; color: #e5e5e5; font-size: 1rem; line-height: 1.7;">
            Acompanhe a agenda cultural, esportiva e de lazer em Pancas. Programe sua viagem e venha festejar conosco!
        </p>
    </div>
</section>

<main class="layout-container" style="padding-top: 3rem; padding-bottom: 5rem;">
    <?php
    $breadcrumbs = [
        ['label' => 'Início', 'url' => './index.php'],
        ['label' => 'O que fazer', 'url' => './o-que-fazer.php'],
        ['label' => 'Eventos'],
    ];
    include 'includes/breadcrumb.php';
    ?>

    <div class="events-tabs">
        <button class="events-tab-btn active" onclick="switchTab(event, 'todos')">Todos</button>
        <button class="events-tab-btn" onclick="switchTab(event, 'proximos')">Próximos Eventos</button>
        <button class="events-tab-btn" onclick="switchTab(event, 'passados')">Eventos passados</button>
    </div>

    <!-- ABA: TODOS -->
    <div id="section-todos" class="events-section-container active">
        <div class="events-section__calendar-grid">
            <?php
            if (empty($todos)) echo "<p style='grid-column: 1/-1; text-align: center; color: #888;'>Nenhum evento encontrado.</p>";
            foreach ($todos as $ev) {
                echo renderEventCard($ev);
            }
            ?>
        </div>
    </div>

    <!-- ABA: PROXIMOS -->
    <div id="section-proximos" class="events-section-container">
        <div class="events-section__calendar-grid">
            <?php
            if (empty($proximos)) echo "<p style='grid-column: 1/-1; text-align: center; color: #888;'>Nenhum evento próximo programado.</p>";
            foreach ($proximos as $ev) {
                echo renderEventCard($ev);
            }
            ?>
        </div>
    </div>

    <!-- ABA: PASSADOS -->
    <div id="section-passados" class="events-section-container">
        <div class="events-section__calendar-grid">
            <?php
            if (empty($passados)) echo "<p style='grid-column: 1/-1; text-align: center; color: #888;'>Nenhum evento passado.</p>";
            foreach ($passados as $ev) {
                echo renderEventCard($ev);
            }
            ?>
        </div>
    </div>
</main>

<script>
function switchTab(event, tabId) {
	document.querySelectorAll('.events-tab-btn').forEach((btn) => {
		btn.classList.remove('active');
	});

	document.querySelectorAll('.events-section-container').forEach((section) => {
		section.classList.remove('active');
	});

	event.currentTarget.classList.add('active');
	document.getElementById('section-' + tabId).classList.add('active');
}

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
