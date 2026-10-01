<?php
// English description: Reads the admin-managed Bunny CDN and Bunny Stream settings and reports whether each feature is usable.

if (!function_exists('VNSEEA_BunnyConfig')) {
    function VNSEEA_BunnyConfig($name, $default = '')
    {
        $config = isset($GLOBALS['wo']['config']) && is_array($GLOBALS['wo']['config'])
            ? $GLOBALS['wo']['config']
            : array();
        if (!array_key_exists($name, $config) || $config[$name] === null) {
            return $default;
        }
        $value = trim((string) $config[$name]);
        // A secret saved by the admin panel stays encrypted until an entry
        // point decrypts the config; never treat that cipher text as a key.
        return strpos($value, '$Ap1_') === 0 ? $default : $value;
    }
}

if (!function_exists('VNSEEA_BunnyNormalizeHostname')) {
    /**
     * Accepts "cdn.vnseea.vn", "https://cdn.vnseea.vn/" or a full URL and
     * returns the bare lowercase hostname, or '' when it is not a hostname.
     */
    function VNSEEA_BunnyNormalizeHostname($value)
    {
        $value = strtolower(trim((string) $value));
        if ($value === '') {
            return '';
        }
        if (strpos($value, '://') === false) {
            $value = 'https://' . $value;
        }
        $host = parse_url($value, PHP_URL_HOST);
        if (!is_string($host) || strlen($host) > 253) {
            return '';
        }
        $label = '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?';
        return preg_match('/^(?:' . $label . '\.)+[a-z]{2,63}$/', $host) ? $host : '';
    }
}

if (!function_exists('VNSEEA_BunnyCdnBaseUrl')) {
    /** Returns "https://<cdn host>" when the admin enabled a valid CDN host, '' otherwise. */
    function VNSEEA_BunnyCdnBaseUrl()
    {
        if (VNSEEA_BunnyConfig('vnseea_bunny_cdn_enabled', '0') !== '1') {
            return '';
        }
        $host = VNSEEA_BunnyNormalizeHostname(VNSEEA_BunnyConfig('vnseea_bunny_cdn_hostname'));
        return $host !== '' ? 'https://' . $host : '';
    }
}

if (!function_exists('VNSEEA_BunnyStreamLibraryFields')) {
    /**
     * Admin fields of one Bunny Stream video library. "public" serves posts,
     * reels and stories; "private" serves chat videos behind signed URLs.
     */
    function VNSEEA_BunnyStreamLibraryFields($kind)
    {
        $kind = $kind === 'private' ? 'private' : 'public';
        $prefix = 'vnseea_bunny_stream_' . $kind . '_';
        $fields = array(
            'library_id' => array('key' => $prefix . 'library_id', 'label' => 'Library ID', 'secret' => false),
            'api_key' => array('key' => $prefix . 'api_key', 'label' => 'API Key', 'secret' => true),
            'readonly_key' => array('key' => $prefix . 'readonly_key', 'label' => 'Read-Only API Key', 'secret' => true),
            'cdn_hostname' => array('key' => $prefix . 'cdn_hostname', 'label' => 'CDN Hostname', 'secret' => false),
        );
        if ($kind === 'private') {
            $fields['token_key'] = array('key' => $prefix . 'token_key', 'label' => 'Token Authentication Key', 'secret' => true);
        }
        return $fields;
    }
}

if (!function_exists('VNSEEA_BunnyStreamMissingFields')) {
    /** Lists the labels of the library fields that are still empty or invalid. */
    function VNSEEA_BunnyStreamMissingFields($kind)
    {
        $missing = array();
        foreach (VNSEEA_BunnyStreamLibraryFields($kind) as $name => $field) {
            $value = VNSEEA_BunnyConfig($field['key']);
            $valid = $value !== '';
            if ($name === 'library_id') {
                $valid = ctype_digit($value);
            } elseif ($name === 'cdn_hostname') {
                $valid = VNSEEA_BunnyNormalizeHostname($value) !== '';
            }
            if (!$valid) {
                $missing[] = $field['label'];
            }
        }
        return $missing;
    }
}

if (!function_exists('VNSEEA_BunnyStreamLibraryConfigured')) {
    /** True when every field of the library is filled in, regardless of the toggle. */
    function VNSEEA_BunnyStreamLibraryConfigured($kind)
    {
        return count(VNSEEA_BunnyStreamMissingFields($kind)) === 0;
    }
}

if (!function_exists('VNSEEA_BunnyStreamUploadsEnabled')) {
    /**
     * New uploads go to Bunny Stream only when the admin switched it on and
     * the library is fully configured. Videos already stored on Bunny keep
     * playing whenever the library is configured, even with the switch off.
     */
    function VNSEEA_BunnyStreamUploadsEnabled($kind)
    {
        return VNSEEA_BunnyConfig('vnseea_bunny_stream_enabled', '0') === '1'
            && VNSEEA_BunnyStreamLibraryConfigured($kind);
    }
}

if (!function_exists('VNSEEA_BunnyIsSecretConfigKey')) {
    /** Secrets that must never leave the server, even inside encrypted client config. */
    function VNSEEA_BunnyIsSecretConfigKey($name)
    {
        return (bool) preg_match('/^vnseea_bunny_stream_(public|private)_(api_key|readonly_key|token_key)$/', (string) $name);
    }
}

if (!function_exists('VNSEEA_BunnySecretHint')) {
    /** Admin hint for a stored secret that never prints the secret itself. */
    function VNSEEA_BunnySecretHint($name)
    {
        $value = VNSEEA_BunnyConfig($name);
        if ($value === '') {
            return 'Chưa nhập';
        }
        return 'Đã lưu (…' . substr($value, -4) . ') — nhập giá trị mới để thay';
    }
}
