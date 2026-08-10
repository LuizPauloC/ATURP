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

function publicItemDefaultSpecialty(string $catSlug): string {
    $defaults = [
        'onde-ficar' => 'Hospedagem',
        'onde-comer' => 'Gastronomia',
        'experiencias' => 'Experiencia',
    ];

    return $defaults[$catSlug] ?? 'Item';
}

function decodePublicItemExtraData($value): array {
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

function buildPublicHostingAmenities(array $extra): array {
    $amenityLabels = [
        'wifi' => ['icon' => 'wifi', 'label' => 'Wi-Fi'],
        'estacionamento' => ['icon' => 'car', 'label' => 'Estacionamento'],
        'ar-condicionado' => ['icon' => 'bed', 'label' => 'Ar-condicionado'],
        'piscina' => ['icon' => 'tree', 'label' => 'Piscina'],
        'cozinha-equipada' => ['icon' => 'coffee', 'label' => 'Cozinha equipada'],
        'acessibilidade' => ['icon' => 'bed', 'label' => 'Acessibilidade'],
    ];

    $amenities = [];
    $selectedAmenities = $extra['comodidades'] ?? [];
    if (!is_array($selectedAmenities)) {
        $selectedAmenities = array_map('trim', explode(',', (string) $selectedAmenities));
    }

    foreach ($selectedAmenities as $amenity) {
        $slug = aturpCanonicalCategorySlug($amenity);
        if (isset($amenityLabels[$slug])) {
            $amenities[] = $amenityLabels[$slug];
        }
    }

    if (!empty($extra['aceita_pets'])) {
        $amenities[] = ['icon' => 'tree', 'label' => 'Aceita pets'];
    }

    if (!empty($extra['cafe_manha_incluso'])) {
        $amenities[] = ['icon' => 'coffee', 'label' => 'Cafe da manha incluso'];
    }

    return array_values($amenities);
}

function buildPublicHostingExtra(array $extra): array {
    $typeLabels = [
        'pousada' => 'Pousada',
        'hotel' => 'Hotel',
        'camping' => 'Camping',
        'chale' => 'Chale',
        'cama-e-cafe' => 'Cama & Cafe',
    ];
    $priceLabels = [
        'economico' => 'Economico $',
        'intermediario' => 'Intermediario $$',
        'luxo' => 'Luxo $$$',
    ];

    $typeSlug = aturpCanonicalCategorySlug($extra['tipo_hospedagem'] ?? '');
    $priceSlug = aturpCanonicalCategorySlug($extra['faixa_preco'] ?? '');

    return array_filter([
        'tipo' => $typeLabels[$typeSlug] ?? '',
        'faixaPreco' => $priceLabels[$priceSlug] ?? '',
        'mediaDiaria' => trim((string) ($extra['media_diaria'] ?? '')),
        'checkin' => trim((string) ($extra['checkin'] ?? '')),
        'checkout' => trim((string) ($extra['checkout'] ?? '')),
        'linkReserva' => publicHttpUrl($extra['link_reserva'] ?? ''),
        'observacoesUteis' => trim((string) ($extra['observacoes_uteis'] ?? '')),
    ], static fn($value) => $value !== '');
}

function publicExtraLabelList($values, array $labels): string {
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

function buildPublicGastronomyExtra(array $extra): array {
    $cuisineLabels = [
        'caseira' => 'Caseira',
        'brasileira' => 'Brasileira',
        'cafeteria' => 'Cafeteria',
        'lanchonete' => 'Lanchonete',
        'pizzaria' => 'Pizzaria',
        'bar' => 'Bar',
        'outros' => 'Outros',
    ];
    $priceLabels = [
        'economico' => 'Economico $',
        'intermediario' => 'Intermediario $$',
        'alto' => 'Alto $$$',
    ];
    $mealLabels = [
        'cafe-da-manha' => 'Cafe da manha',
        'almoco' => 'Almoco',
        'lanches' => 'Lanches',
        'jantar' => 'Jantar',
    ];
    $serviceLabels = [
        'consumo-local' => 'Consumo no local',
        'delivery' => 'Delivery',
        'retirada' => 'Retirada',
    ];
    $paymentLabels = [
        'pix' => 'Pix',
        'cartao' => 'Cartao',
        'dinheiro' => 'Dinheiro',
    ];

    $cuisineSlug = aturpCanonicalCategorySlug($extra['tipo_cozinha'] ?? '');
    $priceSlug = aturpCanonicalCategorySlug($extra['faixa_preco'] ?? '');

    return array_filter([
        'tipoCozinha' => $cuisineLabels[$cuisineSlug] ?? '',
        'faixaPreco' => $priceLabels[$priceSlug] ?? '',
        'refeicoes' => publicExtraLabelList($extra['refeicoes'] ?? [], $mealLabels),
        'servicos' => publicExtraLabelList($extra['servicos'] ?? [], $serviceLabels),
        'aceitaReserva' => !empty($extra['aceita_reserva']) ? 'Sim' : '',
        'linkCardapio' => publicHttpUrl($extra['link_cardapio'] ?? ''),
        'formasPagamento' => publicExtraLabelList($extra['formas_pagamento'] ?? [], $paymentLabels),
        'observacoesUteis' => trim((string) ($extra['observacoes_uteis'] ?? '')),
    ], static fn($value) => $value !== '');
}

function buildPublicExperienceExtra(array $extra): array {
    $typeLabels = [
        'trilha' => 'Trilha',
        'voo-livre' => 'Voo livre',
        'mirante' => 'Mirante',
        'roteiro-cultural' => 'Roteiro cultural',
        'turismo-rural' => 'Turismo rural',
        'aventura' => 'Aventura',
        'contemplacao' => 'Contemplacao',
        'outros' => 'Outros',
    ];
    $difficultyLabels = [
        'facil' => 'Facil',
        'moderado' => 'Moderado',
        'dificil' => 'Dificil',
    ];
    $audienceLabels = [
        'familias' => 'Familias',
        'criancas' => 'Criancas',
        'casais' => 'Casais',
        'grupos' => 'Grupos',
        'aventureiros' => 'Aventureiros',
    ];
    $structureLabels = [
        'guia' => 'Guia',
        'estacionamento' => 'Estacionamento',
        'banheiro' => 'Banheiro',
        'alimentacao' => 'Alimentacao',
        'sinalizacao' => 'Sinalizacao',
        'acessibilidade' => 'Acessibilidade',
    ];

    $typeSlug = aturpCanonicalCategorySlug($extra['tipo_experiencia'] ?? '');
    $difficultySlug = aturpCanonicalCategorySlug($extra['nivel_dificuldade'] ?? '');

    return array_filter([
        'tipoExperiencia' => $typeLabels[$typeSlug] ?? '',
        'nivelDificuldade' => $difficultyLabels[$difficultySlug] ?? '',
        'duracaoMedia' => trim((string) ($extra['duracao_media'] ?? '')),
        'melhorPeriodo' => trim((string) ($extra['melhor_periodo'] ?? '')),
        'publicoIndicado' => publicExtraLabelList($extra['publico_indicado'] ?? [], $audienceLabels),
        'estruturaDisponivel' => publicExtraLabelList($extra['estrutura_disponivel'] ?? [], $structureLabels),
        'agendamentoObrigatorio' => !empty($extra['agendamento_obrigatorio']) ? 'Sim' : '',
        'entradaGratuita' => !empty($extra['entrada_gratuita']) ? 'Sim' : '',
        'precoBase' => trim((string) ($extra['preco_base'] ?? '')),
        'linkInformacoes' => publicHttpUrl($extra['link_informacoes'] ?? ''),
        'observacoesUteis' => trim((string) ($extra['observacoes_uteis'] ?? '')),
    ], static fn($value) => $value !== '');
}

$catSlug = aturpCanonicalCategorySlug($_GET['cat'] ?? '');

if (!preg_match('/^[a-z0-9-]{1,80}$/', $catSlug)) {
    echo json_encode([]);
    exit;
}

try {
    $pdo = getDbConnection();
    
    // Busca a categoria para pegar o ID
    $categorySlugAliases = aturpCategorySlugAliases($catSlug);
    $categorySlugPlaceholders = implode(', ', array_fill(0, count($categorySlugAliases), '?'));
    $stmt = $pdo->prepare("SELECT id FROM categorias WHERE slug IN ($categorySlugPlaceholders) AND ativo = 1 AND deletado_em IS NULL LIMIT 1");
    $stmt->execute($categorySlugAliases);
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
            website, horario_funcionamento, filtros, dados_extra
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
            $filterSlug = aturpCanonicalCategorySlug($f);
            if (!aturpIsFilterAllowedForCategory($filterSlug, $catSlug)) {
                continue;
            }

            if (in_array($filterSlug, $mealsKeywords, true)) {
                $mealMoments[] = $filterSlug;
            } else {
                // Se não for refeição, assume-se que é o tipo (restaurante, pousada, camping, etc.)
                $establishmentTypes[] = $filterSlug;
            }
        }
        
        // Se não tiver nada, adicionamos 'all' para o JS antigo não quebrar
        if (empty($mealMoments)) $mealMoments[] = 'all';
        if (empty($establishmentTypes)) $establishmentTypes[] = 'all';
        
        // O JS de "onde-ficar" espera que 'categories' seja um array.
        // Como o JS de "onde-comer" e "onde-ficar" têm pequenas diferenças no modelo JSON:
        
        $image = publicImagePath($item['imagem_capa'] ?? '');
        $instagramHandle = preg_replace('/[^A-Za-z0-9._]/', '', ltrim((string) ($item['instagram'] ?? ''), '@'));
        $extraData = in_array($catSlug, ['onde-ficar', 'onde-comer', 'experiencias'], true)
            ? decodePublicItemExtraData($item['dados_extra'] ?? null)
            : [];
        $hostingExtra = $catSlug === 'onde-ficar' ? buildPublicHostingExtra($extraData) : [];
        $hostingAmenities = $catSlug === 'onde-ficar' ? buildPublicHostingAmenities($extraData) : [];
        $gastronomyExtra = $catSlug === 'onde-comer' ? buildPublicGastronomyExtra($extraData) : [];
        $experienceExtra = $catSlug === 'experiencias' ? buildPublicExperienceExtra($extraData) : [];
        $reservationUrl = $hostingExtra['linkReserva'] ?? '';
        $menuUrl = $gastronomyExtra['linkCardapio'] ?? '';
        $experienceInfoUrl = $experienceExtra['linkInformacoes'] ?? '';
        $ticket = null;
        if ($reservationUrl) {
            $ticket = [
                'label' => 'Reservar hospedagem',
                'url' => $reservationUrl,
            ];
        } elseif ($menuUrl) {
            $ticket = [
                'label' => 'Ver cardapio',
                'url' => $menuUrl,
            ];
        } elseif ($experienceInfoUrl) {
            $ticket = [
                'label' => 'Ver informacoes',
                'url' => $experienceInfoUrl,
            ];
        }

        $place = [
            'id' => $item['id'],
            'slug' => $item['slug'],
            'title' => $item['titulo'],
            'image' => $image,
            'specialty' => $item['subtitulo'] ?: publicItemDefaultSpecialty($catSlug),
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
            'ticket' => $ticket,
            'hostingExtra' => $hostingExtra,
            'gastronomyExtra' => $gastronomyExtra,
            'experienceExtra' => $experienceExtra,
            'amenities' => $hostingAmenities,
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
