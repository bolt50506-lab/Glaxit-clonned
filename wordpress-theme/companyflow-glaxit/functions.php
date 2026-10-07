<?php
if (!defined('ABSPATH')) exit;

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
});

/*
 * CompanyFlow WordPress migration
 * --------------------------------
 * The GitHub clone remains the source of truth. WordPress renders the
 * original HTML documents directly; no header, footer, hero, project grid,
 * animation or page-builder replacement is generated here.
 */
add_action('template_redirect', function () {
    $path = trim(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');

    $is_clone_route = (
        $path === '' ||
        $path === 'home' ||
        strpos($path, 'blog/case-study/') === 0
    );

    if ($is_clone_route || is_404()) {
        status_header(200);
        nocache_headers();
        companyflow_render_local(companyflow_clone_path());
        exit;
    }
});

function companyflow_clone_path() {
    $uri = trim(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');
    if ($uri === '' || $uri === 'home') return '/';
    return '/' . $uri . '/';
}

function companyflow_local_html_path($path) {
    $root = trailingslashit(get_stylesheet_directory()) . 'original-pages';

    if ($path === '/' || $path === '') {
        return $root . '/index.html';
    }

    $clean = trim($path, '/');
    return $root . '/' . $clean . '/index.html';
}

function companyflow_render_local($path = '/') {
    $file = companyflow_local_html_path($path);

    if (!file_exists($file)) {
        status_header(404);
        wp_die('CompanyFlow page was not found in the migrated theme.', 'CompanyFlow', ['response' => 404]);
    }

    $html = file_get_contents($file);
    if ($html === false || trim($html) === '') {
        status_header(500);
        wp_die('CompanyFlow migrated page could not be read.', 'CompanyFlow', ['response' => 500]);
    }

    $theme_assets = trailingslashit(get_stylesheet_directory_uri()) . 'assets/';
    $original_assets = $theme_assets . 'original/';
    $wp_home = home_url('/');

    // The migrated HTML now runs on the WordPress domain itself.
    $html = preg_replace('/<base\b[^>]*>/i', '', $html);
    $html = preg_replace(
        '/<head\b[^>]*>/i',
        '<head><base href="' . esc_url($wp_home) . '">',
        $html,
        1
    );

    // Keep the exact animation libraries bundled inside this theme.
    $html = str_replace(
        [
            './cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
            'cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
            './cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
            'cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
            './unpkg.com/split-type',
            'unpkg.com/split-type',
        ],
        [
            $original_assets . 'gsap.min.js',
            $original_assets . 'gsap.min.js',
            $original_assets . 'ScrollTrigger.min.js',
            $original_assets . 'ScrollTrigger.min.js',
            $original_assets . 'split-type.js',
            $original_assets . 'split-type.js',
        ],
        $html
    );

    // All original LiteSpeed CSS/JS dependencies are now bundled locally.
    $html = preg_replace_callback(
        '#(?:https?:\/\/glaxit-clonned\.onrender\.com\/)?(?:\.\/)?wp-content\/litespeed\/(css|js)\/([^"\'\s?]+\.(?:css|js))#i',
        function ($m) use ($original_assets) {
            $type = strtolower($m[1]);
            $file_name = basename($m[2]);
            $file = trailingslashit(get_stylesheet_directory()) . 'assets/original/' . $type . '/' . $file_name;
            if (file_exists($file)) {
                return $original_assets . $type . '/' . $file_name;
            }
            return $m[0];
        },
        $html
    );

    // Remaining WordPress/plugin runtime files used by the original page
    // are bundled too, so the migrated theme does not depend on the old host.
    $html = str_replace(
        [
            './wp-content/plugins/litespeed-cache/assets/js/css_async.min.js',
            'wp-content/plugins/litespeed-cache/assets/js/css_async.min.js',
            './wp-includes/js/jquery/jquery.min.js',
            'wp-includes/js/jquery/jquery.min.js',
            './wp-includes/js/wp-emoji-release.min.js',
            'wp-includes/js/wp-emoji-release.min.js',
            './wp-content/plugins/elementor/assets/lib/dialog/dialog.min.js',
            'wp-content/plugins/elementor/assets/lib/dialog/dialog.min.js',
            './wp-content/plugins/elementor/assets/lib/swiper/v8/swiper.min.js',
            'wp-content/plugins/elementor/assets/lib/swiper/v8/swiper.min.js',
        ],
        [
            $original_assets . 'runtime/css_async.min.js',
            $original_assets . 'runtime/css_async.min.js',
            $original_assets . 'runtime/jquery.min.js',
            $original_assets . 'runtime/jquery.min.js',
            $original_assets . 'runtime/wp-emoji-release.min.js',
            $original_assets . 'runtime/wp-emoji-release.min.js',
            $original_assets . 'runtime/dialog.min.js',
            $original_assets . 'runtime/dialog.min.js',
            $original_assets . 'runtime/swiper.min.js',
            $original_assets . 'runtime/swiper.min.js',
        ],
        $html
    );

    // CompanyFlow branding and migrated theme assets.
    $html = str_replace(
        [
            './assets/companyflow-logo-new.svg',
            'assets/companyflow-logo-new.svg',
            './assets/companyflow-cf-favicon.svg',
            'assets/companyflow-cf-favicon.svg',
            './assets/glaxit-case-study.css',
            'assets/glaxit-case-study.css',
            '/wp-content/uploads/',
            '../wp-content/uploads/',
            '../../wp-content/uploads/',
            '../../../wp-content/uploads/',
        ],
        [
            $theme_assets . 'companyflow-logo-new.svg',
            $theme_assets . 'companyflow-logo-new.svg',
            $theme_assets . 'companyflow-cf-favicon.svg',
            $theme_assets . 'companyflow-cf-favicon.svg',
            $theme_assets . 'glaxit-case-study.css',
            $theme_assets . 'glaxit-case-study.css',
            $theme_assets . 'uploads/',
            $theme_assets . 'uploads/',
            $theme_assets . 'uploads/',
            $theme_assets . 'uploads/',
        ],
        $html
    );

    // The original navigation is retained; only internal links are pointed
    // at the active WordPress site.
    $wp_host = wp_parse_url($wp_home, PHP_URL_HOST);
    $html = preg_replace_callback(
        '/(<a\b[^>]*\bhref=["\'])([^"\']+)(["\'])/i',
        function ($match) use ($wp_home, $wp_host) {
            $href = $match[2];

            if (
                $href === '#' ||
                preg_match('#^(?:https?:|mailto:|tel:|javascript:|//)#i', $href)
            ) {
                return $match[0];
            }

            $parts = wp_parse_url($href);
            if (!empty($parts['host']) && $parts['host'] !== $wp_host) {
                return $match[0];
            }

            $path = $parts['path'] ?? $href;
            $new = ($path === '/' || $path === '')
                ? $wp_home
                : trailingslashit($wp_home . ltrim($path, '/'));

            if (!empty($parts['query'])) $new .= '?' . $parts['query'];
            if (!empty($parts['fragment'])) $new .= '#' . $parts['fragment'];

            return $match[1] . esc_url($new) . $match[3];
        },
        $html
    );

    echo $html;
}
