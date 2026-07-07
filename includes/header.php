<?php
$pageTitle = $pageTitle ?? 'ATURP - Guia Turístico';
$customCss = $customCss ?? [];
$assetVersion = function ($path) {
	$filePath = __DIR__ . '/../' . ltrim($path, './');
	return file_exists($filePath) ? filemtime($filePath) : '1';
};
$assetUrl = function ($path) use ($assetVersion) {
	if (preg_match('#^https?://#i', $path)) {
		return $path;
	}

	$separator = strpos($path, '?') === false ? '?v=' : '&v=';
	return $path . $separator . $assetVersion($path);
};
?>
<!doctype html>
<html lang="pt-BR">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title><?= htmlspecialchars($pageTitle) ?></title>
		<link rel="stylesheet" href="<?= htmlspecialchars($assetUrl('css/reset.css')) ?>" />
		<link rel="stylesheet" href="<?= htmlspecialchars($assetUrl('css/main.css')) ?>" />
		<link rel="stylesheet" href="<?= htmlspecialchars($assetUrl('css/nav-modal.css')) ?>" />
		<?php foreach ($customCss as $css): ?>
		<link rel="stylesheet" href="<?= htmlspecialchars($assetUrl($css)) ?>" />
		<?php endforeach; ?>
	</head>
	<body id="page-top">
		<header class="site-header">
			<nav class="site-header__nav" aria-label="Navegação principal">
				<div class="layout-container site-header__nav-inner">
					<div class="logo">
						<a href="./index.php">
							<img
								src="./assets/branding/aturp-logo-horizontal-transparent.png"
								alt="Logo da ATURP - Associação de Turismo de Pancas"
								height="35"
							/>
						</a>
					</div>
					<div class="site-header__desktop-nav" aria-label="Navegação rápida">
						<a href="./onde-ficar.php">Onde ficar</a>
						<a href="./onde-comer.php">Onde comer</a>
						<a href="./o-que-fazer.php">O que fazer</a>
						<a href="./servicos.php">Serviços</a>
						<a href="./guia-rapido.php">Guia</a>
					</div>
					<button
						type="button"
						class="menu-btn"
						aria-label="Abrir menu"
						aria-controls="nav-modal"
						aria-expanded="false"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
							<path
								d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"
							/>
						</svg>
					</button>
				</div>
			</nav>
		</header>
