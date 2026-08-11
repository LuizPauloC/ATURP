<?php
$breadcrumbs = $breadcrumbs ?? [];

if (!empty($breadcrumbs) && is_array($breadcrumbs)):
	$lastIndex = count($breadcrumbs) - 1;
?>
<nav class="site-breadcrumb layout-container" aria-label="Caminho da pagina">
	<?php foreach ($breadcrumbs as $index => $crumb): ?>
		<?php
		$label = trim((string) ($crumb['label'] ?? ''));
		$url = trim((string) ($crumb['url'] ?? ''));

		if ($label === '') {
			continue;
		}
		?>
		<?php if ($index > 0): ?>
			<span class="site-breadcrumb__separator" aria-hidden="true">/</span>
		<?php endif; ?>

		<?php if ($url !== '' && $index !== $lastIndex): ?>
			<a href="<?= htmlspecialchars($url, ENT_QUOTES, 'UTF-8') ?>" class="site-breadcrumb__link">
				<?= htmlspecialchars($label, ENT_QUOTES, 'UTF-8') ?>
			</a>
		<?php else: ?>
			<span class="site-breadcrumb__current"><?= htmlspecialchars($label, ENT_QUOTES, 'UTF-8') ?></span>
		<?php endif; ?>
	<?php endforeach; ?>
</nav>
<?php endif; ?>
