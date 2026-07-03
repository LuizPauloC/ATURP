<?php
// admin/api/items.php
require_once __DIR__ . '/core.php';
requireAuth();

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

function generateSlug($string) {
    $string = preg_replace('/[^\p{L}\d]+/u', '-', strtolower(trim($string)));
    return trim($string, '-');
}

function normalizeNullableId($value): ?int {
    if ($value === null || $value === '') {
        return null;
    }

    $id = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    return $id ? (int) $id : null;
}

function normalizeItemPayload(array $data): array {
    $titulo = cleanString($data['titulo'] ?? '', 160);
    if ($titulo === '') {
        sendError('Titulo e obrigatorio.');
    }

    $slugBase = generateSlug($titulo);
    if ($slugBase === '') {
        sendError('Titulo invalido.');
    }

    return [
        'categoria_id' => normalizeNullableId($data['categoria_id'] ?? null),
        'titulo' => $titulo,
        'slug_base' => $slugBase,
        'subtitulo' => cleanString($data['subtitulo'] ?? '', 160),
        'descricao_completa' => cleanString($data['descricao_completa'] ?? '', 8000),
        'imagem_capa' => cleanImagePath($data['imagem_capa'] ?? ''),
        'endereco' => cleanString($data['endereco'] ?? '', 255),
        'link_google_maps' => cleanUrl($data['link_google_maps'] ?? ''),
        'telefone_whatsapp' => cleanString($data['telefone_whatsapp'] ?? '', 30),
        'instagram' => cleanString($data['instagram'] ?? '', 80),
        'website' => cleanUrl($data['website'] ?? ''),
        'horario_funcionamento' => cleanString($data['horario_funcionamento'] ?? '', 500),
        'is_destaque' => !empty($data['is_destaque']) ? 1 : 0,
        'filtros' => cleanString($data['filtros'] ?? '', 255),
    ];
}

// GET - Listar itens
if ($method === 'GET' && $action === 'list') {
    $stmt = $pdo->query("
        SELECT i.*, c.nome as categoria_nome
        FROM itens i
        LEFT JOIN categorias c ON i.categoria_id = c.id
        WHERE i.deletado_em IS NULL
        ORDER BY i.criado_em DESC
    ");
    sendSuccess($stmt->fetchAll());
}

// POST - Criar item
if ($method === 'POST' && $action === 'create') {
    $payload = normalizeItemPayload(getRequestData());
    $slug = $payload['slug_base'] . '-' . bin2hex(random_bytes(4));

    $stmt = $pdo->prepare("
        INSERT INTO itens (categoria_id, titulo, slug, subtitulo, descricao_completa, imagem_capa, endereco, link_google_maps, telefone_whatsapp, instagram, website, horario_funcionamento, is_destaque, filtros)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $payload['categoria_id'],
        $payload['titulo'],
        $slug,
        $payload['subtitulo'],
        $payload['descricao_completa'],
        $payload['imagem_capa'],
        $payload['endereco'],
        $payload['link_google_maps'],
        $payload['telefone_whatsapp'],
        $payload['instagram'],
        $payload['website'],
        $payload['horario_funcionamento'],
        $payload['is_destaque'],
        $payload['filtros'],
    ]);

    sendSuccess(['id' => $pdo->lastInsertId()], 'Item criado com sucesso.');
}

// PUT / POST - Atualizar item
if (($method === 'PUT' || ($method === 'POST' && $action === 'update')) && isset($_GET['id'])) {
    $id = getPositiveIntParam('id');
    $payload = normalizeItemPayload(getRequestData());

    $stmt = $pdo->prepare("
        UPDATE itens SET
            categoria_id = ?, titulo = ?, subtitulo = ?, descricao_completa = ?, imagem_capa = ?,
            endereco = ?, link_google_maps = ?, telefone_whatsapp = ?, instagram = ?, website = ?,
            horario_funcionamento = ?, is_destaque = ?, filtros = ?
        WHERE id = ? AND deletado_em IS NULL
    ");

    $stmt->execute([
        $payload['categoria_id'],
        $payload['titulo'],
        $payload['subtitulo'],
        $payload['descricao_completa'],
        $payload['imagem_capa'],
        $payload['endereco'],
        $payload['link_google_maps'],
        $payload['telefone_whatsapp'],
        $payload['instagram'],
        $payload['website'],
        $payload['horario_funcionamento'],
        $payload['is_destaque'],
        $payload['filtros'],
        $id,
    ]);

    sendSuccess(null, 'Item atualizado.');
}

// DELETE - Soft delete
if (($method === 'DELETE' || ($method === 'POST' && $action === 'delete')) && isset($_GET['id'])) {
    $id = getPositiveIntParam('id');
    $stmt = $pdo->prepare("UPDATE itens SET deletado_em = NOW() WHERE id = ?");
    $stmt->execute([$id]);
    sendSuccess(null, 'Item removido.');
}

sendError('Rota invalida.', 404);
?>
