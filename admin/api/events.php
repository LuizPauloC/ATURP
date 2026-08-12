<?php
// admin/api/events.php
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

function normalizeDateTimeValue($value): string {
    $value = cleanString($value, 40);
    $timestamp = strtotime($value);

    if (!$timestamp) {
        sendError('Data invalida.');
    }

    return date('Y-m-d H:i:s', $timestamp);
}

function normalizeEventPayload(array $data): array {
    $titulo = cleanString($data['titulo'] ?? '', 160);
    if ($titulo === '') {
        sendError('Título é obrigatório.');
    }

    if (empty($data['data_inicio']) || empty($data['data_fim'])) {
        sendError('Data de início e data de término são obrigatórias.');
    }

    $slugBase = generateSlug($titulo);
    if ($slugBase === '') {
        sendError('Titulo invalido.');
    }

    return [
        'categoria_id' => normalizeNullableId($data['categoria_id'] ?? null),
        'titulo' => $titulo,
        'slug_base' => $slugBase,
        'descricao_completa' => cleanString($data['descricao_completa'] ?? '', 8000),
        'imagem_capa' => cleanImagePath($data['imagem_capa'] ?? ''),
        'data_inicio' => normalizeDateTimeValue($data['data_inicio']),
        'data_fim' => normalizeDateTimeValue($data['data_fim']),
        'local_nome' => cleanString($data['local_nome'] ?? '', 180),
        'endereco' => cleanString($data['endereco'] ?? '', 255),
        'organizador' => cleanString($data['organizador'] ?? '', 180),
        'telefone_contato' => cleanString($data['telefone_contato'] ?? '', 30),
        'link_ingressos' => cleanUrl($data['link_ingressos'] ?? ''),
        'preco_base' => cleanString($data['preco_base'] ?? '', 80),
        'is_destaque' => !empty($data['is_destaque']) ? 1 : 0,
        'ativo' => array_key_exists('ativo', $data) ? (int) !empty($data['ativo']) : 1,
    ];
}

// GET - Listar eventos
if ($method === 'GET' && $action === 'list') {
    $stmt = $pdo->query("
        SELECT e.*, c.nome as categoria_nome
        FROM eventos e
        LEFT JOIN categorias c ON e.categoria_id = c.id
        WHERE e.deletado_em IS NULL
        ORDER BY e.data_inicio DESC
    ");
    sendSuccess($stmt->fetchAll());
}

// POST - Criar evento
if ($method === 'POST' && $action === 'create') {
    $payload = normalizeEventPayload(getRequestData());
    $slug = $payload['slug_base'] . '-' . bin2hex(random_bytes(4));

    $stmt = $pdo->prepare("
        INSERT INTO eventos (
            categoria_id, titulo, slug, descricao_completa, imagem_capa,
            data_inicio, data_fim, local_nome, endereco, organizador,
            telefone_contato, link_ingressos, preco_base, is_destaque, ativo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $payload['categoria_id'],
        $payload['titulo'],
        $slug,
        $payload['descricao_completa'],
        $payload['imagem_capa'],
        $payload['data_inicio'],
        $payload['data_fim'],
        $payload['local_nome'],
        $payload['endereco'],
        $payload['organizador'],
        $payload['telefone_contato'],
        $payload['link_ingressos'],
        $payload['preco_base'],
        $payload['is_destaque'],
        $payload['ativo'],
    ]);

    sendSuccess(['id' => $pdo->lastInsertId()], 'Evento criado com sucesso.');
}

// PUT / POST - Atualizar evento
if (($method === 'PUT' || ($method === 'POST' && $action === 'update')) && isset($_GET['id'])) {
    $id = getPositiveIntParam('id');
    $payload = normalizeEventPayload(getRequestData());

    $stmt = $pdo->prepare("
        UPDATE eventos SET
            categoria_id = ?, titulo = ?, descricao_completa = ?, imagem_capa = ?,
            data_inicio = ?, data_fim = ?, local_nome = ?, endereco = ?, organizador = ?,
            telefone_contato = ?, link_ingressos = ?, preco_base = ?, is_destaque = ?, ativo = ?
        WHERE id = ? AND deletado_em IS NULL
    ");

    $stmt->execute([
        $payload['categoria_id'],
        $payload['titulo'],
        $payload['descricao_completa'],
        $payload['imagem_capa'],
        $payload['data_inicio'],
        $payload['data_fim'],
        $payload['local_nome'],
        $payload['endereco'],
        $payload['organizador'],
        $payload['telefone_contato'],
        $payload['link_ingressos'],
        $payload['preco_base'],
        $payload['is_destaque'],
        $payload['ativo'],
        $id,
    ]);

    sendSuccess(null, 'Evento atualizado.');
}

// DELETE - Soft delete
if (($method === 'DELETE' || ($method === 'POST' && $action === 'delete')) && isset($_GET['id'])) {
    $id = getPositiveIntParam('id');
    $stmt = $pdo->prepare("UPDATE eventos SET deletado_em = NOW() WHERE id = ?");
    $stmt->execute([$id]);
    sendSuccess(null, 'Evento removido.');
}

sendError('Rota invalida.', 404);
?>
