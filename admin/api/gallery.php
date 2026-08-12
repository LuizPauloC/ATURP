<?php
// admin/api/gallery.php
require_once __DIR__ . '/core.php';
requireAuth();

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

const GALLERY_COVER_LIMIT = 7;
const GALLERY_COVER_ORDER_STEP = 10;

function galleryCoverSlot($order): int {
    $order = (int) $order;
    if ($order <= 0 || $order % GALLERY_COVER_ORDER_STEP !== 0) {
        return 0;
    }

    $slot = (int) ($order / GALLERY_COVER_ORDER_STEP);
    return $slot >= 1 && $slot <= GALLERY_COVER_LIMIT ? $slot : 0;
}

function fetchGalleryPhotos(PDO $pdo): array {
    $stmt = $pdo->query("
        SELECT id, url_imagem, legenda, ordem
        FROM fotos
        WHERE entidade_tipo = 'galeria_global'
        ORDER BY ordem ASC, id DESC
    ");

    $photos = [];
    foreach ($stmt->fetchAll() as $photo) {
        $url = cleanImagePath($photo['url_imagem'] ?? '');
        if ($url === '') {
            continue;
        }

        $order = (int) ($photo['ordem'] ?? 0);
        $photos[] = [
            'id' => (int) $photo['id'],
            'url_imagem' => $url,
            'legenda' => (string) ($photo['legenda'] ?? ''),
            'ordem' => $order,
            'cover_slot' => galleryCoverSlot($order),
        ];
    }

    return $photos;
}

function fetchGalleryPhoto(PDO $pdo, int $photoId): array {
    $stmt = $pdo->prepare("
        SELECT id, url_imagem, legenda, ordem
        FROM fotos
        WHERE id = ? AND entidade_tipo = 'galeria_global'
        LIMIT 1
    ");
    $stmt->execute([$photoId]);
    $photo = $stmt->fetch();

    if (!$photo) {
        sendError('Foto nao encontrada.', 404);
    }

    return $photo;
}

function uploadedGalleryPhotoFiles(): array {
    // Aceita images[] para upload multiplo e image para compatibilidade com o fluxo antigo.
    if (isset($_FILES['images']) && is_array($_FILES['images']['name'] ?? null)) {
        $files = [];
        foreach ($_FILES['images']['name'] as $index => $name) {
            $files[] = [
                'name' => $name,
                'type' => $_FILES['images']['type'][$index] ?? '',
                'tmp_name' => $_FILES['images']['tmp_name'][$index] ?? '',
                'error' => $_FILES['images']['error'][$index] ?? UPLOAD_ERR_NO_FILE,
                'size' => $_FILES['images']['size'][$index] ?? 0,
            ];
        }
        return $files;
    }

    if (isset($_FILES['image'])) {
        return [$_FILES['image']];
    }

    return [];
}

function validateGalleryPhotoUploadFile(array $file): array {
    $name = cleanString($file['name'] ?? 'imagem', 180);
    $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
    $size = (int) ($file['size'] ?? 0);
    $tmpName = (string) ($file['tmp_name'] ?? '');

    if ($error !== UPLOAD_ERR_OK) {
        return ['valid' => false, 'name' => $name, 'reason' => 'Erro no upload.'];
    }

    if ($size <= 0 || $size > 5 * 1024 * 1024) {
        return ['valid' => false, 'name' => $name, 'reason' => 'Arquivo maior que 5 MB ou vazio.'];
    }

    if (!is_uploaded_file($tmpName)) {
        return ['valid' => false, 'name' => $name, 'reason' => 'Upload invalido.'];
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmpName);
    if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
        return ['valid' => false, 'name' => $name, 'reason' => 'Tipo de arquivo nao permitido.'];
    }

    if (@getimagesize($tmpName) === false) {
        return ['valid' => false, 'name' => $name, 'reason' => 'Arquivo de imagem invalido.'];
    }

    return ['valid' => true, 'name' => $name, 'reason' => ''];
}

function uploadErrorMessageFromSkipped(array $skipped): string {
    $reasons = [];
    foreach ($skipped as $item) {
        $reason = strtolower((string) ($item['reason'] ?? ''));
        if (strpos($reason, '5 mb') !== false || strpos($reason, 'maior') !== false || strpos($reason, 'grande') !== false) {
            $reasons['size'] = 'tamanho acima de 5 MB';
        } elseif (strpos($reason, 'tipo') !== false || strpos($reason, 'formato') !== false) {
            $reasons['format'] = 'formato invalido';
        } elseif (strpos($reason, 'imagem') !== false) {
            $reasons['image'] = 'arquivo de imagem invalido';
        } elseif (strpos($reason, 'upload') !== false) {
            $reasons['upload'] = 'falha no upload';
        } else {
            $reasons['other'] = 'arquivo incompativel';
        }
    }

    if (empty($reasons)) {
        return 'Nenhuma imagem valida enviada.';
    }

    return 'Nenhuma imagem valida enviada: ' . implode(', ', array_values($reasons)) . '.';
}

function updateGalleryPhotoOrder(PDO $pdo, array $ids): void {
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("UPDATE fotos SET ordem = ? WHERE id = ? AND entidade_tipo = 'galeria_global'");
        foreach (array_values($ids) as $index => $id) {
            $photoId = filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            if ($photoId) {
                $stmt->execute([($index + 1) * 10, (int) $photoId]);
            }
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function nextUnassignedGalleryOrder(PDO $pdo): int {
    $minimumOrder = (GALLERY_COVER_LIMIT + 1) * GALLERY_COVER_ORDER_STEP;
    $stmt = $pdo->query("
        SELECT COALESCE(MAX(ordem), 0)
        FROM fotos
        WHERE entidade_tipo = 'galeria_global'
    ");
    $nextOrder = ((int) $stmt->fetchColumn()) + GALLERY_COVER_ORDER_STEP;

    return max($minimumOrder, $nextOrder);
}

function unassignGalleryPhotoCover(PDO $pdo, int $photoId): void {
    fetchGalleryPhoto($pdo, $photoId);
    $order = nextUnassignedGalleryOrder($pdo);
    $stmt = $pdo->prepare("UPDATE fotos SET ordem = ? WHERE id = ? AND entidade_tipo = 'galeria_global'");
    $stmt->execute([$order, $photoId]);
}

function swapGalleryPhotoIntoCoverSlot(PDO $pdo, int $photoId, int $slot): void {
    $photo = fetchGalleryPhoto($pdo, $photoId);
    $targetOrder = $slot * GALLERY_COVER_ORDER_STEP;
    $currentOrder = (int) ($photo['ordem'] ?? 0);

    if ($currentOrder === $targetOrder) {
        return;
    }

    $stmtOccupant = $pdo->prepare("
        SELECT id
        FROM fotos
        WHERE entidade_tipo = 'galeria_global' AND ordem = ? AND id <> ?
        LIMIT 1
    ");
    $stmtOccupant->execute([$targetOrder, $photoId]);
    $occupantId = (int) ($stmtOccupant->fetchColumn() ?: 0);

    $pdo->beginTransaction();
    try {
        if ($occupantId) {
            $fallbackOrder = $currentOrder > 0 ? $currentOrder : nextUnassignedGalleryOrder($pdo);
            $stmtMoveOccupant = $pdo->prepare("UPDATE fotos SET ordem = ? WHERE id = ? AND entidade_tipo = 'galeria_global'");
            $stmtMoveOccupant->execute([$fallbackOrder, $occupantId]);
        }

        $stmtMovePhoto = $pdo->prepare("UPDATE fotos SET ordem = ? WHERE id = ? AND entidade_tipo = 'galeria_global'");
        $stmtMovePhoto->execute([$targetOrder, $photoId]);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function promoteGalleryPhotoToCoverSlot(PDO $pdo, int $photoId, int $slot): void {
    if ($slot === 0) {
        unassignGalleryPhotoCover($pdo, $photoId);
        return;
    }

    swapGalleryPhotoIntoCoverSlot($pdo, $photoId, $slot);
}

if ($method === 'GET' && $action === 'list') {
    sendSuccess(fetchGalleryPhotos($pdo));
}

if ($method === 'POST' && $action === 'create') {
    $files = uploadedGalleryPhotoFiles();

    if (empty($files)) {
        sendError('Nenhuma imagem enviada.');
    }

    $validFiles = [];
    $skipped = [];
    foreach ($files as $file) {
        $validation = validateGalleryPhotoUploadFile($file);
        if ($validation['valid']) {
            $validFiles[] = $file;
        } else {
            $skipped[] = [
                'name' => $validation['name'],
                'reason' => $validation['reason'],
            ];
        }
    }

    if (empty($validFiles)) {
        sendError(uploadErrorMessageFromSkipped($skipped), 400);
    }

    $nextOrder = ((int) $pdo->query("SELECT COALESCE(MAX(ordem), 0) FROM fotos WHERE entidade_tipo = 'galeria_global'")->fetchColumn()) + 10;
    $created = [];
    foreach ($validFiles as $file) {
        $upload = saveUploadedImage($file, 'gallery');
        $legenda = cleanString($_POST['legenda'] ?? '', 160);

        $stmt = $pdo->prepare("
            INSERT INTO fotos (url_imagem, legenda, entidade_tipo, ordem)
            VALUES (?, ?, 'galeria_global', ?)
        ");
        $stmt->execute([$upload['url'], $legenda, $nextOrder]);
        $created[] = [
            'id' => (int) $pdo->lastInsertId(),
            'url_imagem' => $upload['url'],
            'ordem' => $nextOrder,
        ];
        $nextOrder += 10;
    }

    $response = ['photos' => fetchGalleryPhotos($pdo)];
    $response['skipped'] = $skipped;
    $response['saved_count'] = count($created);
    $message = count($created) === 1 ? 'Foto adicionada a galeria.' : 'Fotos adicionadas a galeria.';
    if (!empty($skipped)) {
        $message .= ' Algumas imagens foram ignoradas.';
    }

    sendSuccess($response, $message);
}

if ($method === 'POST' && $action === 'set_cover') {
    $photoId = getPositiveIntParam('id');
    $data = getRequestData();
    $slot = filter_var($data['slot'] ?? $_POST['slot'] ?? null, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 0, 'max_range' => GALLERY_COVER_LIMIT],
    ]);

    if ($slot === false) {
        sendError('Posicao de capa invalida.', 400);
    }

    promoteGalleryPhotoToCoverSlot($pdo, $photoId, (int) $slot);
    sendSuccess(['photos' => fetchGalleryPhotos($pdo)], 'Capa atualizada.');
}

if (($method === 'POST' || $method === 'PUT') && $action === 'update_legenda' && isset($_GET['id'])) {
    $id = getPositiveIntParam('id');
    fetchGalleryPhoto($pdo, $id);
    $data = getRequestData();
    $legenda = cleanString($data['legenda'] ?? '', 160);

    $stmt = $pdo->prepare("UPDATE fotos SET legenda = ? WHERE id = ? AND entidade_tipo = 'galeria_global'");
    $stmt->execute([$legenda, $id]);

    sendSuccess(['photos' => fetchGalleryPhotos($pdo)], 'Legenda atualizada.');
}

if ($method === 'POST' && $action === 'reorder') {
    $data = getRequestData();
    $ids = $data['ids'] ?? [];

    if (!is_array($ids)) {
        sendError('Ordem invalida.', 400);
    }

    updateGalleryPhotoOrder($pdo, $ids);
    sendSuccess(['photos' => fetchGalleryPhotos($pdo)], 'Ordem atualizada.');
}

if (($method === 'DELETE' || $method === 'POST') && $action === 'delete' && isset($_GET['id'])) {
    $id = getPositiveIntParam('id');
    $foto = fetchGalleryPhoto($pdo, $id);

    $filePath = resolveUploadFilePath($foto['url_imagem'], 'gallery');
    if ($filePath && file_exists($filePath)) {
        unlink($filePath);
    }

    $stmtDel = $pdo->prepare("DELETE FROM fotos WHERE id = ? AND entidade_tipo = 'galeria_global'");
    $stmtDel->execute([$id]);

    sendSuccess(['photos' => fetchGalleryPhotos($pdo)], 'Foto removida.');
}

sendError('Rota invalida.', 404);
?>
