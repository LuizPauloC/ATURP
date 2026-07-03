<?php
// admin/api/upload.php
require_once __DIR__ . '/core.php';
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Metodo invalido.', 405);
}

if (!isset($_FILES['image'])) {
    sendError('Nenhum arquivo enviado.');
}

$upload = saveUploadedImage($_FILES['image']);

sendSuccess(['url' => $upload['url']], 'Imagem salva e otimizada com sucesso.');
?>
