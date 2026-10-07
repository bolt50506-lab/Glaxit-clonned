<?php
if (!defined('ABSPATH')) exit;

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('companyflow-wp-bridge', get_stylesheet_uri(), [], '1.0.0');
});

function companyflow_clone_path() {
    $uri = trim(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');
    if ($uri === '' || $uri === 'home') return '/';
    return '/' . $uri . '/';
}

function companyflow_fetch_clone($path = '/') {
    $base = 'https://glaxit-clonned.onrender.com';
    $url = $base . '/' . ltrim($path, '/');
    $response = wp_remote_get($url, [
        'timeout' => 20,
        'redirection' => 5,
        'sslverify' => true,
        'headers' => ['User-Agent' => 'CompanyFlow WordPress Migration'],
    ]);
    if (is_wp_error($response)) return '';
    $code = wp_remote_retrieve_response_code($response);
    if ($code < 200 || $code >= 400) return '';
    return wp_remote_retrieve_body($response);
}

function companyflow_render_clone($path = '/') {
    $html = companyflow_fetch_clone($path);
    if (!$html) {
        echo '<main style="padding:80px 24px;font-family:Arial;background:#10131a;color:#fff;min-height:60vh"><h1>CompanyFlow</h1><p>The frontend source is temporarily unavailable. Please try again.</p></main>';
        return;
    }

    // Keep the existing frontend intact. The <base> element makes every relative
    // CSS/JS/image URL resolve against the existing clone while we prepare the
    // permanent self-contained WordPress theme.
    $html = preg_replace('/<head(.*?)>/i', '<head$1><base href="https://glaxit-clonned.onrender.com/">', $html, 1);
    echo $html;
}
