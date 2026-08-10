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

function decodeItemExtraData($value): array {
    if (is_array($value)) {
        return $value;
    }

    $value = trim((string) ($value ?? ''));
    if ($value === '') {
        return [];
    }

    $decoded = json_decode($value, true);
    return is_array($decoded) ? $decoded : [];
}

function normalizeBooleanExtraValue($value): bool {
    if (is_bool($value)) {
        return $value;
    }

    if (is_int($value)) {
        return $value === 1;
    }

    $value = strtolower(trim((string) ($value ?? '')));
    return in_array($value, ['1', 'true', 'on', 'yes', 'sim'], true);
}

function normalizeTimeExtraValue($value): string {
    $value = cleanString($value ?? '', 5);
    if (!preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/', $value)) {
        return '';
    }

    return $value;
}

function cleanHostingExtraData(array $extra, array $existingExtraData = []): array {
    $clean = $existingExtraData;

    $allowedTypes = ['pousada', 'hotel', 'camping', 'chale', 'cama-e-cafe'];
    $allowedPrices = ['economico', 'intermediario', 'luxo'];
    $allowedAmenities = ['wifi', 'estacionamento', 'ar-condicionado', 'piscina', 'cozinha-equipada', 'acessibilidade'];

    if (array_key_exists('tipo_hospedagem', $extra)) {
        $type = aturpCanonicalCategorySlug($extra['tipo_hospedagem']);
        $clean['tipo_hospedagem'] = in_array($type, $allowedTypes, true) ? $type : '';
    }

    if (array_key_exists('faixa_preco', $extra)) {
        $price = aturpCanonicalCategorySlug($extra['faixa_preco']);
        $clean['faixa_preco'] = in_array($price, $allowedPrices, true) ? $price : '';
    }

    if (array_key_exists('media_diaria', $extra)) {
        $clean['media_diaria'] = cleanString($extra['media_diaria'], 80);
    }

    if (array_key_exists('comodidades', $extra)) {
        $amenities = $extra['comodidades'];
        if (!is_array($amenities)) {
            $amenities = array_map('trim', explode(',', (string) $amenities));
        }

        $clean['comodidades'] = array_values(array_unique(array_filter(array_map(
            static fn($amenity) => aturpCanonicalCategorySlug($amenity),
            $amenities
        ), static fn($amenity) => in_array($amenity, $allowedAmenities, true))));
    }

    if (array_key_exists('aceita_pets', $extra)) {
        $clean['aceita_pets'] = normalizeBooleanExtraValue($extra['aceita_pets']);
    }

    if (array_key_exists('cafe_manha_incluso', $extra)) {
        $clean['cafe_manha_incluso'] = normalizeBooleanExtraValue($extra['cafe_manha_incluso']);
    }

    if (array_key_exists('checkin', $extra)) {
        $clean['checkin'] = normalizeTimeExtraValue($extra['checkin']);
    }

    if (array_key_exists('checkout', $extra)) {
        $clean['checkout'] = normalizeTimeExtraValue($extra['checkout']);
    }

    if (array_key_exists('link_reserva', $extra)) {
        $clean['link_reserva'] = cleanUrl($extra['link_reserva'], 500);
    }

    if (array_key_exists('observacoes_uteis', $extra)) {
        $clean['observacoes_uteis'] = cleanString($extra['observacoes_uteis'], 1200);
    }

    return $clean;
}

