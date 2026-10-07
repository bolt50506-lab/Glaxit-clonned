<?php
if (!defined('ABSPATH')) exit;

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    // The existing GitHub HTML document is rendered directly; WordPress does not inject a replacement header/footer.
});

add_action('template_redirect', function () {
    $path = trim(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');

    /*
     * The existing GitHub frontend remains the source of truth.
     * Intercept the homepage and every existing case-study route so
     * WordPress page-builder content cannot replace the original UI.
     */
    $is_frontend_clone_route = (
        $path === '' ||
        $path === 'home' ||
        strpos($path, 'blog/case-study/') === 0
    );

    if ($is_frontend_clone_route || is_404()) {
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
        echo '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CompanyFlow</title></head><body><main class="companyflow-migration-error"><h1>CompanyFlow</h1><p>The existing frontend is temporarily unavailable.</p></main></body></html>';
        return;
    }

    /*
     * IMPORTANT:
     * The GitHub clone is the source of truth.
     * Do not rebuild its header, footer, hero, project section, animations,
     * styles or scripts with WordPress blocks/theme markup.
     *
     * We render the complete existing HTML document so the original
     * header/footer and all frontend behavior remain intact.
     */
    $base = 'https://glaxit-clonned.onrender.com/';
    $theme_assets = trailingslashit(get_stylesheet_directory_uri()) . 'assets/';
    $original_assets = $theme_assets . 'original/';

    // Keep the existing animation stack, but serve its exact library files
    // from the WordPress theme instead of the public CDN.
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
    $html = preg_replace('/<base\\b[^>]*>/i', '', $html);
    $html = preg_replace('/<head\\b[^>]*>/i', '<head><base href="' . esc_url($base) . '">', $html, 1);
    
    // Resolve the original site's bundled LiteSpeed CSS/JS through the
    // WordPress theme when those exact files are present in the theme.
    $html = preg_replace_callback(
        '#(?:https?:\\/\\/glaxit-clonned\\.onrender\\.com\\/)?(?:\\.\\/)?wp-content\\/litespeed\\/(css|js)\\/([^"\\\'\\s?]+\\.(?:css|js))#i',
        function ($m) use ($original_assets) {
            $type = strtolower($m[1]);
            return $original_assets . $type . '/' . basename($m[2]);
        },
        $html
    );

    /*
     * Keep the frontend markup untouched, but serve the migrated CompanyFlow
     * images/logo/favicon from the WordPress theme itself.
     */
    $html = str_replace(
        [
            './assets/companyflow-logo-new.svg',
            './assets/companyflow-cf-favicon.svg',
            'assets/companyflow-logo-new.svg',
            'assets/companyflow-cf-favicon.svg',
            '/wp-content/uploads/',
            '../wp-content/uploads/',
            '../../wp-content/uploads/',
            '../../../wp-content/uploads/',
        ],
        [
            $theme_assets . 'companyflow-logo-new.svg',
            $theme_assets . 'companyflow-cf-favicon.svg',
            $theme_assets . 'companyflow-logo-new.svg',
            $theme_assets . 'companyflow-cf-favicon.svg',
            $theme_assets . 'uploads/',
            $theme_assets . 'uploads/',
            $theme_assets . 'uploads/',
            $theme_assets . 'uploads/',
        ],
        $html
    );

    // Keep internal navigation ready for the eventual WordPress domain,
    // while leaving external URLs, assets and scripts untouched.
    $wp_home = home_url('/');
    $wp_host = wp_parse_url($wp_home, PHP_URL_HOST);

    $html = preg_replace_callback(
        '/(<a\\b[^>]*\\bhref=["\\'])([^"\\']+)(["\\'])/i',
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
            if ($path === '/' || $path === '') {
                $new = $wp_home;
            } else {
                $new = trailingslashit($wp_home . ltrim($path, '/'));
            }

            if (!empty($parts['query'])) {
                $new .= '?' . $parts['query'];
            }
            if (!empty($parts['fragment'])) {
                $new .= '#' . $parts['fragment'];
            }

            return $match[1] . esc_url($new) . $match[3];
        },
        $html
    );

    echo $html;
}
