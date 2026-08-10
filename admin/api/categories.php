<?php
// admin/api/categories.php
require_once __DIR__ . '/core.php';
requireAuth();

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

function generateSlug($string) {
    $string = trim((string) $string);
    if (function_exists('iconv')) {
        $converted = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $string);
        if ($converted !== false) {
            $string = $converted;
        }
    }

    $string = strtolower($string);
    $string = preg_replace('/[^a-z0-9]+/', '-', $string);
    return trim((string) $string, '-');
}

function normalizeCategoryPayload(array $data): array {
    $nome = cleanString($data['nome'] ?? '', 120);
    if ($nome === '') {
        sendError('O nome da categoria e obrigatorio.');
    }

    $tipo = cleanString($data['tipo_aplicacao'] ?? 'item', 20);
    if (!in_array($tipo, ['item', 'evento'], true)) {
        sendError('Tipo de aplicacao invalido.');
    }

    $slug = generateSlug($nome);
    if ($slug === '') {
        sendError('Nome de categoria invalido.');
    }

    return [
        'nome' => $nome,
        'slug' => $slug,
        'icone_svg' => cleanSvgIcon($data['icone_svg'] ?? ''),
        'tipo_aplicacao' => $tipo,
    ];
}

// GET - Listar categorias
if ($method === 'GET' && $action === 'list') {
    $stmt = $pdo->query("SELECT * FROM categorias WHERE deletado_em IS NULL ORDER BY ordem ASC, nome ASC");
    sendSuccess($stmt->fetchAll());
}

// POST - Criar categoria
if ($method === 'POST' && $action === 'create') {
    $payload = normalizeCategoryPayload(getRequestData());

    try {
        $stmt = $pdo->prepare("INSERT INTO categorias (nome, slug, icone_svg, tipo_aplicacao) VALUES (?, ?, ?, ?)");
        $stmt->execute([$payload['nome'], $payload['slug'], $payload['icone_svg'], $payload['tipo_aplicacao']]);
        sendSuccess(['id' => $pdo->lastInsertId()], 'Categoria criada com sucesso.');
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            sendError('Ja existe uma categoria com este nome/slug.');
        }

        error_log($e->getMessage());
        sendError('Erro ao criar categoria.', 500);
    }
}

// PUT / POST - Atualizar categoria
if (($method === 'PUT' || ($method === 'POST' && $action === 'update')) && isset($_GET['id'])) {
    $id = getPositiveIntParam('id');
    $payload = normalizeCategoryPayload(getRequestData());

    try {
        $stmt = $pdo->prepare("UPDATE categorias SET nome = ?, slug = ?, icone_svg = ?, tipo_aplicacao = ? WHERE id = ? AND deletado_em IS NULL");
        $stmt->execute([$payload['nome'], $payload['slug'], $payload['icone_svg'], $payload['tipo_aplicacao'], $id]);
        sendSuccess(null, 'Categoria atualizada.');
    } catch (PDOException $e) {
        error_log($e->getMessage());
        sendError('Erro ao atualizar categoria.', 500);
    }
}

// DELETE - Soft delete
if (($method === 'DELETE' || ($method === 'POST' && $action === 'delete')) && isset($_GET['id'])) {
    $id = getPositiveIntParam('id');

    $stmt = $pdo->prepare("UPDATE categorias SET deletado_em = NOW() WHERE id = ?");
    $stmt->execute([$id]);

    sendSuccess(null, 'Categoria removida.');
}

sendError('Rota ou metodo invalido.', 404);
?>