function cleanGastronomyExtraData(array $extra, array $existingExtraData = []): array {
    $clean = $existingExtraData;

    $allowedCuisineTypes = ['caseira', 'brasileira', 'cafeteria', 'lanchonete', 'pizzaria', 'bar', 'outros'];
    $allowedPrices = ['economico', 'intermediario', 'alto'];
    $allowedMeals = ['cafe-da-manha', 'almoco', 'lanches', 'jantar'];
    $allowedServices = ['consumo-local', 'delivery', 'retirada'];
    $allowedPayments = ['pix', 'cartao', 'dinheiro'];

    if (array_key_exists('tipo_cozinha', $extra)) {
        $type = aturpCanonicalCategorySlug($extra['tipo_cozinha']);
        $clean['tipo_cozinha'] = in_array($type, $allowedCuisineTypes, true) ? $type : '';
    }

    if (array_key_exists('faixa_preco', $extra)) {
        $price = aturpCanonicalCategorySlug($extra['faixa_preco']);
        $clean['faixa_preco'] = in_array($price, $allowedPrices, true) ? $price : '';
    }

    if (array_key_exists('refeicoes', $extra)) {
        $meals = $extra['refeicoes'];
        if (!is_array($meals)) {
            $meals = array_map('trim', explode(',', (string) $meals));
        }

        $clean['refeicoes'] = array_values(array_unique(array_filter(array_map(
            static fn($meal) => aturpCanonicalCategorySlug($meal),
            $meals
        ), static fn($meal) => in_array($meal, $allowedMeals, true))));
    }

    if (array_key_exists('servicos', $extra)) {
        $services = $extra['servicos'];
        if (!is_array($services)) {
            $services = array_map('trim', explode(',', (string) $services));
        }

        $clean['servicos'] = array_values(array_unique(array_filter(array_map(
            static fn($service) => aturpCanonicalCategorySlug($service),
            $services
        ), static fn($service) => in_array($service, $allowedServices, true))));
    }

    if (array_key_exists('aceita_reserva', $extra)) {
        $clean['aceita_reserva'] = normalizeBooleanExtraValue($extra['aceita_reserva']);
    }

    if (array_key_exists('link_cardapio', $extra)) {
        $clean['link_cardapio'] = cleanUrl($extra['link_cardapio'], 500);
    }

    if (array_key_exists('formas_pagamento', $extra)) {
        $payments = $extra['formas_pagamento'];
        if (!is_array($payments)) {
            $payments = array_map('trim', explode(',', (string) $payments));
        }

        $clean['formas_pagamento'] = array_values(array_unique(array_filter(array_map(
            static fn($payment) => aturpCanonicalCategorySlug($payment),
            $payments
        ), static fn($payment) => in_array($payment, $allowedPayments, true))));
    }

    if (array_key_exists('observacoes_uteis', $extra)) {
        $clean['observacoes_uteis'] = cleanString($extra['observacoes_uteis'], 1200);
    }

    return $clean;
}

function cleanServicesExtraData(array $extra, array $existingExtraData = []): array {
    $clean = $existingExtraData;

    $allowedTypes = ['condutor-turistico', 'imobiliaria', 'materiais-construcao', 'transporte', 'comercio-local', 'saude', 'oficina', 'outros'];
    $allowedAreas = ['pancas', 'regiao', 'online', 'domicilio'];
    $allowedAttendance = ['presencial', 'whatsapp', 'delivery', 'agendamento'];
    $allowedPayments = ['pix', 'cartao', 'dinheiro'];

    if (array_key_exists('tipo_servico', $extra)) {
        $type = aturpCanonicalCategorySlug($extra['tipo_servico']);
        $clean['tipo_servico'] = in_array($type, $allowedTypes, true) ? $type : '';
    }

    if (array_key_exists('area_atendimento', $extra)) {
        $area = aturpCanonicalCategorySlug($extra['area_atendimento']);
        $clean['area_atendimento'] = in_array($area, $allowedAreas, true) ? $area : '';
    }

    if (array_key_exists('formas_atendimento', $extra)) {
        $attendanceTypes = $extra['formas_atendimento'];
        if (!is_array($attendanceTypes)) {
            $attendanceTypes = array_map('trim', explode(',', (string) $attendanceTypes));
        }

        $clean['formas_atendimento'] = array_values(array_unique(array_filter(array_map(
            static fn($attendance) => aturpCanonicalCategorySlug($attendance),
            $attendanceTypes
        ), static fn($attendance) => in_array($attendance, $allowedAttendance, true))));
    }

    if (array_key_exists('aceita_agendamento', $extra)) {
        $clean['aceita_agendamento'] = normalizeBooleanExtraValue($extra['aceita_agendamento']);
    }

    if (array_key_exists('atendimento_24h', $extra)) {
        $clean['atendimento_24h'] = normalizeBooleanExtraValue($extra['atendimento_24h']);
    }

    if (array_key_exists('link_servico', $extra)) {
        $clean['link_servico'] = cleanUrl($extra['link_servico'], 500);
    }

    if (array_key_exists('formas_pagamento', $extra)) {
        $payments = $extra['formas_pagamento'];
        if (!is_array($payments)) {
            $payments = array_map('trim', explode(',', (string) $payments));
        }

        $clean['formas_pagamento'] = array_values(array_unique(array_filter(array_map(
            static fn($payment) => aturpCanonicalCategorySlug($payment),
            $payments
        ), static fn($payment) => in_array($payment, $allowedPayments, true))));
    }

    if (array_key_exists('observacoes_uteis', $extra)) {
        $clean['observacoes_uteis'] = cleanString($extra['observacoes_uteis'], 1200);
    }

    return $clean;
}

