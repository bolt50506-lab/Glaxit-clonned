<?php
if (!defined('ABSPATH')) exit;

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('companyflow-wp-bridge', get_stylesheet_uri(), [], '1.3.0');
    wp_enqueue_script('companyflow-frontend', get_theme_file_uri('assets/js/companyflow.js'), [], '1.0.0', true);
});

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

    $base = 'https://glaxit-clonned.onrender.com/';
    $html = preg_replace('/<head\b[^>]*>/i', '<head><base href="' . esc_url($base) . '">', $html, 1);
    $html = preg_replace('/<script[^>]*class="rank-math-schema"[^>]*>.*?<\/script>/is', '', $html);
    $html = preg_replace('/<link[^>]+rel=["\']canonical["\'][^>]*>/i', '', $html);

    if (preg_match('/<body\b[^>]*>(.*)<\/body>/is', $html, $m)) {
        $body = $m[1];

        // The migrated theme asset owns CompanyFlow custom behavior now.
        $body = preg_replace('/<script[^>]*id=["\']companyflow-(?:projects|button|category|counter)-[^>]*>.*?<\/script>/is', '', $body);

        // Keep internal navigation on the eventual WordPress domain.
        $wp_home = home_url('/');
        $body = preg_replace_callback(
            '/(<a\b[^>]*\bhref=["\'])([^"\']+)(["\'])/i',
            function ($match) use ($wp_home) {
                $href = $match[2];
                if (
                    $href === '#' ||
                    preg_match('#^(?:https?:|mailto:|tel:|javascript:|//)#i', $href) ||
                    str_starts_with($href, '/assets/') ||
                    str_starts_with($href, '/wp-content/')
                ) return $match[0];

                $parts = wp_parse_url($href);
                if (!empty($parts['host']) && $parts['host'] !== wp_parse_url(home_url('/'), PHP_URL_HOST)) return $match[0];

                $path = $parts['path'] ?? $href;
                if ($path === '/') return $match[1] . $wp_home . $match[3];

                return $match[1] . trailingslashit($wp_home . ltrim($path, '/')) .
                    (!empty($parts['query']) ? '?' . $parts['query'] : '') .
                    (!empty($parts['fragment']) ? '#' . $parts['fragment'] : '') . $match[3];
            },
            $body
        );

        echo $body;
    } else {
        echo $html;
    }
}
