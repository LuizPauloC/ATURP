<?php
function aturpHtml($value): string
{
    return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function aturpNormalizePublicImagePath($value): string
{
    $rawValue = trim((string) ($value ?? ''));
    if ($rawValue === '') {
        return '';
    }

    $parts = parse_url($rawValue);
    if ($parts === false) {
        return '';
    }

    $scheme = strtolower((string) ($parts['scheme'] ?? ''));
    if ($scheme !== '') {
        if (!in_array($scheme, ['http', 'https'], true)) {
            return '';
        }

        $host = strtolower((string) ($parts['host'] ?? ''));
        $requestHost = strtolower((string) ($_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? ''));
        $requestHost = preg_replace('/:\d+$/', '', $requestHost);
        $host = preg_replace('/^www\./', '', $host);
        $requestHost = preg_replace('/^www\./', '', $requestHost);

        if ($host === '' || $requestHost === '' || $host !== $requestHost) {
            return '';
        }

        $path = (string) ($parts['path'] ?? '');
    } else {
        if (strpos($rawValue, '//') === 0) {
            return '';
        }

        $path = $rawValue;
    }

    if (strpos($path, '\\') !== false) {
        return '';
    }

    $path = rawurldecode($path);
    $path = preg_replace('#^\./#', '', $path);
    $path = ltrim($path, '/');

    if ($path === '' || preg_match('/[<>"\'`\x00-\x1F\x7F]/', $path)) {
        return '';
    }

    $segments = explode('/', $path);
    foreach ($segments as $segment) {
        if ($segment === '' || $segment === '.' || $segment === '..') {
            return '';
        }
    }

    if (!preg_match('#^(uploads|assets)/#i', $path) || !preg_match('#\.(jpe?g|png|webp|gif)$#i', $path)) {
        return '';
    }

    return $path;
}

function aturpPublicImageSrc($value, string $fallback = ''): string
{
    $path = aturpNormalizePublicImagePath($value);
    return $path !== '' ? $path : $fallback;
}

function aturpPublicHttpUrl($value): string
{
    $value = trim((string) ($value ?? ''));
    if ($value === '' || $value === '#') {
        return '';
    }

    $scheme = parse_url($value, PHP_URL_SCHEME);
    return $scheme && in_array(strtolower($scheme), ['http', 'https'], true) ? $value : '';
}

function aturpWhatsAppUrl($value): string
{
    $digits = preg_replace('/\D/', '', (string) ($value ?? ''));
    return $digits !== '' ? 'https://wa.me/' . $digits : '';
}

function aturpSafeSvgIcon($value, string $fallback): string
{
    $value = trim((string) ($value ?? ''));

    if ($value === '' || strlen($value) > 5000 || stripos($value, '<svg') !== 0 || stripos($value, '</svg>') === false) {
        return $fallback;
    }

    if (preg_match('/<\s*(script|iframe|object|embed|foreignObject|image)\b|on\w+\s*=|javascript:/i', $value)) {
        return $fallback;
    }

    return $value;
}
