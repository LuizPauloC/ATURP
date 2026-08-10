<?php
// admin/api/core.php
// Centraliza inicializacao, seguranca e resposta JSON para as APIs do painel.

ini_set('display_errors', '0');
$aturpApiBufferLevel = ob_get_level();
ob_start();

require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/security.php';

startAdminSession();

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0, no-transform');
header('Pragma: no-cache');

function sendJson($data, $statusCode = 200) {
    global $aturpApiBufferLevel;

    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    if ($json === false) {
        error_log('Falha ao serializar JSON da API admin: ' . json_last_error_msg());
        $statusCode = 500;
        $json = '{"success":false,"error":"Erro ao gerar resposta JSON."}';
    }

    while (ob_get_level() > $aturpApiBufferLevel) {
        ob_end_clean();
    }

    http_response_code($statusCode);
    echo $json;
    exit;
}

function sendError($message, $statusCode = 400) {
    sendJson(['success' => false, 'error' => $message], $statusCode);
}

function sendSuccess($data = null, $message = null) {
    $response = ['success' => true];
    if ($message) $response['message'] = $message;
    if ($data !== null) $response['data'] = $data;
    sendJson($response);
}

function isUnsafeMethod(): bool {
    return in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['POST', 'PUT', 'PATCH', 'DELETE'], true);
}

function requireCsrfToken(): void {
    if (!isUnsafeMethod()) {
        return;
    }

    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($_POST['_csrf_token'] ?? '');
    $sessionToken = $_SESSION['csrf_token'] ?? '';

    if (!$token || !$sessionToken || !hash_equals($sessionToken, $token)) {
        sendError('Token de seguranca invalido.', 403);
    }
}

function getRequestData(): array {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (stripos($contentType, 'application/json') !== false) {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    return $_POST;
}

function getPositiveIntParam(string $name): int {
    $value = filter_input(INPUT_GET, $name, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1],
    ]);

    if (!$value) {
        sendError('Identificador invalido.', 400);
    }

    return (int) $value;
}

function cleanString($value, int $maxLength = 255): string {
    $value = trim((string) ($value ?? ''));

    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength, 'UTF-8');
    }

    return substr($value, 0, $maxLength);
}

function cleanUrl($value, int $maxLength = 500): string {
    $value = cleanString($value, $maxLength);

    if ($value === '' || $value === '#') {
        return $value;
    }

    $scheme = parse_url($value, PHP_URL_SCHEME);
    if (!$scheme || !in_array(strtolower($scheme), ['http', 'https', 'tel', 'mailto'], true)) {
        return '';
    }

    return $value;
}

function cleanImagePath($value): string {
    $path = aturpNormalizePublicImagePath(cleanString($value, 500));
    return $path !== '' ? './' . $path : '';
}

function cleanSvgIcon($value): string {
    $value = trim((string) ($value ?? ''));

    if ($value === '') {
        return '';
    }

    if (strlen($value) > 5000 || stripos($value, '<svg') !== 0 || stripos($value, '</svg>') === false) {
        return '';
    }

    if (preg_match('/<\s*(script|iframe|object|embed|foreignObject|image)\b|on\w+\s*=|javascript:/i', $value)) {
        return '';
    }

    return $value;
}

