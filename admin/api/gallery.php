<?php
// admin/api/gallery.php
require_once __DIR__ . '/core.php';
requireAuth();

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// GET - Listar fotos da galeria global
if ($method === 'GET' && $action === 'list') {
    $stmt = $pdo->query("
        SELECT id, url_imagem, legenda, ordem
        FROM fotos
        WHERE entidade_tipo = 'galeria_global'
        ORDER BY ordem ASC, id DESC
    ");
    sendSuccess($stmt->fetchAll());
}

// POST - Adicionar foto
if ($method === 'POST' && $action === 'create') {
    if (!isset($_FILES['image'])) {
        sendError('Nenhuma imagem enviada.');
    }

    $upload = saveUploadedImage($_FILES['image'], 'gallery');
    $legenda = cleanString($_POST['legenda'] ?? '', 255);

    $stmt = $pdo->prepare("
        INSERT INTO fotos (url_imagem, legenda, entidade_tipo, ordem)
        VALUES (?, ?, 'galeria_global', 0)
    ");
    $stmt->execute([$upload['url'], $legenda]);

    sendSuccess(['id' => $pdo->lastInsertId(), 'url' => $upload['url']], 'Foto adicionada a galeria.');
}

// DELETE - Remover foto
if (($method === 'DELETE' || ($method === 'POST' && $action === 'delete')) && isset($_GET['id'])) {
    $id = getPositiveIntParam('id');

    $stmt = $pdo->prepare("SELECT url_imagem FROM fotos WHERE id = ? AND entidade_tipo = 'galeria_global'");
    $stmt->execute([$id]);
    $foto = $stmt->fetch();

    if (!$foto) {
        sendError('Foto nao encontrada.', 404);
    }

    $filePath = resolveUploadFilePath($foto['url_imagem'], 'gallery');
    if ($filePath && file_exists($filePath)) {
        unlink($filePath);
    }

    $stmtDel = $pdo->prepare("DELETE FROM fotos WHERE id = ? AND entidade_tipo = 'galeria_global'");
    $stmtDel->execute([$id]);
    sendSuccess(null, 'Foto removida.');
}

// POST - Atualizar legenda
if (($method === 'POST' || $method === 'PUT') && $action === 'update_legenda' && isset($_GET['id'])) {
    $id = getPositiveIntParam('id');
    $data = getRequestData();
    $legenda = cleanString($data['legenda'] ?? '', 255);

    $stmt = $pdo->prepare("UPDATE fotos SET legenda = ? WHERE id = ? AND entidade_tipo = 'galeria_global'");
    $stmt->execute([$legenda, $id]);

    sendSuccess(null, 'Legenda atualizada.');
}

sendError('Rota invalida.', 404);
?>
