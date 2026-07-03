<?php
// admin/api/auth.php
require_once __DIR__ . '/core.php';

$action = $_GET['action'] ?? '';
$pdo = getDbConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'login') {
    $email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $password = (string) ($_POST['password'] ?? '');

    if (!$email || $password === '') {
        sendError('E-mail e senha sao obrigatorios.');
    }

    $stmt = $pdo->prepare("SELECT id, nome, email, senha_hash, nivel_acesso FROM usuarios_admin WHERE email = :email");
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['senha_hash'])) {
        session_regenerate_id(true);
        $_SESSION['admin_id'] = $user['id'];
        $_SESSION['admin_nome'] = $user['nome'];
        $_SESSION['admin_nivel'] = $user['nivel_acesso'];
        getAdminCsrfToken();

        sendSuccess([
            'nome' => $user['nome'],
            'nivel' => $user['nivel_acesso']
        ], 'Login realizado com sucesso.');
    }

    sendError('E-mail ou senha incorretos.', 401);
}

if ($action === 'logout') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Metodo invalido.', 405);
    }

    requireAuth();
    clearAdminSession();
    sendSuccess(null, 'Deslogado com sucesso.');
}

if ($action === 'check') {
    if (isset($_SESSION['admin_id'])) {
        sendSuccess([
            'nome' => $_SESSION['admin_nome'] ?? '',
            'nivel' => $_SESSION['admin_nivel'] ?? ''
        ]);
    }

    sendError('Nao logado.', 401);
}

sendError('Acao invalida.', 400);
?>
