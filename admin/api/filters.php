<?php
// admin/api/filters.php
// Lista opcoes padronizadas de filtros para o formulario de itens.
require_once __DIR__ . '/core.php';
requireAuth();

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

function filterLabelFromSlug(string $slug): string
{
    $labels = [
        'cafe-da-manha' => 'Café da manhã',
        'almoco' => 'Almoço',
        'lanches' => 'Lanches',
        'jantar' => 'Jantar',
        'cafe' => 'Café',
        'restaurante' => 'Restaurante',
        'lanchonete' => 'Lanchonete',
        'pousada' => 'Pousada',
        'camping' => 'Camping',
        'condutor-turistico' => 'Condutor turístico',
        'imobiliaria' => 'Imobiliária',
        'materiais-construcao' => 'Materiais de construção',
    ];

    if (isset($labels[$slug])) {
        return $labels[$slug];
    }

    return ucwords(str_replace('-', ' ', $slug));
}

function filterGroupFromSlug(string $slug): string
{
    if (in_array($slug, ['cafe-da-manha', 'almoco', 'lanches', 'jantar', 'cafe'], true)) {
        return 'Gastronomia - refeições';
    }

    if (in_array($slug, ['restaurante', 'lanchonete'], true)) {
        return 'Gastronomia - tipo';
    }

    if (in_array($slug, ['pousada', 'camping'], true)) {
        return 'Hospedagem';
    }

    return 'Serviços e outros';
}

function normalizeFilterOption(array $row): array
{
    $slug = aturpCanonicalCategorySlug(cleanString($row['slug'] ?? '', 80));

    if ($slug === '') {
        return [];
    }

    return [
        'slug' => $slug,
        'nome' => cleanString($row['nome'] ?? filterLabelFromSlug($slug), 120),
        'grupo' => cleanString($row['grupo'] ?? filterGroupFromSlug($slug), 120),
        'categoria_slug' => aturpCanonicalCategorySlug(cleanString($row['categoria_slug'] ?? '', 100)),
    ];
}

function isFilterAllowedForCategory(string $slug, string $categorySlug): bool
{
    return aturpIsFilterAllowedForCategory($slug, $categorySlug);
}

function getOptionsFromFilterTable(PDO $pdo): ?array
{
    try {
        $stmt = $pdo->query("
            SELECT slug, nome, grupo, categoria_slug
            FROM filtros_opcoes
            WHERE ativo = 1
            ORDER BY ordem ASC, grupo ASC, nome ASC
        ");

        $options = [];
        foreach ($stmt->fetchAll() as $row) {
            $option = normalizeFilterOption($row);
            if ($option && isFilterAllowedForCategory($option['slug'], $option['categoria_slug'])) {
                $options[$option['slug']] = $option;
            }
        }

        return array_values($options);
    } catch (PDOException $e) {
        if (stripos($e->getMessage(), 'filtros_opcoes') !== false) {
            return null;
        }

        throw $e;
    }
}

function getOptionsFromExistingItems(PDO $pdo): array
{
    $stmt = $pdo->query("
        SELECT i.filtros, COALESCE(c.slug, '') AS categoria_slug
        FROM itens i
        LEFT JOIN categorias c
            ON c.id = i.categoria_id
            AND c.deletado_em IS NULL
        WHERE i.deletado_em IS NULL
            AND i.filtros IS NOT NULL
            AND TRIM(i.filtros) <> ''
    ");

    $options = [];
    foreach ($stmt->fetchAll() as $row) {
        $categorySlug = aturpCanonicalCategorySlug(cleanString($row['categoria_slug'] ?? '', 100));
        $slugs = array_map('trim', explode(',', (string) ($row['filtros'] ?? '')));
        foreach ($slugs as $slug) {
            $slug = aturpCanonicalCategorySlug($slug);
            if (!preg_match('/^[a-z0-9-]{1,80}$/', $slug)) {
                continue;
            }

            if (!isFilterAllowedForCategory($slug, $categorySlug)) {
                continue;
            }

            $key = $categorySlug . '|' . $slug;
            $options[$key] = [
                'slug' => $slug,
                'nome' => filterLabelFromSlug($slug),
                'grupo' => filterGroupFromSlug($slug),
                'categoria_slug' => $categorySlug,
            ];
        }
    }

    uasort($options, static function (array $a, array $b): int {
        return [$a['grupo'], $a['nome']] <=> [$b['grupo'], $b['nome']];
    });

    return array_values($options);
}

if ($method === 'GET' && $action === 'list') {
    try {
        $options = getOptionsFromFilterTable($pdo);
        if ($options === null) {
            $options = getOptionsFromExistingItems($pdo);
        }

        sendSuccess($options);
    } catch (Throwable $e) {
        error_log($e->getMessage());
        sendError('Erro ao carregar filtros.', 500);
    }
}

sendError('Rota invalida.', 404);
?>
