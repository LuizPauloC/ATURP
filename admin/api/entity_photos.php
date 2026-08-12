<?php
// admin/api/entity_photos.php
require_once __DIR__ . '/core.php';
requireAuth();

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

function normalizeEntityPhotoType($value): string {
    $type = trim((string) ($value ?? ''));
    if ($type === 'item' || $type === 'evento') {
        return $type;
    }

    sendError('Tipo de entidade inválido.', 400);
}

function entityPhotoTable(string $type): string {
    return $type === 'evento' ? 'eventos' : 'itens';
}

function fetchEntity(PDO $pdo, string $type, int $entityId): array {
    $table = entityPhotoTable($type);
    $stmt = $pdo->prepare("SELECT id, imagem_capa FROM {$table} WHERE id = ? AND deletado_em IS NULL LIMIT 1");
    $stmt->execute([$entityId]);
    $entity = $stmt->fetch();

    if (!$entity) {
        sendError('Entidade não encontrada.', 404);
    }

    return $entity;
}

function fetchEntityPhoto(PDO $pdo, int $photoId): array {
    $stmt = $pdo->prepare("
        SELECT id, url_imagem, legenda, entidade_tipo, entidade_id, ordem
        FROM fotos
        WHERE id = ? AND entidade_tipo IN ('item', 'evento') AND entidade_id IS NOT NULL
        LIMIT 1
    ");
    $stmt->execute([$photoId]);
    $photo = $stmt->fetch();

    if (!$photo) {
        sendError('Foto não encontrada.', 404);
    }

    return $photo;
}

function syncEntityCoverImage(PDO $pdo, string $type, int $entityId, string $imageUrl): void {
    if ($type === 'evento') {
        $stmt = $pdo->prepare("UPDATE eventos SET imagem_capa = ? WHERE id = ?");
    } else {
        $stmt = $pdo->prepare("UPDATE itens SET imagem_capa = ? WHERE id = ?");
    }

    $stmt->execute([$imageUrl, $entityId]);
}

function normalizeEntityPhotoUrl($value): string {
    return preg_replace('#^\./#', '', aturpNormalizePublicImagePath($value));
}

function ensureEntityCoverPhoto(PDO $pdo, string $type, int $entityId, string $coverUrl): void {
    $coverUrl = cleanImagePath($coverUrl);
    $coverComparable = normalizeEntityPhotoUrl($coverUrl);
    if ($coverComparable === '') {
        return;
    }

    $stmt = $pdo->prepare("
        SELECT url_imagem
        FROM fotos
        WHERE entidade_tipo = ? AND entidade_id = ?
    ");
    $stmt->execute([$type, $entityId]);

    foreach ($stmt->fetchAll() as $photo) {
        if (normalizeEntityPhotoUrl($photo['url_imagem'] ?? '') === $coverComparable) {
            return;
        }
    }

    $pdo->beginTransaction();
    try {
        $stmtShift = $pdo->prepare("UPDATE fotos SET ordem = ordem + 10 WHERE entidade_tipo = ? AND entidade_id = ?");
        $stmtShift->execute([$type, $entityId]);

        $stmtInsert = $pdo->prepare("
            INSERT INTO fotos (url_imagem, legenda, entidade_tipo, entidade_id, ordem)
            VALUES (?, '', ?, ?, 10)
        ");
        $stmtInsert->execute([$coverUrl, $type, $entityId]);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function promoteEntityPhotoToFirst(PDO $pdo, string $type, int $entityId, int $photoId): void {
    $stmt = $pdo->prepare("
        SELECT id
        FROM fotos
        WHERE entidade_tipo = ? AND entidade_id = ?
        ORDER BY CASE WHEN id = ? THEN 0 ELSE 1 END, ordem ASC, id ASC
    ");
    $stmt->execute([$type, $entityId, $photoId]);
    $photoIds = array_map('intval', array_column($stmt->fetchAll(), 'id'));

    if (empty($photoIds)) {
        return;
    }

    $pdo->beginTransaction();
    try {
        $stmtUpdate = $pdo->prepare("UPDATE fotos SET ordem = ? WHERE id = ? AND entidade_tipo = ? AND entidade_id = ?");
        foreach ($photoIds as $index => $currentPhotoId) {
            $stmtUpdate->execute([($index + 1) * 10, $currentPhotoId, $type, $entityId]);
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function listEntityPhotos(PDO $pdo, string $type, int $entityId): array {
    $entity = fetchEntity($pdo, $type, $entityId);
    $coverUrl = cleanImagePath($entity['imagem_capa'] ?? '');
    $coverComparable = normalizeEntityPhotoUrl($coverUrl);
    ensureEntityCoverPhoto($pdo, $type, $entityId, $coverUrl);

    $stmt = $pdo->prepare("
        SELECT id, url_imagem, legenda, ordem
        FROM fotos
        WHERE entidade_tipo = ? AND entidade_id = ?
        ORDER BY ordem ASC, id ASC
    ");
    $stmt->execute([$type, $entityId]);

    $photos = [];
    foreach ($stmt->fetchAll() as $photo) {
        $url = cleanImagePath($photo['url_imagem'] ?? '');
        if ($url === '') {
            continue;
        }

        $photos[] = [
            'id' => (int) $photo['id'],
            'url_imagem' => $url,
            'legenda' => (string) ($photo['legenda'] ?? ''),
            'ordem' => (int) ($photo['ordem'] ?? 0),
            'is_cover' => normalizeEntityPhotoUrl($url) === $coverComparable,
        ];
    }

    return [
        'entity' => [
            'tipo' => $type,
            'id' => $entityId,
            'imagem_capa' => $coverUrl,
        ],
        'photos' => $photos,
    ];
}

function uploadedEntityPhotoFiles(): array {
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

function validateEntityPhotoUploadFile(array $file): array {
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
        return ['valid' => false, 'name' => $name, 'reason' => 'Upload inválido.'];
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmpName);
    if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
        return ['valid' => false, 'name' => $name, 'reason' => 'Tipo de arquivo não permitido.'];
    }

    if (@getimagesize($tmpName) === false) {
        return ['valid' => false, 'name' => $name, 'reason' => 'Arquivo de imagem inválido.'];
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
            $reasons['format'] = 'formato inválido';
        } elseif (strpos($reason, 'imagem') !== false) {
            $reasons['image'] = 'arquivo de imagem inválido';
        } elseif (strpos($reason, 'upload') !== false) {
            $reasons['upload'] = 'falha no upload';
        } else {
            $reasons['other'] = 'arquivo incompatível';
        }
    }

    if (empty($reasons)) {
        return 'Nenhuma imagem válida enviada.';
    }

    return 'Nenhuma imagem válida enviada: ' . implode(', ', array_values($reasons)) . '.';
}

function entityPhotoInputType(): string {
    return normalizeEntityPhotoType($_GET['tipo'] ?? $_POST['tipo'] ?? '');
}

function entityPhotoInputId(): int {
    $value = $_GET['id'] ?? $_POST['id'] ?? null;
    $id = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if (!$id) {
        sendError('Identificador inválido.', 400);
    }

    return (int) $id;
}

if ($method === 'GET' && $action === 'list') {
    $type = entityPhotoInputType();
    $entityId = entityPhotoInputId();
    sendSuccess(listEntityPhotos($pdo, $type, $entityId));
}

if ($method === 'POST' && $action === 'create') {
    $type = entityPhotoInputType();
    $entityId = entityPhotoInputId();
    $entity = fetchEntity($pdo, $type, $entityId);
    $files = uploadedEntityPhotoFiles();

    if (empty($files)) {
        sendError('Nenhuma imagem enviada.');
    }

    $validFiles = [];
    $skipped = [];
    foreach ($files as $file) {
        $validation = validateEntityPhotoUploadFile($file);
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

    $stmtOrder = $pdo->prepare("SELECT COALESCE(MAX(ordem), 0) FROM fotos WHERE entidade_tipo = ? AND entidade_id = ?");
    $stmtOrder->execute([$type, $entityId]);
    $nextOrder = ((int) $stmtOrder->fetchColumn()) + 10;

    $created = [];
    foreach ($validFiles as $file) {
        $upload = saveUploadedImage($file, 'entity');
        $caption = cleanString($_POST['legenda'] ?? '', 255);

        $stmt = $pdo->prepare("
            INSERT INTO fotos (url_imagem, legenda, entidade_tipo, entidade_id, ordem)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$upload['url'], $caption, $type, $entityId, $nextOrder]);
        $created[] = [
            'id' => (int) $pdo->lastInsertId(),
            'url_imagem' => $upload['url'],
            'ordem' => $nextOrder,
        ];
        $nextOrder += 10;
    }

    if (cleanImagePath($entity['imagem_capa'] ?? '') === '' && !empty($created[0]['url_imagem'])) {
        syncEntityCoverImage($pdo, $type, $entityId, $created[0]['url_imagem']);
    }

    $response = listEntityPhotos($pdo, $type, $entityId);
    $response['skipped'] = $skipped;
    $response['saved_count'] = count($created);
    $message = count($created) === 1 ? 'Foto adicionada à galeria.' : 'Fotos adicionadas à galeria.';
    if (!empty($skipped)) {
        $message .= ' Algumas imagens foram ignoradas.';
    }

    sendSuccess($response, $message);
}

if ($method === 'POST' && $action === 'set_cover') {
    $photoId = getPositiveIntParam('id');
    $photo = fetchEntityPhoto($pdo, $photoId);
    $type = $photo['entidade_tipo'];
    $entityId = (int) $photo['entidade_id'];
    syncEntityCoverImage($pdo, $type, $entityId, cleanImagePath($photo['url_imagem']));
    promoteEntityPhotoToFirst($pdo, $type, $entityId, $photoId);
    sendSuccess(listEntityPhotos($pdo, $type, $entityId), 'Capa atualizada.');
}

if (($method === 'POST' || $method === 'PUT') && $action === 'update_legenda') {
    $photoId = getPositiveIntParam('id');
    $photo = fetchEntityPhoto($pdo, $photoId);
    $data = getRequestData();
    $caption = cleanString($data['legenda'] ?? '', 255);

    $stmt = $pdo->prepare("UPDATE fotos SET legenda = ? WHERE id = ?");
    $stmt->execute([$caption, $photoId]);

    sendSuccess(listEntityPhotos($pdo, $photo['entidade_tipo'], (int) $photo['entidade_id']), 'Legenda atualizada.');
}

if ($method === 'POST' && $action === 'reorder') {
    $type = entityPhotoInputType();
    $entityId = entityPhotoInputId();
    fetchEntity($pdo, $type, $entityId);
    $data = getRequestData();
    $ids = $data['ids'] ?? [];

    if (!is_array($ids)) {
        sendError('Ordem inválida.', 400);
    }

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("UPDATE fotos SET ordem = ? WHERE id = ? AND entidade_tipo = ? AND entidade_id = ?");
        foreach (array_values($ids) as $index => $id) {
            $photoId = filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            if ($photoId) {
                $stmt->execute([($index + 1) * 10, (int) $photoId, $type, $entityId]);
            }
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }

    sendSuccess(listEntityPhotos($pdo, $type, $entityId), 'Ordem atualizada.');
}

if (($method === 'DELETE' || ($method === 'POST' && $action === 'delete')) && $action === 'delete') {
    $photoId = getPositiveIntParam('id');
    $photo = fetchEntityPhoto($pdo, $photoId);
    $type = $photo['entidade_tipo'];
    $entityId = (int) $photo['entidade_id'];
    $entity = fetchEntity($pdo, $type, $entityId);
    $wasCover = normalizeEntityPhotoUrl($entity['imagem_capa'] ?? '') === normalizeEntityPhotoUrl($photo['url_imagem'] ?? '');

    $stmtDel = $pdo->prepare("DELETE FROM fotos WHERE id = ?");
    $stmtDel->execute([$photoId]);

    $filePath = resolveUploadFilePath($photo['url_imagem'], 'entity');
    if ($filePath && file_exists($filePath)) {
        unlink($filePath);
    }

    if ($wasCover) {
        $stmtNext = $pdo->prepare("
            SELECT url_imagem
            FROM fotos
            WHERE entidade_tipo = ? AND entidade_id = ?
            ORDER BY ordem ASC, id ASC
            LIMIT 1
        ");
        $stmtNext->execute([$type, $entityId]);
        syncEntityCoverImage($pdo, $type, $entityId, cleanImagePath($stmtNext->fetchColumn() ?: ''));
    }

    sendSuccess(listEntityPhotos($pdo, $type, $entityId), 'Foto removida.');
}

sendError('Rota inválida.', 404);
?>