function cleanExperiencesExtraData(array $extra, array $existingExtraData = []): array {
    $clean = $existingExtraData;

    $allowedTypes = ['trilha', 'voo-livre', 'mirante', 'roteiro-cultural', 'turismo-rural', 'aventura', 'contemplacao', 'outros'];
    $allowedDifficulties = ['facil', 'moderado', 'dificil'];
    $allowedAudiences = ['familias', 'criancas', 'casais', 'grupos', 'aventureiros'];
    $allowedStructures = ['guia', 'estacionamento', 'banheiro', 'alimentacao', 'sinalizacao', 'acessibilidade'];

    if (array_key_exists('tipo_experiencia', $extra)) {
        $type = aturpCanonicalCategorySlug($extra['tipo_experiencia']);
        $clean['tipo_experiencia'] = in_array($type, $allowedTypes, true) ? $type : '';
    }

    if (array_key_exists('nivel_dificuldade', $extra)) {
        $difficulty = aturpCanonicalCategorySlug($extra['nivel_dificuldade']);
        $clean['nivel_dificuldade'] = in_array($difficulty, $allowedDifficulties, true) ? $difficulty : '';
    }

    if (array_key_exists('duracao_media', $extra)) {
        $clean['duracao_media'] = cleanString($extra['duracao_media'], 80);
    }

    if (array_key_exists('melhor_periodo', $extra)) {
        $clean['melhor_periodo'] = cleanString($extra['melhor_periodo'], 160);
    }

    if (array_key_exists('publico_indicado', $extra)) {
        $audiences = $extra['publico_indicado'];
        if (!is_array($audiences)) {
            $audiences = array_map('trim', explode(',', (string) $audiences));
        }

        $clean['publico_indicado'] = array_values(array_unique(array_filter(array_map(
            static fn($audience) => aturpCanonicalCategorySlug($audience),
            $audiences
        ), static fn($audience) => in_array($audience, $allowedAudiences, true))));
    }

    if (array_key_exists('estrutura_disponivel', $extra)) {
        $structures = $extra['estrutura_disponivel'];
        if (!is_array($structures)) {
            $structures = array_map('trim', explode(',', (string) $structures));
        }

        $clean['estrutura_disponivel'] = array_values(array_unique(array_filter(array_map(
            static fn($structure) => aturpCanonicalCategorySlug($structure),
            $structures
        ), static fn($structure) => in_array($structure, $allowedStructures, true))));
    }

    if (array_key_exists('agendamento_obrigatorio', $extra)) {
        $clean['agendamento_obrigatorio'] = normalizeBooleanExtraValue($extra['agendamento_obrigatorio']);
    }

    if (array_key_exists('entrada_gratuita', $extra)) {
        $clean['entrada_gratuita'] = normalizeBooleanExtraValue($extra['entrada_gratuita']);
    }

    if (array_key_exists('preco_base', $extra)) {
        $clean['preco_base'] = cleanString($extra['preco_base'], 120);
    }

    if (array_key_exists('link_informacoes', $extra)) {
        $clean['link_informacoes'] = cleanUrl($extra['link_informacoes'], 500);
    }

    if (array_key_exists('observacoes_uteis', $extra)) {
        $clean['observacoes_uteis'] = cleanString($extra['observacoes_uteis'], 1200);
    }

    return $clean;
}

