<?php
// api/legacy_itens.php
// Esta API serve como ponte entre o banco de dados MySQL e os antigos scripts JS 
// (onde-comer.js e onde-ficar.js), entregando exatamente a estrutura JSON que eles esperam.

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
    if ($value === '' || $value === '#') {
        return '';
    }

    $scheme = parse_url($value, PHP_URL_SCHEME);
    return $scheme && in_array(strtolower($scheme), ['http', 'https'], true) ? $value : '';
}

$catSlug = $_GET['cat'] ?? '';

if (!preg_match('/^[a-z0-9-]{1,80}$/', $catSlug)) {
    echo json_encode([]);
    exit;
}

try {
    $pdo = getDbConnection();
    
    // Busca a categoria para pegar o ID
    $stmt = $pdo->prepare("SELECT id FROM categorias WHERE slug = ? AND ativo = 1 AND deletado_em IS NULL LIMIT 1");
    $stmt->execute([$catSlug]);
    $categoria = $stmt->fetch();
    
    if (!$categoria) {
        echo json_encode([]);
        exit;
    }
    
    // Busca os itens desta categoria
    $stmtItens = $pdo->prepare("
        SELECT
            id, slug, titulo, subtitulo, descricao_completa, imagem_capa,
            endereco, link_google_maps, telefone_whatsapp, instagram,
            website, horario_funcionamento, filtros
        FROM itens
        WHERE categoria_id = ? AND ativo = 1 AND deletado_em IS NULL
        ORDER BY titulo ASC
    ");
    $stmtItens->execute([$categoria['id']]);
    $itens = $stmtItens->fetchAll();
    
    $jsonOutput = [];
    
    foreach ($itens as $item) {
        // Parsing dos filtros
        // A coluna 'filtros' contém palavras separadas por vírgula. Ex: "almoco, restaurante, pousada"
        $rawFiltros = $item['filtros'] ? array_map('trim', explode(',', $item['filtros'])) : [];
        
        // Separação heurística rápida para não precisar de múltiplas colunas:
        // Se a categoria for "onde-comer", algumas palavras vão para mealMoments, outras para establishmentTypes.
        // Se for "onde-ficar", os filtros servem apenas para o `data-filter`.
        // Para garantir compatibilidade com o JS antigo:
        $mealMoments = [];
        $establishmentTypes = [];
        
        // Mapeamento de possíveis refeições
        $mealsKeywords = ['cafe-da-manha', 'almoco', 'jantar', 'lanches'];
        
        foreach ($rawFiltros as $f) {
            if (in_array(strtolower($f), $mealsKeywords)) {
                $mealMoments[] = $f;
            } else {
                // Se não for refeição, assume-se que é o tipo (restaurante, pousada, camping, etc.)
                $establishmentTypes[] = $f;
            }
        }
        
        // Se não tiver nada, adicionamos 'all' para o JS antigo não quebrar
        if (empty($mealMoments)) $mealMoments[] = 'all';
        if (empty($establishmentTypes)) $establishmentTypes[] = 'all';
        
        // O JS de "onde-ficar" espera que 'categories' seja um array.
        // Como o JS de "onde-comer" e "onde-ficar" têm pequenas diferenças no modelo JSON:
        
        $image = publicImagePath($item['imagem_capa'] ?? '');
        $instagramHandle = preg_replace('/[^A-Za-z0-9._]/', '', ltrim((string) ($item['instagram'] ?? ''), '@'));

        $place = [
            'id' => $item['id'],
            'slug' => $item['slug'],
            'title' => $item['titulo'],
            'image' => $image,
            'specialty' => $item['subtitulo'] ?: ($catSlug == 'onde-ficar' ? 'Hospedagem' : 'Gastronomia'),
            'description' => $item['descricao_completa'],
            // Para onde-comer:
            'mealMoments' => $mealMoments,
            'establishmentTypes' => $establishmentTypes,
            // Para onde-ficar:
            'categories' => $establishmentTypes,
            
            'hours' => [
                [
                    'label' => 'Atendimento',
                    'value' => $item['horario_funcionamento'] ?: 'Sob consulta'
                ]
            ],
            'location' => [
                'label' => $item['endereco'] ?: 'Pancas, ES',
                'url' => publicHttpUrl($item['link_google_maps'] ?? '') ?: '#'
            ],
            'social' => [
                'label' => $instagramHandle ? '@' . $instagramHandle : 'Instagram',
                'url' => $instagramHandle ? 'https://instagram.com/' . $instagramHandle : '#'
            ],
            'whatsapp' => $item['telefone_whatsapp'] 
                ? 'https://wa.me/' . preg_replace('/\D/', '', $item['telefone_whatsapp']) 
                : '#',
            'website' => publicHttpUrl($item['website'] ?? ''),
            'photos' => array_values(array_filter([
                $image
            ]))
        ];
        
        $jsonOutput[] = $place;
    }
    if ($catSlug === 'onde-ficar') {
        $ondeFicarOutput = ['pousada' => [], 'camping' => []];
        foreach ($jsonOutput as $p) {
            // Se o item tem 'pousada' nos categories, vai para pousada, se tem camping vai para camping
            $cats = $p['categories'] ?? [];
            if (in_array('pousada', $cats) || in_array('all', $cats)) {
                $ondeFicarOutput['pousada'][] = $p;
            }
            if (in_array('camping', $cats)) {
                $ondeFicarOutput['camping'][] = $p;
            }
        }
        echo json_encode($ondeFicarOutput, JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode($jsonOutput, JSON_UNESCAPED_UNICODE);
    }

} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Nao foi possivel carregar os dados.'], JSON_UNESCAPED_UNICODE);
}
