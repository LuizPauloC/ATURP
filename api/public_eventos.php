<?php
// api/public_eventos.php
// Retorna os eventos no mesmo formato que o json/eventos.json antigo
ini_set('display_errors', '0');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/security.php';
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function publicImagePath($value): string {
    return aturpPublicImageSrc($value, './assets/placeholders/eventos.jpeg');
}

function publicHttpUrl($value): string {
    $value = trim((string) $value);
    if ($value === '') {
        return '';
    }

    $scheme = parse_url($value, PHP_URL_SCHEME);
    return $scheme && in_array(strtolower($scheme), ['http', 'https'], true) ? $value : '';
}

try {
    $pdo = getDbConnection();
    
    $stmt = $pdo->query("
        SELECT
            slug, titulo, descricao_completa, imagem_capa, data_inicio,
            data_fim, local_nome, endereco, telefone_contato, link_ingressos,
            preco_base
        FROM eventos
        WHERE deletado_em IS NULL AND ativo = 1
        ORDER BY data_inicio ASC
    ");
    $eventos = $stmt->fetchAll();
    
    $jsonOutput = [];
    $meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    
    foreach ($eventos as $ev) {
        $dataStr = "A definir";
        $timeStr = "A definir";
        
        if ($ev['data_inicio'] && $ev['data_fim']) {
            $di = new DateTime($ev['data_inicio']);
            $df = new DateTime($ev['data_fim']);
            
            $di_str = sprintf("%02d %s. %s", $di->format('d'), $meses[$di->format('n')-1], $di->format('y'));
            
            if ($ev['data_inicio'] !== $ev['data_fim']) {
                $df_str = sprintf("%02d %s. %s", $df->format('d'), $meses[$df->format('n')-1], $df->format('y'));
                $dataStr = "$di_str > $df_str";
            } else {
                $dataStr = $di_str;
            }
            
            $timeStr = $di->format('H:i');
        }
        
        $image = publicImagePath($ev['imagem_capa'] ?? '');
        $linkInfo = publicHttpUrl($ev['link_ingressos'] ?? '');
        $price = trim((string) ($ev['preco_base'] ?? ''));

        $place = [
            'id' => $ev['slug'],
            'slug' => $ev['slug'],
            'title' => $ev['titulo'],
            'image' => $image,
            'photos' => array_values(array_filter([$image])),
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
    echo json_encode(['error' => 'Nao foi possivel carregar os eventos.'], JSON_UNESCAPED_UNICODE);
}