function normalizeItemExtraData($value, array $existingExtraData = [], string $categorySlug = ''): ?array {
    $extra = decodeItemExtraData($value);
    $categorySlug = aturpCanonicalCategorySlug($categorySlug);

    if ($categorySlug === 'onde-ficar') {
        $clean = cleanHostingExtraData($extra, $existingExtraData);
    } elseif ($categorySlug === 'onde-comer') {
        $clean = cleanGastronomyExtraData($extra, $existingExtraData);
    } elseif ($categorySlug === 'servicos') {
        $clean = cleanServicesExtraData($extra, $existingExtraData);
    } elseif ($categorySlug === 'experiencias') {
        $clean = cleanExperiencesExtraData($extra, $existingExtraData);
    } else {
        $clean = $existingExtraData;
    }

    return empty($clean) ? null : $clean;
}

function encodeItemExtraData(?array $extraData): ?string {
    if ($extraData === null) {
        return null;
    }

    $json = json_encode($extraData, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    if ($json === false) {
        error_log('Falha ao codificar dados_extra: ' . json_last_error_msg());
        return null;
    }

    return $json;
}

function getExistingItemExtraData(PDO $pdo, int $id): array {
    $stmt = $pdo->prepare("SELECT dados_extra FROM itens WHERE id = ? AND deletado_em IS NULL LIMIT 1");
    $stmt->execute([$id]);
    $item = $stmt->fetch();

    if (!$item) {
        sendError('Item nao encontrado.', 404);
    }

    return decodeItemExtraData($item['dados_extra'] ?? null);
}

function getItemCategorySlug(PDO $pdo, ?int $categoryId): string {
    if (!$categoryId) {
        return '';
    }

    $stmt = $pdo->prepare("SELECT slug FROM categorias WHERE id = ? LIMIT 1");
    $stmt->execute([$categoryId]);
    $category = $stmt->fetch();

    return $category ? aturpCanonicalCategorySlug($category['slug'] ?? '') : '';
}

function normalizeItemPayload(array $data, array $existingExtraData = [], string $categorySlug = ''): array {
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
        'ativo' => array_key_exists('ativo', $data) ? (int) !empty($data['ativo']) : 1,
        'filtros' => cleanString($data['filtros'] ?? '', 255),
        'dados_extra' => array_key_exists('dados_extra', $data)
            ? normalizeItemExtraData($data['dados_extra'], $existingExtraData, $categorySlug)
            : (empty($existingExtraData) ? null : $existingExtraData),
    ];
}

function categorySlugAliasesForSql(array $categorySlugs): array {
    $aliases = [];

    foreach ($categorySlugs as $slug) {
        foreach (aturpCategorySlugAliases($slug) as $alias) {
            $aliases[] = $alias;
        }
    }

    return array_values(array_unique($aliases));
}

function getItemListContextWhere(string $context): array {
    $context = aturpCanonicalCategorySlug($context);
    if ($context === '') {
        return ['', []];
    }

    $contextCategoryMap = [
        'hospedagens' => 'onde-ficar',
        'gastronomia' => 'onde-comer',
        'servicos' => 'servicos',
        'experiencias' => 'experiencias',
    ];

    if ($context === 'outros') {
        $primaryAliases = categorySlugAliasesForSql(array_values($contextCategoryMap));
        $placeholders = implode(', ', array_fill(0, count($primaryAliases), '?'));
        return [" AND (i.categoria_id IS NULL OR c.slug NOT IN ($placeholders))", $primaryAliases];
    }

    if (!isset($contextCategoryMap[$context])) {
        sendError('Contexto de itens invalido.', 400);
    }

    $categoryAliases = categorySlugAliasesForSql([$contextCategoryMap[$context]]);
    $placeholders = implode(', ', array_fill(0, count($categoryAliases), '?'));
    return [" AND c.slug IN ($placeholders)", $categoryAliases];
}

