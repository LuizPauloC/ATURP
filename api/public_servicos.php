<?php
// api/public_servicos.php
// Retorna servicos no formato consumido pela pagina de detalhe.
ini_set('display_errors', '0');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/security.php';
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function publicServiceImagePath($value): string
{
    $path = aturpPublicImageSrc($value);
    return $path !== '' ? './' . $path : '';
}

function publicServiceHttpUrl($value): string
{
    $value = trim((string) ($value ?? ''));
    if ($value === '' || $value === '#') {
        return '';
    }

    $scheme = parse_url($value, PHP_URL_SCHEME);
    return $scheme && in_array(strtolower($scheme), ['http', 'https'], true) ? $value : '';
}

function publicServiceEntityPhotos(PDO $pdo, string $type, int $entityId, string $coverImage = ''): array
{
    $photos = [];
    $seen = [];
    $addPhoto = static function ($value) use (&$photos, &$seen): void {
        $image = publicServiceImagePath($value);
        if ($image === '') {
            return;
        }

        $key = preg_replace('#^\./#', '', $image);
        if (isset($seen[$key])) {
            return;
        }

        $seen[$key] = true;
        $photos[] = $image;
    };

    $addPhoto($coverImage);

    $stmt = $pdo->prepare("
        SELECT url_imagem
        FROM fotos
        WHERE entidade_tipo = ? AND entidade_id = ?
        ORDER BY ordem ASC, id ASC
    ");
    $stmt->execute([$type, $entityId]);

    foreach ($stmt->fetchAll() as $photo) {
        $addPhoto($photo['url_imagem'] ?? '');
    }

    return $photos;
}

function decodePublicServiceExtraData($value): array
{
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

function publicServiceExtraLabelList($values, array $labels): string
{
    if (!is_array($values)) {
        $values = array_map('trim', explode(',', (string) $values));
    }

    $formatted = [];
    foreach ($values as $value) {
        $slug = aturpCanonicalCategorySlug($value);
        if (isset($labels[$slug])) {
            $formatted[] = $labels[$slug];
        }
    }

    return implode(', ', array_values(array_unique($formatted)));
}

function buildPublicServiceExtra(array $extra): array
{
    $typeLabels = [
        'condutor-turistico' => 'Condutor turístico',
        'imobiliaria' => 'Imobiliária',
        'materiais-construcao' => 'Materiais de construção',
        'transporte' => 'Transporte',
        'comercio-local' => 'Comércio local',
        'saude' => 'Saúde',
        'oficina' => 'Oficina',
        'outros' => 'Outros',
    ];
    $areaLabels = [
        'pancas' => 'Pancas',
        'regiao' => 'Região',
        'online' => 'Online',
        'domicilio' => 'Atendimento em domicílio',
    ];
    $attendanceLabels = [
        'presencial' => 'Presencial',
        'whatsapp' => 'WhatsApp',
        'delivery' => 'Delivery',
        'agendamento' => 'Com agendamento',
    ];
    $paymentLabels = [
        'pix' => 'Pix',
        'cartao' => 'Cartão',
        'dinheiro' => 'Dinheiro',
    ];

    $typeSlug = aturpCanonicalCategorySlug($extra['tipo_servico'] ?? '');
    $areaSlug = aturpCanonicalCategorySlug($extra['area_atendimento'] ?? '');

    return array_filter([
        'tipoServico' => $typeLabels[$typeSlug] ?? '',
        'areaAtendimento' => $areaLabels[$areaSlug] ?? '',
        'formasAtendimento' => publicServiceExtraLabelList($extra['formas_atendimento'] ?? [], $attendanceLabels),
        'aceitaAgendamento' => !empty($extra['aceita_agendamento']) ? 'Sim' : '',
        'atendimento24h' => !empty($extra['atendimento_24h']) ? 'Sim' : '',
        'linkServico' => publicServiceHttpUrl($extra['link_servico'] ?? ''),
        'formasPagamento' => publicServiceExtraLabelList($extra['formas_pagamento'] ?? [], $paymentLabels),
        'observacoesUteis' => trim((string) ($extra['observacoes_uteis'] ?? '')),
    ], static fn($value) => $value !== '');
}

try {
    $pdo = getDbConnection();

    $serviceSlugAliases = aturpCategorySlugAliases('servicos');
    $serviceSlugPlaceholders = implode(', ', array_fill(0, count($serviceSlugAliases), '?'));

    $stmtCategoria = $pdo->prepare("
        SELECT id
        FROM categorias
        WHERE slug IN ($serviceSlugPlaceholders) AND ativo = 1 AND deletado_em IS NULL
        LIMIT 1
    ");
    $stmtCategoria->execute($serviceSlugAliases);
    $categoria = $stmtCategoria->fetch();

    if (!$categoria) {
        echo json_encode([], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmtItens = $pdo->prepare("
        SELECT
            id, slug, titulo, subtitulo, descricao_completa, imagem_capa,
            endereco, link_google_maps, telefone_whatsapp, instagram,
            website, horario_funcionamento, dados_extra
        FROM itens
        WHERE categoria_id = ? AND ativo = 1 AND deletado_em IS NULL
        ORDER BY titulo ASC
    ");
    $stmtItens->execute([$categoria['id']]);
    $itens = $stmtItens->fetchAll();

    $jsonOutput = [];

    foreach ($itens as $item) {
        $image = publicServiceImagePath($item['imagem_capa'] ?? '');
        $instagramHandle = preg_replace('/[^A-Za-z0-9._]/', '', ltrim((string) ($item['instagram'] ?? ''), '@'));
        $mapUrl = publicServiceHttpUrl($item['link_google_maps'] ?? '');
        $website = publicServiceHttpUrl($item['website'] ?? '');
        $whatsappDigits = preg_replace('/\D/', '', (string) ($item['telefone_whatsapp'] ?? ''));
        $serviceExtra = buildPublicServiceExtra(decodePublicServiceExtraData($item['dados_extra'] ?? null));
        $serviceUrl = $serviceExtra['linkServico'] ?? '';

        $jsonOutput[] = [
            'id' => $item['id'],
            'slug' => $item['slug'],
            'title' => $item['titulo'],
            'image' => $image,
            'specialty' => $item['subtitulo'] ?: 'Serviço',
            'description' => $item['descricao_completa'],
            'hours' => [
                [
                    'label' => 'Atendimento',
                    'value' => $item['horario_funcionamento'] ?: 'Sob consulta'
                ]
            ],
            'location' => [
                'label' => $item['endereco'] ?: 'Pancas, ES',
                'url' => $mapUrl
            ],
            'social' => [
                'label' => $instagramHandle ? '@' . $instagramHandle : '',
                'url' => $instagramHandle ? 'https://instagram.com/' . $instagramHandle : ''
            ],
            'whatsapp' => $whatsappDigits !== '' ? 'https://wa.me/' . $whatsappDigits : '',
            'website' => $website,
            'ticket' => $serviceUrl ? [
                'label' => 'Abrir serviço',
                'url' => $serviceUrl,
            ] : null,
            'serviceExtra' => $serviceExtra,
            'photos' => publicServiceEntityPhotos($pdo, 'item', (int) $item['id'], $image)
        ];
    }

    echo json_encode($jsonOutput, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Não foi possível carregar os serviços.'], JSON_UNESCAPED_UNICODE);
}