function saveUploadedImage(array $file, string $subdir = ''): array {
    $maxSize = 5 * 1024 * 1024;

    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        sendError('Nenhum arquivo enviado ou erro no upload.');
    }

    if (($file['size'] ?? 0) <= 0 || $file['size'] > $maxSize) {
        sendError('Imagem muito grande. Envie um arquivo de ate 5 MB.');
    }

    if (!is_uploaded_file($file['tmp_name'])) {
        sendError('Upload invalido.');
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!in_array($mime, $allowedTypes, true)) {
        sendError('Tipo de arquivo nao permitido. Envie JPG, PNG ou WEBP.');
    }

    if (@getimagesize($file['tmp_name']) === false) {
        sendError('Arquivo de imagem invalido.');
    }

    switch ($mime) {
        case 'image/jpeg':
            $sourceImage = @imagecreatefromjpeg($file['tmp_name']);
            break;
        case 'image/png':
            $sourceImage = @imagecreatefrompng($file['tmp_name']);
            break;
        case 'image/webp':
            $sourceImage = @imagecreatefromwebp($file['tmp_name']);
            break;
        default:
            $sourceImage = false;
    }

    if (!$sourceImage) {
        sendError('Falha ao processar a imagem.');
    }

    $baseDir = __DIR__ . '/../../uploads';
    if (!is_dir($baseDir) && !mkdir($baseDir, 0755, true)) {
        imagedestroy($sourceImage);
        sendError('Falha ao preparar pasta de uploads.', 500);
    }

    $subdir = trim($subdir, '/');
    if ($subdir !== '' && !preg_match('/^[A-Za-z0-9_-]+$/', $subdir)) {
        imagedestroy($sourceImage);
        sendError('Pasta de upload invalida.', 500);
    }

    $targetDir = $subdir === '' ? $baseDir : $baseDir . '/' . $subdir;
    if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true)) {
        imagedestroy($sourceImage);
        sendError('Falha ao preparar pasta de destino.', 500);
    }

    $baseReal = realpath($baseDir);
    $targetReal = realpath($targetDir);
    if (!$baseReal || !$targetReal || strpos($targetReal, $baseReal) !== 0) {
        imagedestroy($sourceImage);
        sendError('Pasta de destino invalida.', 500);
    }

    $width = imagesx($sourceImage);
    $height = imagesy($sourceImage);
    $maxWidth = 1920;
    $quality = 82;

    if ($width > $maxWidth) {
        $newWidth = $maxWidth;
        $newHeight = (int) floor($height * ($maxWidth / $width));
    } else {
        $newWidth = $width;
        $newHeight = $height;
    }

    $virtualImage = imagecreatetruecolor($newWidth, $newHeight);
    $bg = imagecolorallocate($virtualImage, 255, 255, 255);
    imagefill($virtualImage, 0, 0, $bg);
    imagecopyresampled($virtualImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

    $filename = 'img_' . bin2hex(random_bytes(16)) . '.jpg';
    $destination = $targetReal . '/' . $filename;

    if (!imagejpeg($virtualImage, $destination, $quality)) {
        imagedestroy($virtualImage);
        imagedestroy($sourceImage);
        sendError('Falha ao salvar a imagem.', 500);
    }

    chmod($destination, 0644);
    imagedestroy($virtualImage);
    imagedestroy($sourceImage);

    $publicPath = './uploads/' . ($subdir !== '' ? $subdir . '/' : '') . $filename;
    return ['path' => $destination, 'url' => $publicPath];
}

function resolveUploadFilePath(string $publicPath, string $requiredSubdir = ''): ?string {
    $path = parse_url($publicPath, PHP_URL_PATH) ?: $publicPath;
    $path = preg_replace('#^\./#', '', $path);
    $path = ltrim($path, '/');

    if (!preg_match('#^uploads/[A-Za-z0-9._/\-]+\.(jpe?g|png|webp|gif)$#i', $path)) {
        return null;
    }

    if ($requiredSubdir !== '' && strpos($path, 'uploads/' . trim($requiredSubdir, '/') . '/') !== 0) {
        return null;
    }

    $baseReal = realpath(__DIR__ . '/../../uploads');
    $filePath = __DIR__ . '/../../' . $path;
    $dirReal = realpath(dirname($filePath));

    if (!$baseReal || !$dirReal || strpos($dirReal, $baseReal) !== 0) {
        return null;
    }

    return $filePath;
}

function requireAuth() {
    if (!isset($_SESSION['admin_id'])) {
        sendError('Acesso nao autorizado.', 401);
    }

    requireCsrfToken();
}
?>
