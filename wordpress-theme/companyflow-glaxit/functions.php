<?php
if (!defined('ABSPATH')) exit;

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('companyflow-wp-bridge', get_stylesheet_uri(), [], '1.2.0');
});

/*
 * The original Glaxit-cloned frontend remains the visual source of truth.
 * WordPress acts as the routing/rendering shell so the existing frontend
 * does not have to be rebuilt in Gutenberg/Elementor.
 */
add_action('template_redirect', function () {
    if (is_404()) {
        status_header(200);
        nocache_headers();
        companyflow_render_clone(companyflow_clone_path());
        exit;
    }
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
        'timeout' => 30,
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
        echo '<main class="companyflow-migration-error"><h1>CompanyFlow</h1><p>The existing frontend is temporarily unavailable.</p></main>';
        return;
    }

    // Render the existing clone inside WordPress without rebuilding it with blocks.
    // Keep the original relative asset/link behavior by setting a base URL.
    $base = 'https://glaxit-clonned.onrender.com/';
    $html = preg_replace('/<head\b[^>]*>/i', '<head><base href="' . esc_url($base) . '">', $html, 1);
    $html = preg_replace('/<script[^>]*class="rank-math-schema"[^>]*>.*?<\/script>/is', '', $html);
    $html = preg_replace('/<link[^>]+rel=["\']canonical["\'][^>]*>/i', '', $html);

    if (preg_match('/<body\b[^>]*>(.*)<\/body>/is', $html, $m)) {
        echo $m[1];
    } else {
        echo $html;
    }
}