// GET - Stats de itens
if ($method === 'GET' && $action === 'stats') {
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM itens WHERE deletado_em IS NULL");
    $row = $stmt->fetch();
    sendSuccess(['total' => (int) ($row['total'] ?? 0)]);
}

// GET - Buscar item unico
if ($method === 'GET' && $action === 'get' && isset($_GET['id'])) {
    $id = getPositiveIntParam('id');
    $stmt = $pdo->prepare("
        SELECT i.*, c.nome as categoria_nome, c.slug as categoria_slug
        FROM itens i
        LEFT JOIN categorias c ON i.categoria_id = c.id
        WHERE i.id = ? AND i.deletado_em IS NULL
        LIMIT 1
    ");
    $stmt->execute([$id]);
    $item = $stmt->fetch();

    if (!$item) {
        sendError('Item nao encontrado.', 404);
    }

    sendSuccess($item);
}

// GET - Listar itens
if ($method === 'GET' && $action === 'list') {
    [$contextWhere, $contextParams] = getItemListContextWhere(cleanString($_GET['context'] ?? '', 30));

    $stmt = $pdo->prepare("
        SELECT i.*, c.nome as categoria_nome, c.slug as categoria_slug
        FROM itens i
        LEFT JOIN categorias c ON i.categoria_id = c.id
        WHERE i.deletado_em IS NULL
        $contextWhere
        ORDER BY i.criado_em DESC
    ");
    $stmt->execute($contextParams);
    sendSuccess($stmt->fetchAll());
}

// POST - Criar item
if ($method === 'POST' && $action === 'create') {
    $data = getRequestData();
    $categorySlug = getItemCategorySlug($pdo, normalizeNullableId($data['categoria_id'] ?? null));
    $payload = normalizeItemPayload($data, [], $categorySlug);
    $slug = $payload['slug_base'] . '-' . bin2hex(random_bytes(4));

    $stmt = $pdo->prepare("
        INSERT INTO itens (categoria_id, titulo, slug, subtitulo, descricao_completa, imagem_capa, endereco, link_google_maps, telefone_whatsapp, instagram, website, horario_funcionamento, is_destaque, ativo, filtros, dados_extra)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        $payload['ativo'],
        $payload['filtros'],
        encodeItemExtraData($payload['dados_extra']),
    ]);

    sendSuccess(['id' => $pdo->lastInsertId()], 'Item criado com sucesso.');
}

// PUT / POST - Atualizar item
if (($method === 'PUT' || ($method === 'POST' && $action === 'update')) && isset($_GET['id'])) {
    $id = getPositiveIntParam('id');
    $data = getRequestData();
    $categorySlug = getItemCategorySlug($pdo, normalizeNullableId($data['categoria_id'] ?? null));
    $existingExtraData = getExistingItemExtraData($pdo, $id);
    $payload = normalizeItemPayload($data, $existingExtraData, $categorySlug);

    $stmt = $pdo->prepare("
        UPDATE itens SET
            categoria_id = ?, titulo = ?, subtitulo = ?, descricao_completa = ?, imagem_capa = ?,
            endereco = ?, link_google_maps = ?, telefone_whatsapp = ?, instagram = ?, website = ?,
            horario_funcionamento = ?, is_destaque = ?, ativo = ?, filtros = ?, dados_extra = ?
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
        $payload['ativo'],
        $payload['filtros'],
        encodeItemExtraData($payload['dados_extra']),
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
