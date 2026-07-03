<?php
require_once __DIR__ . '/includes/session.php';
startAdminSession();

if (isset($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Administrativo | ATURP</title>
    <link rel="stylesheet" href="../css/login.css">
</head>
<body>
    <main class="login-page">
        <section class="login-card" aria-labelledby="login-title">
            <div class="login-card__brand">
                <img
                    src="../assets/branding/aturp-logo-horizontal-transparent.png"
                    alt="ATURP"
                    class="login-card__logo"
                />
            </div>

            <form class="login-form" id="login-form">
                <div class="login-form__field">
                    <label for="email">E-mail</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        autocomplete="email"
                        placeholder="admin@aturp.com.br"
                        required
                    />
                </div>

                <div class="login-form__field">
                    <label for="password">Senha</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        autocomplete="current-password"
                        placeholder="sua senha"
                        required
                    />
                </div>

                <div id="login-error" style="color: #ef4444; font-size: 0.9rem; margin-bottom: 1rem; display: none;"></div>

                <button class="login-form__submit" type="submit" id="submit-btn" style="width: 100%; border: none; padding: 12px; border-radius: 8px; background: #10b981; color: #fff; font-weight: bold; cursor: pointer;">Entrar</button>
            </form>
        </section>
    </main>

    <script>
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('login-error');
            const submitBtn = document.getElementById('submit-btn');
            
            errorDiv.style.display = 'none';
            submitBtn.textContent = 'Carregando...';
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);

            try {
                const res = await fetch('api/auth.php?action=login', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await res.json();
                
                if (data.success) {
                    window.location.href = 'index.php';
                } else {
                    errorDiv.textContent = data.error || 'Erro ao realizar login.';
                    errorDiv.style.display = 'block';
                }
            } catch(err) {
                errorDiv.textContent = 'Erro de comunicação com o servidor.';
                errorDiv.style.display = 'block';
            } finally {
                submitBtn.textContent = 'Entrar';
                submitBtn.disabled = false;
            }
        });
    </script>
</body>
</html>
