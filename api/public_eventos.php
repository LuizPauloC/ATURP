<?php
// api/public_eventos.php
// Retorna os eventos no mesmo formato que o json/eventos.json antigo
ini_set('display_errors', '0');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/security.php';
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function publicImagePath($value): string {
    $path = aturpPublicImageSrc($value);
    return $path !== '' ? './' . $path : '';
}

function publicHttpUrl($value): string {
    $value = trim((string) $value);
    if ($value === '') {
        return '';
    }

    $scheme = parse_url($value, PHP_URL_SCHEME);
    return $scheme && in_array(strtolower($scheme), ['http', 'https'], true) ? $value : '';
}

function decodePublicEventExtraData($value): array {
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

function publicEventExtraLabelList($values, array $labels): string {
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

function buildPublicEventExtra(array $extra): array {
    $structureLabels = [
        'banheiros' => 'Banheiros',
        'alimentacao' => 'Alimentação',
        'area-coberta' => 'Área coberta',
        'seguranca' => 'Segurança',
        'area-infantil' => 'Área infantil',
        'acessibilidade' => 'Acessibilidade',
    ];

    return array_filter([
        'programacao' => trim((string) ($extra['programacao'] ?? '')),
        'publicoAlvo' => trim((string) ($extra['publico_alvo'] ?? '')),
        'classificacaoIndicativa' => trim((string) ($extra['classificacao_indicativa'] ?? '')),
        'instrucoesIngresso' => trim((string) ($extra['instrucoes_ingresso'] ?? '')),
        'comoChegar' => trim((string) ($extra['como_chegar'] ?? '')),
        'estacionamento' => trim((string) ($extra['estacionamento'] ?? '')),
        'acessibilidade' => trim((string) ($extra['acessibilidade'] ?? '')),
        'estruturaDisponivel' => publicEventExtraLabelList($extra['estrutura_disponivel'] ?? [], $structureLabels),
        'regrasAvisos' => trim((string) ($extra['regras_avisos'] ?? '')),
        'pontoEncontro' => trim((string) ($extra['ponto_encontro'] ?? '')),
        'gratuitoInscricao' => !empty($extra['gratuito_inscricao']) ? 'Sim' : '',
        'canaisOficiais' => trim((string) ($extra['canais_oficiais'] ?? '')),
        'realizacaoApoio' => trim((string) ($extra['realizacao_apoio'] ?? '')),
        'observacoesUteis' => trim((string) ($extra['observacoes_uteis'] ?? '')),
    ], static fn($value) => $value !== '');
}

function publicEventEntityPhotos(PDO $pdo, string $type, int $entityId, string $coverImage = ''): array {
    $photos = [];
    $seen = [];
    $addPhoto = static function ($value) use (&$photos, &$seen): void {
        if (trim((string) ($value ?? '')) === '') {
            return;
        }

        $image = publicImagePath($value);
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

try {
    $pdo = getDbConnection();
    
    $stmt = $pdo->query("
        SELECT
            id, slug, titulo, descricao_completa, imagem_capa, data_inicio,
            data_fim, local_nome, endereco, telefone_contato, link_ingressos,
            preco_base, dados_extra
        FROM eventos
        WHERE deletado_em IS NULL AND ativo = 1
        ORDER BY data_inicio ASC
    ");
    $eventos = $stmt->fetchAll();
    
    $jsonOutput = [];
    
    foreach ($eventos as $ev) {
        $dataStr = "A definir";
        $timeStr = "A definir";
        
        if ($ev['data_inicio'] && $ev['data_fim']) {
            $di = new DateTime($ev['data_inicio']);

            $dataStr = $di->format('d/m/Y');

            if (!empty($ev['data_fim']) && $ev['data_fim'] !== '0000-00-00 00:00:00') {
                $df = new DateTime($ev['data_fim']);
                $dataStr .= " > " . $df->format('d/m/Y');
            }
            
            $timeStr = $di->format('H:i');
        }
        
        $image = publicImagePath($ev['imagem_capa'] ?? '');
        $linkInfo = publicHttpUrl($ev['link_ingressos'] ?? '');
        $price = trim((string) ($ev['preco_base'] ?? ''));
        $eventExtra = buildPublicEventExtra(decodePublicEventExtraData($ev['dados_extra'] ?? null));

        $place = [
            'id' => $ev['slug'],
            'slug' => $ev['slug'],
            'title' => $ev['titulo'],
            'image' => $image,
            'photos' => publicEventEntityPhotos($pdo, 'evento', (int) $ev['id'], $ev['imagem_capa'] ?? ''),
            'date' => $dataStr,
            'time' => $timeStr,
            'local' => $ev['local_nome'] ?: $ev['endereco'],
            'location' => [
                'label' => $ev['local_nome'] ?: ($ev['endereco'] ?: 'Pancas, ES'),
                'url' => ''
            ],
            'description' => $ev['descricao_completa'],
            'price' => $price,
            'ticket' => [
                'label' => $linkInfo ? 'Ingressos e informações' : '',
                'url' => $linkInfo
            ],
            'whatsapp' => $ev['telefone_contato'] ? 'https://wa.me/' . preg_replace('/\D/', '', $ev['telefone_contato']) : '',
            'eventExtra' => $eventExtra,
            'social' => [
                'label' => '',
                'url' => ''
            ]
        ];
        
        $jsonOutput[] = $place;
    }
    
    echo json_encode($jsonOutput, JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Não foi possível carregar os eventos.'], JSON_UNESCAPED_UNICODE);
}
