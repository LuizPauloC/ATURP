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

try {
    $pdo = getDbConnection();

    $stmtCategoria = $pdo->prepare("
        SELECT id
        FROM categorias
        WHERE slug = ? AND ativo = 1 AND deletado_em IS NULL
        LIMIT 1
    ");
    $stmtCategoria->execute(['servicos']);
    $categoria = $stmtCategoria->fetch();

    if (!$categoria) {
        echo json_encode([], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmtItens = $pdo->prepare("
        SELECT
            id, slug, titulo, subtitulo, descricao_completa, imagem_capa,
            endereco, link_google_maps, telefone_whatsapp, instagram,
            website, horario_funcionamento
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
            'photos' => array_values(array_filter([$image]))
        ];
    }

    echo json_encode($jsonOutput, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Nao foi possivel carregar os servicos.'], JSON_UNESCAPED_UNICODE);
}
