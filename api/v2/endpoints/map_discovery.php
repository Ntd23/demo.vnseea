<?php
// English description: Bridges authenticated mobile map discovery, Google Places, and directions requests.

$response_data = array(
    'api_status' => 400
);

$action = !empty($_POST['type']) ? Wo_Secure($_POST['type']) : '';
$valid_actions = array('page_suggestions', 'place_autocomplete', 'address_autocomplete', 'address_geocode', 'address_details', 'place_details', 'route');
define('WO_API_MAP_DISCOVERY_RADIUS_METERS', 3000);
define('WO_API_MAP_DISCOVERY_MAX_RADIUS_METERS', 50000);
define('WO_API_MAP_DISCOVERY_TIMEOUT_MS', 4500);
define('WO_API_MAP_DISCOVERY_CONNECT_TIMEOUT_MS', 1500);

function Wo_ApiMapDiscoveryError($error_id, $error_text, $api_status = 400) {
    return array(
        'api_status' => $api_status,
        'errors' => array(
            'error_id' => $error_id,
            'error_text' => $error_text
        )
    );
}

function Wo_ApiMapDiscoveryNumber($key) {
    if (!isset($_POST[$key]) || !is_numeric($_POST[$key])) {
        return null;
    }
    return (float) $_POST[$key];
}

function Wo_ApiMapDiscoveryLanguage() {
    $language = !empty($_POST['language']) ? strtolower(trim(Wo_Secure($_POST['language']))) : 'vi';
    return in_array($language, array('vi', 'en'), true) ? $language : 'vi';
}

function Wo_ApiMapDiscoveryCountry() {
    $country = !empty($_POST['country']) ? strtolower(trim(Wo_Secure($_POST['country']))) : 'vn';
    return preg_match('/^[a-z]{2}$/', $country) ? $country : 'vn';
}

function Wo_ApiMapDiscoveryFastRequest() {
    return !empty($_POST['fast']) && (string) $_POST['fast'] !== '0';
}

function Wo_ApiMapDiscoveryRouteMode() {
    $mode = !empty($_POST['mode']) ? strtolower(Wo_Secure($_POST['mode'])) : 'walking';
    $allowed_modes = array('walking', 'driving', 'bicycling', 'transit');
    return in_array($mode, $allowed_modes) ? $mode : 'walking';
}

function Wo_ApiMapDiscoveryRadiusMeters() {
    if (!isset($_POST['radius']) || !is_numeric($_POST['radius'])) {
        return WO_API_MAP_DISCOVERY_RADIUS_METERS;
    }

    $radius = (int) $_POST['radius'];
    if ($radius <= 0) {
        return WO_API_MAP_DISCOVERY_RADIUS_METERS;
    }

    return min($radius, WO_API_MAP_DISCOVERY_MAX_RADIUS_METERS);
}

function Wo_ApiMapDiscoveryNormalizeSearchInput($input) {
    $clean = trim((string) $input);
    if ($clean === '') {
        return '';
    }

    if (function_exists('mb_strtolower')) {
        $clean = mb_strtolower($clean, 'UTF-8');
    } else {
        $clean = strtolower($clean);
    }

    if (class_exists('Transliterator')) {
        $transliterator = Transliterator::create('NFD; [:Nonspacing Mark:] Remove; NFC; Latin-ASCII');
        if ($transliterator) {
            $clean = $transliterator->transliterate($clean);
        }
    } else if (function_exists('iconv')) {
        $transliterated = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $clean);
        if ($transliterated !== false && $transliterated !== '') {
            $clean = $transliterated;
        }
    }

    $clean = str_replace(array('đ', 'Đ'), 'd', $clean);
    $clean = strtolower($clean);
    $clean = preg_replace('/[^a-z0-9]+/', ' ', $clean);
    return trim(preg_replace('/\s+/', ' ', $clean));
}

function Wo_ApiMapDiscoveryGoogleKey() {
    global $wo;
    if (!empty($wo['config']['google_server_map_api'])) {
        return trim($wo['config']['google_server_map_api']);
    }
    return !empty($wo['config']['google_map_api']) ? trim($wo['config']['google_map_api']) : '';
}

function Wo_ApiMapDiscoveryRuntimeDirectory($kind) {
    $base = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'vnseea-map-discovery';
    $directory = $base . DIRECTORY_SEPARATOR . preg_replace('/[^a-z0-9_-]/i', '', (string) $kind);
    if (!is_dir($directory)) {
        @mkdir($directory, 0700, true);
    }
    return is_dir($directory) && is_writable($directory) ? $directory : '';
}

function Wo_ApiMapDiscoveryCacheKey($path, array $query) {
    global $wo;
    ksort($query);
    $site = !empty($wo['config']['site_url']) ? (string) $wo['config']['site_url'] : 'vnseea';
    return hash('sha256', $site . '|' . $path . '|' . json_encode($query, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

function Wo_ApiMapDiscoveryCacheRead($key) {
    $directory = Wo_ApiMapDiscoveryRuntimeDirectory('cache');
    if ($directory === '') {
        return null;
    }
    $path = $directory . DIRECTORY_SEPARATOR . $key . '.json';
    $handle = @fopen($path, 'rb');
    if (!$handle) {
        return null;
    }
    $payload = null;
    if (flock($handle, LOCK_SH)) {
        $contents = stream_get_contents($handle, 2097153);
        flock($handle, LOCK_UN);
        if (is_string($contents) && strlen($contents) <= 2097152) {
            $payload = json_decode($contents, true);
        }
    }
    fclose($handle);
    if (!is_array($payload) || empty($payload['expires_at']) || (int) $payload['expires_at'] <= time() || !isset($payload['data']) || !is_array($payload['data'])) {
        @unlink($path);
        return null;
    }
    return $payload['data'];
}

function Wo_ApiMapDiscoveryCacheWrite($key, array $data, $ttl_seconds) {
    $directory = Wo_ApiMapDiscoveryRuntimeDirectory('cache');
    $ttl_seconds = max(1, min(86400, (int) $ttl_seconds));
    if ($directory === '') {
        return false;
    }
    $encoded = json_encode(array(
        'expires_at' => time() + $ttl_seconds,
        'data' => $data
    ), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (!is_string($encoded) || strlen($encoded) > 2097152) {
        return false;
    }
    $path = $directory . DIRECTORY_SEPARATOR . $key . '.json';
    $handle = @fopen($path, 'c+b');
    if (!$handle) {
        return false;
    }
    $written = false;
    if (flock($handle, LOCK_EX)) {
        ftruncate($handle, 0);
        rewind($handle);
        $written = fwrite($handle, $encoded) === strlen($encoded);
        fflush($handle);
        flock($handle, LOCK_UN);
    }
    fclose($handle);
    return $written;
}

function Wo_ApiMapDiscoveryConsumeRateBucket($identity, $bucket, $limit) {
    $directory = Wo_ApiMapDiscoveryRuntimeDirectory('rate');
    if ($directory === '') {
        return array('allowed' => true, 'retry_after' => 0);
    }
    $path = $directory . DIRECTORY_SEPARATOR . hash('sha256', $identity . '|' . $bucket) . '.json';
    $handle = @fopen($path, 'c+b');
    if (!$handle) {
        return array('allowed' => true, 'retry_after' => 0);
    }
    $now = time();
    $window_seconds = 60;
    $allowed = true;
    $retry_after = 0;
    if (flock($handle, LOCK_EX)) {
        $contents = stream_get_contents($handle);
        $state = json_decode((string) $contents, true);
        if (!is_array($state) || empty($state['window_started_at']) || $now - (int) $state['window_started_at'] >= $window_seconds) {
            $state = array('window_started_at' => $now, 'count' => 0);
        }
        $state['count'] = (int) $state['count'] + 1;
        if ($state['count'] > $limit) {
            $allowed = false;
            $retry_after = max(1, $window_seconds - ($now - (int) $state['window_started_at']));
        }
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($state));
        fflush($handle);
        flock($handle, LOCK_UN);
    }
    fclose($handle);
    return array('allowed' => $allowed, 'retry_after' => $retry_after);
}

function Wo_ApiMapDiscoveryRateLimit($action) {
    global $wo;
    if (!empty($GLOBALS['wo_api_map_discovery_google_get_mock'])) {
        return array('allowed' => true, 'retry_after' => 0);
    }
    $limits = array(
        'page_suggestions' => 120,
        'place_autocomplete' => 45,
        'address_autocomplete' => 60,
        'address_geocode' => 20,
        'address_details' => 30,
        'place_details' => 30,
        'route' => 30,
    );
    $limit = isset($limits[$action]) ? $limits[$action] : 30;
    $identity = !empty($wo['user']['user_id'])
        ? 'user:' . (int) $wo['user']['user_id']
        : 'ip:' . (!empty($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : 'unknown');
    $global = Wo_ApiMapDiscoveryConsumeRateBucket($identity, 'all', 120);
    if (empty($global['allowed'])) {
        return $global;
    }
    return Wo_ApiMapDiscoveryConsumeRateBucket($identity, 'action:' . $action, $limit);
}

function Wo_ApiMapDiscoveryGoogleGet($path, array $query, $timeout_ms = WO_API_MAP_DISCOVERY_TIMEOUT_MS, $connect_timeout_ms = WO_API_MAP_DISCOVERY_CONNECT_TIMEOUT_MS, $cache_ttl = 0) {
    if (!empty($GLOBALS['wo_api_map_discovery_google_get_mock']) && is_callable($GLOBALS['wo_api_map_discovery_google_get_mock'])) {
        return call_user_func($GLOBALS['wo_api_map_discovery_google_get_mock'], $path, $query);
    }

    $cache_key = '';
    if ((int) $cache_ttl > 0) {
        $cache_key = Wo_ApiMapDiscoveryCacheKey($path, $query);
        $cached = Wo_ApiMapDiscoveryCacheRead($cache_key);
        if (is_array($cached)) {
            return $cached;
        }
    }

    $google_key = Wo_ApiMapDiscoveryGoogleKey();
    if ($google_key === '') {
        return Wo_ApiMapDiscoveryError('google_not_configured', 'Google Maps API key is not configured.', 500);
    }

    $timeout_ms = max(250, (int) $timeout_ms);
    $connect_timeout_ms = max(250, min((int) $connect_timeout_ms, $timeout_ms));
    $query['key'] = $google_key;
    $url = 'https://maps.googleapis.com/maps/api/' . $path . '?' . http_build_query($query);
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_CONNECTTIMEOUT_MS, $connect_timeout_ms);
    curl_setopt($curl, CURLOPT_TIMEOUT_MS, $timeout_ms);
    curl_setopt($curl, CURLOPT_NOSIGNAL, true);
    curl_setopt($curl, CURLOPT_ENCODING, '');
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Accept: application/json'));
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2);

    $body = curl_exec($curl);
    $curl_error = curl_error($curl);
    $http_status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if ($body === false || $curl_error !== '') {
        return Wo_ApiMapDiscoveryError('google_unreachable', 'Unable to reach Google Maps.', 502);
    }
    if ($http_status >= 400) {
        return Wo_ApiMapDiscoveryError('google_http_error', 'Google Maps returned HTTP ' . $http_status . '.', 502);
    }

    $decoded = json_decode($body, true);
    if (empty($decoded) || !is_array($decoded)) {
        return Wo_ApiMapDiscoveryError('google_invalid_response', 'Google Maps response is invalid.', 502);
    }

    $status = !empty($decoded['status']) ? (string) $decoded['status'] : '';
    if ($cache_key !== '' && in_array($status, array('OK', 'ZERO_RESULTS'), true)) {
        Wo_ApiMapDiscoveryCacheWrite($cache_key, $decoded, $cache_ttl);
    }
    return $decoded;
}

function Wo_ApiMapDiscoveryDistanceMeters($origin_lat, $origin_lng, $lat, $lng) {
    if (!is_numeric($origin_lat) || !is_numeric($origin_lng) || !is_numeric($lat) || !is_numeric($lng)) {
        return null;
    }

    $earth_radius = 6371000;
    $lat_from = deg2rad((float) $origin_lat);
    $lng_from = deg2rad((float) $origin_lng);
    $lat_to = deg2rad((float) $lat);
    $lng_to = deg2rad((float) $lng);
    $lat_delta = $lat_to - $lat_from;
    $lng_delta = $lng_to - $lng_from;
    $angle = 2 * asin(sqrt(pow(sin($lat_delta / 2), 2) + cos($lat_from) * cos($lat_to) * pow(sin($lng_delta / 2), 2)));

    return (int) round($earth_radius * $angle);
}

function Wo_ApiMapDiscoveryNormalizeUrl($url) {
    if (empty($url)) {
        return '';
    }
    if (filter_var($url, FILTER_VALIDATE_URL)) {
        return $url;
    }
    return Wo_GetMedia(ltrim((string) $url, '/'));
}

function Wo_ApiMapDiscoveryPageSuggestions() {
    global $sqlConnect;

    if (function_exists('Wo_EnsurePageMapPinColumns')) {
        Wo_EnsurePageMapPinColumns();
    }

    $query = !empty($_POST['query']) ? trim($_POST['query']) : '';
    $keyword = Wo_Secure($query);
    $limit = !empty($_POST['limit']) && is_numeric($_POST['limit']) ? (int) $_POST['limit'] : 20;
    $limit = max(1, min($limit, 80));
    $origin_lat = Wo_ApiMapDiscoveryNumber('origin_lat');
    $origin_lng = Wo_ApiMapDiscoveryNumber('origin_lng');
    $has_origin = ($origin_lat !== null && $origin_lng !== null && !($origin_lat == 0 && $origin_lng == 0));
    $distance_km = !empty($_POST['distance']) && is_numeric($_POST['distance'])
        ? (float) $_POST['distance']
        : 3;
    $max_distance_meters = $has_origin
        ? max(250, min($distance_km * 1000, WO_API_MAP_DISCOVERY_MAX_RADIUS_METERS))
        : 0;
    $candidate_limit = min(max($limit * 6, $limit), 160);

    $where = " WHERE `active` = '1' AND `address` <> '' AND `lat` <> '' AND `lng` <> '' AND `lat` <> '0' AND `lng` <> '0'";
    if ($max_distance_meters > 0) {
        $lat_delta = $max_distance_meters / 111320;
        $lng_delta = $max_distance_meters / max(111320 * cos(deg2rad($origin_lat)), 1);
        $lat_min = number_format($origin_lat - $lat_delta, 7, '.', '');
        $lat_max = number_format($origin_lat + $lat_delta, 7, '.', '');
        $lng_min = number_format($origin_lng - $lng_delta, 7, '.', '');
        $lng_max = number_format($origin_lng + $lng_delta, 7, '.', '');
        $where .= " AND CAST(`lat` AS DECIMAL(10,7)) BETWEEN {$lat_min} AND {$lat_max} AND CAST(`lng` AS DECIMAL(10,7)) BETWEEN {$lng_min} AND {$lng_max}";
    }
    if ($keyword !== '') {
        $where .= " AND (`page_name` LIKE '%{$keyword}%' OR `page_title` LIKE '%{$keyword}%' OR `address` LIKE '%{$keyword}%')";
    }

    $order = $keyword !== '' ? "(`page_name` LIKE '{$keyword}%') DESC, (`page_title` LIKE '{$keyword}%') DESC, (`address` LIKE '{$keyword}%') DESC," : '';
    $sql = "SELECT `page_id` FROM " . T_PAGES . $where . " ORDER BY {$order} `page_id` DESC LIMIT {$candidate_limit}";
    $query_result = mysqli_query($sqlConnect, $sql);
    $items = array();

    if ($query_result && mysqli_num_rows($query_result) > 0) {
        while ($row = mysqli_fetch_assoc($query_result)) {
            $page = Wo_PageData($row['page_id']);
            if (empty($page) || empty($page['lat']) || empty($page['lng'])) {
                continue;
            }

            $distance_meters = $has_origin ? Wo_ApiMapDiscoveryDistanceMeters($origin_lat, $origin_lng, $page['lat'], $page['lng']) : null;
            if ($max_distance_meters > 0 && ($distance_meters === null || $distance_meters > $max_distance_meters)) {
                continue;
            }
            $items[] = array(
                'source' => 'page',
                'type' => 'page',
                'id' => (string) $page['page_id'],
                'page_id' => (string) $page['page_id'],
                'title' => !empty($page['page_title']) ? $page['page_title'] : (!empty($page['name']) ? $page['name'] : ''),
                'subtitle' => !empty($page['page_name']) ? '@' . $page['page_name'] : '',
                'description' => !empty($page['page_description']) ? trim($page['page_description']) : '',
                'address' => !empty($page['address']) ? $page['address'] : '',
                'location' => !empty($page['address']) ? $page['address'] : '',
                'avatar' => Wo_ApiMapDiscoveryNormalizeUrl(!empty($page['avatar']) ? $page['avatar'] : ''),
                'url' => !empty($page['url']) ? $page['url'] : '',
                'place_id' => !empty($page['place_id']) ? $page['place_id'] : '',
                'lat' => (float) $page['lat'],
                'lng' => (float) $page['lng'],
                'distance_meters' => $distance_meters,
                'within_1km' => ($distance_meters !== null && $distance_meters <= 1000) ? 1 : 0
            );
        }
    }

    usort($items, function($a, $b) {
        $a_near = !empty($a['within_1km']) ? 1 : 0;
        $b_near = !empty($b['within_1km']) ? 1 : 0;
        if ($a_near !== $b_near) {
            return $b_near - $a_near;
        }

        $a_distance = isset($a['distance_meters']) && is_numeric($a['distance_meters']) ? (float) $a['distance_meters'] : null;
        $b_distance = isset($b['distance_meters']) && is_numeric($b['distance_meters']) ? (float) $b['distance_meters'] : null;
        if ($a_distance !== null && $b_distance !== null && $a_distance != $b_distance) {
            return ($a_distance < $b_distance) ? -1 : 1;
        }
        if ($a_distance !== null) {
            return -1;
        }
        if ($b_distance !== null) {
            return 1;
        }

        return strnatcasecmp((string) $a['title'], (string) $b['title']);
    });

    return array(
        'api_status' => 200,
        'items' => array_slice($items, 0, $limit)
    );
}

function Wo_ApiMapDiscoveryAddPrediction(&$predictions, &$seen_place_ids, $place_id, $description, $main_text, $secondary_text, $types = array(), $lat = null, $lng = null, $icon = null, $icon_background_color = null, $rating = null, $ratings_total = null, $open_now = null, $photo_references = array()) {
    $place_id = trim((string) $place_id);
    $description = trim((string) $description);
    $main_text = trim((string) $main_text);
    $secondary_text = trim((string) $secondary_text);

    if ($place_id === '' || $description === '') {
        return;
    }
    if (isset($seen_place_ids[$place_id])) {
        return;
    }

    $seen_place_ids[$place_id] = true;
    $prediction = array(
        'source' => 'google',
        'place_id' => $place_id,
        'description' => $description,
        'main_text' => $main_text !== '' ? $main_text : $description,
        'secondary_text' => $secondary_text,
        'types' => $types,
        'lat' => $lat,
        'lng' => $lng,
        'icon' => $icon,
        'icon_background_color' => $icon_background_color
    );
    if ($rating !== null && is_numeric($rating)) {
        $prediction['rating'] = (float) $rating;
    }
    if ($ratings_total !== null && is_numeric($ratings_total)) {
        $prediction['user_ratings_total'] = (int) $ratings_total;
    }
    if (is_bool($open_now)) {
        $prediction['open_now'] = $open_now;
    }
    if (!empty($photo_references) && is_array($photo_references)) {
        $prediction['photo_references'] = array_slice(array_values(array_filter($photo_references)), 0, 3);
    }
    $predictions[] = $prediction;
}

function Wo_ApiMapDiscoveryMergeGooglePlaceResults(&$places_results, $next_results) {
    if (empty($next_results) || !is_array($next_results)) {
        return;
    }

    $seen_place_ids = array();
    foreach ($places_results as $result) {
        if (!empty($result['place_id'])) {
            $seen_place_ids[$result['place_id']] = true;
        }
    }

    foreach ($next_results as $result) {
        if (empty($result['place_id']) || isset($seen_place_ids[$result['place_id']])) {
            continue;
        }

        $seen_place_ids[$result['place_id']] = true;
        $places_results[] = $result;
    }
}

function Wo_ApiMapDiscoveryFilterGooglePlaceResultsByRadius($places_results, $origin_lat, $origin_lng, $radius) {
    if ($origin_lat === null || $origin_lng === null) {
        return $places_results;
    }

    return array_values(array_filter($places_results, function($result) use ($origin_lat, $origin_lng, $radius) {
        $location = !empty($result['geometry']['location']) && is_array($result['geometry']['location'])
            ? $result['geometry']['location']
            : array();
        $place_distance = Wo_ApiMapDiscoveryDistanceMeters(
            $origin_lat,
            $origin_lng,
            $location['lat'] ?? null,
            $location['lng'] ?? null
        );
        return $place_distance !== null && $place_distance <= $radius;
    }));
}

function Wo_ApiMapDiscoveryAddressQuery() {
    $input = !empty($_POST['query']) ? trim($_POST['query']) : (!empty($_POST['input']) ? trim($_POST['input']) : '');
    $input_length = function_exists('mb_strlen') ? mb_strlen($input, 'UTF-8') : strlen($input);
    if ($input_length < 2 || $input_length > 160) {
        return '';
    }
    return $input;
}

function Wo_ApiMapDiscoveryAddressSessionToken() {
    if (empty($_POST['sessiontoken'])) {
        return '';
    }

    $session_token = trim(Wo_Secure($_POST['sessiontoken']));
    if ($session_token === '') {
        return '';
    }

    return function_exists('mb_substr')
        ? mb_substr($session_token, 0, 255, 'UTF-8')
        : substr($session_token, 0, 255);
}

function Wo_ApiMapDiscoveryAddressBiasQuery() {
    $origin_lat = Wo_ApiMapDiscoveryNumber('origin_lat');
    $origin_lng = Wo_ApiMapDiscoveryNumber('origin_lng');
    if ($origin_lat === null || $origin_lng === null) {
        return array();
    }
    if ($origin_lat < -90 || $origin_lat > 90 || $origin_lng < -180 || $origin_lng > 180) {
        return array();
    }

    $radius = WO_API_MAP_DISCOVERY_RADIUS_METERS;
    if (isset($_POST['radius']) && is_numeric($_POST['radius'])) {
        $radius = (int) $_POST['radius'];
    }
    if ($radius <= 0) {
        $radius = WO_API_MAP_DISCOVERY_RADIUS_METERS;
    }

    return array(
        'location' => number_format($origin_lat, 6, '.', '') . ',' . number_format($origin_lng, 6, '.', ''),
        'radius' => min($radius, WO_API_MAP_DISCOVERY_MAX_RADIUS_METERS)
    );
}

function Wo_ApiMapDiscoveryAddressError($error_id, $api_status = 404) {
    if ($error_id === 'google_not_configured') {
        return Wo_ApiMapDiscoveryError('google_not_configured', 'Google Maps API key is not configured.', 500);
    }
    if ($error_id === 'google_request_denied') {
        return Wo_ApiMapDiscoveryError('google_request_denied', 'Google Maps request was denied.', 502);
    }
    return Wo_ApiMapDiscoveryError('address_not_found', 'Address not found.', $api_status);
}

function Wo_ApiMapDiscoveryAddressGoogleError($google, $allow_zero_results = false) {
    if (!empty($google['errors'])) {
        $error_id = !empty($google['errors']['error_id']) ? $google['errors']['error_id'] : '';
        return ($error_id === 'google_not_configured')
            ? Wo_ApiMapDiscoveryAddressError('google_not_configured', 500)
            : Wo_ApiMapDiscoveryAddressError('google_request_denied', 502);
    }

    $status = strtoupper((string) (!empty($google['status']) ? $google['status'] : ''));
    if ($status === 'OK') {
        return null;
    }
    if ($status === 'ZERO_RESULTS' && $allow_zero_results) {
        return null;
    }
    if ($status === 'ZERO_RESULTS' || $status === 'NOT_FOUND') {
        return Wo_ApiMapDiscoveryAddressError('address_not_found', 404);
    }
    if ($status === 'REQUEST_DENIED') {
        return Wo_ApiMapDiscoveryAddressError('google_request_denied', 502);
    }

    return Wo_ApiMapDiscoveryAddressError('google_request_denied', 502);
}

function Wo_ApiMapDiscoveryAddressComponentValue($components, $type_groups) {
    if (empty($components) || !is_array($components)) {
        return '';
    }

    foreach ($type_groups as $type_group) {
        foreach ($components as $component) {
            if (empty($component['types']) || !is_array($component['types'])) {
                continue;
            }
            foreach ($type_group as $type) {
                if (in_array($type, $component['types'], true)) {
                    return !empty($component['long_name']) ? trim($component['long_name']) : '';
                }
            }
        }
    }

    return '';
}

function Wo_ApiMapDiscoveryAddressPayloadFromGeocodeResult($result, $fallback_place_id = '') {
    $formatted_address = !empty($result['formatted_address']) ? trim((string) $result['formatted_address']) : '';
    $formatted_address = trim((string) preg_replace('/\s+/', ' ', $formatted_address));
    $location = !empty($result['geometry']['location']) && is_array($result['geometry']['location']) ? $result['geometry']['location'] : array();
    $components = !empty($result['address_components']) && is_array($result['address_components']) ? $result['address_components'] : array();
    $ward = Wo_ApiMapDiscoveryAddressComponentValue($components, array(
        array('administrative_area_level_3'),
        array('sublocality_level_1'),
        array('sublocality'),
        array('locality')
    ));
    $district = Wo_ApiMapDiscoveryAddressComponentValue($components, array(
        array('administrative_area_level_2')
    ));
    $city = Wo_ApiMapDiscoveryAddressComponentValue($components, array(
        array('administrative_area_level_1'),
        array('locality')
    ));
    $country = Wo_ApiMapDiscoveryAddressComponentValue($components, array(
        array('country')
    ));

    return array(
        'source' => 'google',
        'place_id' => !empty($result['place_id']) ? $result['place_id'] : $fallback_place_id,
        'address' => $formatted_address,
        'lat' => isset($location['lat']) ? (float) $location['lat'] : null,
        'lng' => isset($location['lng']) ? (float) $location['lng'] : null,
        'city' => $city,
        'district' => $district,
        'ward' => $ward,
        'country' => $country
    );
}

function Wo_ApiMapDiscoveryAddressPredictionFromGeocodeResult($result) {
    $payload = Wo_ApiMapDiscoveryAddressPayloadFromGeocodeResult($result);
    $formatted_address = $payload['address'];
    if ($formatted_address === '') {
        return array();
    }

    $address_parts = array_values(array_filter(array_map('trim', explode(',', $formatted_address))));
    $main_text = !empty($address_parts) ? array_shift($address_parts) : $formatted_address;
    $secondary_text = !empty($address_parts) ? implode(', ', $address_parts) : '';
    return array(
        'source' => 'geocode',
        'place_id' => $payload['place_id'],
        'description' => $formatted_address,
        'main_text' => $main_text,
        'secondary_text' => $secondary_text,
        'types' => !empty($result['types']) && is_array($result['types']) ? array_values($result['types']) : array(),
        'lat' => $payload['lat'],
        'lng' => $payload['lng']
    );
}

function Wo_ApiMapDiscoveryRequestedGoogleType() {
    if (empty($_POST['category'])) {
        return null;
    }

    $category = strtolower(trim(Wo_Secure($_POST['category'])));
    $allowed_types = array(
        'restaurant', 'cafe', 'hair_care', 'beauty_salon', 'pharmacy',
        'hospital', 'dentist', 'gas_station', 'supermarket', 'gym',
        'lodging', 'bank', 'atm', 'school'
    );
    return in_array($category, $allowed_types, true) ? $category : null;
}

function Wo_ApiMapDiscoveryAutocomplete() {
    $input = !empty($_POST['query']) ? trim($_POST['query']) : (!empty($_POST['input']) ? trim($_POST['input']) : '');
    $input_length = function_exists('mb_strlen') ? mb_strlen($input, 'UTF-8') : strlen($input);
    if ($input_length < 2 || $input_length > 160) {
        return array('api_status' => 200, 'predictions' => array());
    }

    $origin_lat = Wo_ApiMapDiscoveryNumber('origin_lat');
    $origin_lng = Wo_ApiMapDiscoveryNumber('origin_lng');
    $radius = Wo_ApiMapDiscoveryRadiusMeters();
    $language = Wo_ApiMapDiscoveryLanguage();
    $country = Wo_ApiMapDiscoveryCountry();
    $fast = Wo_ApiMapDiscoveryFastRequest();
    $global_search = !empty($_POST['global_search']) && (string) $_POST['global_search'] !== '0';
    $google_timeout_ms = $fast ? 1300 : WO_API_MAP_DISCOVERY_TIMEOUT_MS;
    $google_connect_timeout_ms = $fast ? 500 : WO_API_MAP_DISCOVERY_CONNECT_TIMEOUT_MS;

    $predictions = array();
    $seen_place_ids = array();
    $places_results = array();
    $requested_type = Wo_ApiMapDiscoveryRequestedGoogleType();
    $nearby_search = array('status' => 'NOT_CALLED');
    $text_search = array('status' => 'NOT_CALLED');
    $google = array('status' => 'NOT_CALLED');

    // Text Search accepts arbitrary user text. Category is only a hint and
    // must never replace the original query.
    $text_search_query = array(
        'query' => $input,
        'language' => $language,
        'region' => $country
    );
    if ($requested_type !== null) {
        $text_search_query['type'] = $requested_type;
    }
    if ($origin_lat !== null && $origin_lng !== null) {
        $text_search_query['location'] = number_format($origin_lat, 6, '.', '') . ',' . number_format($origin_lng, 6, '.', '');
        $text_search_query['radius'] = $radius;
    }
    $text_search = Wo_ApiMapDiscoveryGoogleGet(
        'place/textsearch/json',
        $text_search_query,
        $google_timeout_ms,
        $google_connect_timeout_ms,
        120
    );
    if (
        empty($text_search['errors']) &&
        (($text_search['status'] ?? '') === 'OK' || ($text_search['status'] ?? '') === 'ZERO_RESULTS')
    ) {
        Wo_ApiMapDiscoveryMergeGooglePlaceResults(
            $places_results,
            !empty($text_search['results']) ? $text_search['results'] : array()
        );
        $places_results = Wo_ApiMapDiscoveryFilterGooglePlaceResultsByRadius(
            $places_results,
            $origin_lat,
            $origin_lng,
            $radius
        );
    }

    // Nearby Search is a recovery path when exact text returned nothing.
    if (empty($places_results) && $origin_lat !== null && $origin_lng !== null) {
        $nearby_query = array(
            'location' => number_format($origin_lat, 6, '.', '') . ',' . number_format($origin_lng, 6, '.', ''),
            'radius' => $radius,
            'language' => $language,
            'keyword' => $input
        );
        if ($requested_type !== null) {
            $nearby_query['type'] = $requested_type;
        }
        $nearby_search = Wo_ApiMapDiscoveryGoogleGet(
            'place/nearbysearch/json',
            $nearby_query,
            $google_timeout_ms,
            $google_connect_timeout_ms,
            120
        );
        if (empty($nearby_search['errors']) && (($nearby_search['status'] ?? '') === 'OK' || ($nearby_search['status'] ?? '') === 'ZERO_RESULTS')) {
            Wo_ApiMapDiscoveryMergeGooglePlaceResults(
                $places_results,
                !empty($nearby_search['results']) ? $nearby_search['results'] : array()
            );
            $places_results = Wo_ApiMapDiscoveryFilterGooglePlaceResultsByRadius(
                $places_results,
                $origin_lat,
                $origin_lng,
                $radius
            );
        }
    }

    foreach ($places_results as $result) {
        $loc = !empty($result['geometry']['location']) ? $result['geometry']['location'] : array();
        $vicinity = !empty($result['vicinity']) ? $result['vicinity'] : (!empty($result['formatted_address']) ? $result['formatted_address'] : '');
        $photo_references = array();
        if (!empty($result['photos']) && is_array($result['photos'])) {
            foreach (array_slice($result['photos'], 0, 3) as $photo) {
                if (!empty($photo['photo_reference'])) {
                    $photo_references[] = $photo['photo_reference'];
                }
            }
        }
        Wo_ApiMapDiscoveryAddPrediction(
            $predictions,
            $seen_place_ids,
            !empty($result['place_id']) ? $result['place_id'] : '',
            $vicinity !== '' ? $vicinity : (!empty($result['name']) ? $result['name'] : ''),
            !empty($result['name']) ? $result['name'] : $vicinity,
            $vicinity,
            !empty($result['types']) && is_array($result['types']) ? $result['types'] : array(),
            isset($loc['lat']) ? (float)$loc['lat'] : null,
            isset($loc['lng']) ? (float)$loc['lng'] : null,
            !empty($result['icon']) ? $result['icon'] : null,
            !empty($result['icon_background_color']) ? $result['icon_background_color'] : null,
            isset($result['rating']) ? $result['rating'] : null,
            isset($result['user_ratings_total']) ? $result['user_ratings_total'] : null,
            !empty($result['opening_hours']) && is_array($result['opening_hours']) && isset($result['opening_hours']['open_now'])
                ? (bool) $result['opening_hours']['open_now']
                : null,
            $photo_references
        );
    }

    // Named-place autocomplete is a final non-fast fallback, never an address
    // classifier for Nearby.
    if (!$fast && empty($predictions)) {
        $query = array(
            'input' => $input,
            'language' => $language,
            'components' => 'country:' . $country
        );
        if ($origin_lat !== null && $origin_lng !== null) {
            $query['location'] = number_format($origin_lat, 6, '.', '') . ',' . number_format($origin_lng, 6, '.', '');
            $query['radius'] = $radius;
        }
        $google = Wo_ApiMapDiscoveryGoogleGet(
            'place/autocomplete/json',
            $query,
            $google_timeout_ms,
            $google_connect_timeout_ms,
            60
        );
        if (empty($google['errors']) && (($google['status'] ?? '') === 'OK' || ($google['status'] ?? '') === 'ZERO_RESULTS')) {
            foreach (($google['predictions'] ?? array()) as $prediction) {
                $formatting = !empty($prediction['structured_formatting']) && is_array($prediction['structured_formatting']) ? $prediction['structured_formatting'] : array();
                Wo_ApiMapDiscoveryAddPrediction(
                    $predictions,
                    $seen_place_ids,
                    !empty($prediction['place_id']) ? $prediction['place_id'] : '',
                    !empty($prediction['description']) ? $prediction['description'] : '',
                    !empty($formatting['main_text']) ? $formatting['main_text'] : (!empty($prediction['description']) ? $prediction['description'] : ''),
                    !empty($formatting['secondary_text']) ? $formatting['secondary_text'] : '',
                    !empty($prediction['types']) && is_array($prediction['types']) ? $prediction['types'] : array()
                );
            }
        }
    }

    if ($origin_lat !== null && $origin_lng !== null) {
        foreach ($predictions as $prediction_index => $prediction) {
            if (isset($prediction['lat']) && isset($prediction['lng']) && is_numeric($prediction['lat']) && is_numeric($prediction['lng'])) {
                $predictions[$prediction_index]['distance_meters'] = Wo_ApiMapDiscoveryDistanceMeters($origin_lat, $origin_lng, $prediction['lat'], $prediction['lng']);
            }
        }

        if (!$global_search) {
            usort($predictions, function($left, $right) {
                $left_distance = isset($left['distance_meters']) && is_numeric($left['distance_meters']) ? (float) $left['distance_meters'] : PHP_FLOAT_MAX;
                $right_distance = isset($right['distance_meters']) && is_numeric($right['distance_meters']) ? (float) $right['distance_meters'] : PHP_FLOAT_MAX;
                if ($left_distance == $right_distance) {
                    return strnatcasecmp((string) ($left['main_text'] ?? ''), (string) ($right['main_text'] ?? ''));
                }
                return ($left_distance < $right_distance) ? -1 : 1;
            });
        }
    }
    $result_limit = ($fast && !$global_search) ? 12 : 20;

    return array(
        'api_status' => 200,
        'predictions' => array_slice($predictions, 0, $result_limit),
        'debug_nearby_status' => $nearby_search['status'] ?? 'NOT_CALLED',
        'debug_nearby_error' => $nearby_search['error_message'] ?? '',
        'debug_detected_type' => $requested_type,
        'debug_nearby_count' => count($places_results),
        'debug_text_search_status' => $text_search['status'] ?? 'NOT_CALLED',
        'debug_autocomplete_status' => $google['status'] ?? 'NOT_CALLED',
        'debug_autocomplete_error' => $google['error_message'] ?? '',
        'debug_global_search' => $global_search ? 1 : 0
    );
}

function Wo_ApiMapDiscoveryAddressAutocomplete() {
    $input = Wo_ApiMapDiscoveryAddressQuery();
    if ($input === '') {
        return Wo_ApiMapDiscoveryError('query_invalid', 'query must be between 2 and 160 characters.');
    }

    $query = array(
        'input' => $input,
        'types' => 'geocode',
        'components' => 'country:vn',
        'language' => Wo_ApiMapDiscoveryLanguage()
    );
    $session_token = Wo_ApiMapDiscoveryAddressSessionToken();
    if ($session_token !== '') {
        $query['sessiontoken'] = $session_token;
    }
    $query = array_merge($query, Wo_ApiMapDiscoveryAddressBiasQuery());

    $google = Wo_ApiMapDiscoveryGoogleGet('place/autocomplete/json', $query);
    $google_error = Wo_ApiMapDiscoveryAddressGoogleError($google, true);
    if (!empty($google_error)) {
        return $google_error;
    }

    $predictions = array();
    if (($google['status'] ?? '') === 'OK' && !empty($google['predictions']) && is_array($google['predictions'])) {
        $seen_place_ids = array();
        foreach ($google['predictions'] as $prediction) {
            $formatting = !empty($prediction['structured_formatting']) && is_array($prediction['structured_formatting']) ? $prediction['structured_formatting'] : array();
            Wo_ApiMapDiscoveryAddPrediction(
                $predictions,
                $seen_place_ids,
                !empty($prediction['place_id']) ? $prediction['place_id'] : '',
                !empty($prediction['description']) ? $prediction['description'] : '',
                !empty($formatting['main_text']) ? $formatting['main_text'] : (!empty($prediction['description']) ? $prediction['description'] : ''),
                !empty($formatting['secondary_text']) ? $formatting['secondary_text'] : '',
                !empty($prediction['types']) && is_array($prediction['types']) ? array_values($prediction['types']) : array()
            );
        }
    }

    if (!empty($predictions)) {
        return array(
            'api_status' => 200,
            'predictions' => array_slice($predictions, 0, 10)
        );
    }

    $geocode = Wo_ApiMapDiscoveryGoogleGet('geocode/json', array(
        'address' => $input,
        'components' => 'country:vn',
        'language' => Wo_ApiMapDiscoveryLanguage(),
        'region' => 'vn'
    ), WO_API_MAP_DISCOVERY_TIMEOUT_MS, WO_API_MAP_DISCOVERY_CONNECT_TIMEOUT_MS, 3600);
    if (!empty($geocode['errors'])) {
        return Wo_ApiMapDiscoveryAddressGoogleError($geocode, true);
    }
    if (($geocode['status'] ?? '') !== 'OK' || empty($geocode['results']) || !is_array($geocode['results'])) {
        $geocode_error = Wo_ApiMapDiscoveryAddressGoogleError($geocode, true);
        if (!empty($geocode_error) && !empty($geocode_error['errors']['error_id']) && $geocode_error['errors']['error_id'] !== 'address_not_found') {
            return $geocode_error;
        }
        return array('api_status' => 200, 'predictions' => array());
    }

    foreach ($geocode['results'] as $result) {
        $prediction = Wo_ApiMapDiscoveryAddressPredictionFromGeocodeResult($result);
        if (!empty($prediction)) {
            $predictions[] = $prediction;
        }
    }

    return array(
        'api_status' => 200,
        'predictions' => array_slice($predictions, 0, 10)
    );
}

function Wo_ApiMapDiscoveryAddressGeocode() {
    $input = Wo_ApiMapDiscoveryAddressQuery();
    if ($input === '') {
        return Wo_ApiMapDiscoveryError('query_invalid', 'query must be between 2 and 160 characters.');
    }

    // Stable address errors: address_not_found, google_request_denied.
    $google = Wo_ApiMapDiscoveryGoogleGet('geocode/json', array(
        'address' => $input,
        'components' => 'country:vn',
        'language' => Wo_ApiMapDiscoveryLanguage(),
        'region' => 'vn'
    ), WO_API_MAP_DISCOVERY_TIMEOUT_MS, WO_API_MAP_DISCOVERY_CONNECT_TIMEOUT_MS, 3600);
    $google_error = Wo_ApiMapDiscoveryAddressGoogleError($google, false);
    if (!empty($google_error)) {
        return $google_error;
    }

    return array(
        'api_status' => 200,
        'address' => Wo_ApiMapDiscoveryAddressPayloadFromGeocodeResult($google['results'][0])
    );
}

function Wo_ApiMapDiscoveryAddressDetails() {
    $place_id = !empty($_POST['place_id']) ? trim((string) $_POST['place_id']) : '';
    if ($place_id === '') {
        return Wo_ApiMapDiscoveryError('place_id_missing', 'place_id can not be empty.');
    }

    $query = array(
        'place_id' => $place_id,
        'fields' => 'place_id,formatted_address,geometry,address_components',
        'language' => Wo_ApiMapDiscoveryLanguage(),
        'region' => 'vn'
    );
    $session_token = Wo_ApiMapDiscoveryAddressSessionToken();
    if ($session_token !== '') {
        $query['sessiontoken'] = $session_token;
    }
    $google = Wo_ApiMapDiscoveryGoogleGet(
        'place/details/json',
        $query,
        WO_API_MAP_DISCOVERY_TIMEOUT_MS,
        WO_API_MAP_DISCOVERY_CONNECT_TIMEOUT_MS,
        3600
    );
    $google_error = Wo_ApiMapDiscoveryAddressGoogleError($google, false);
    if (!empty($google_error)) {
        return $google_error;
    }
    if (empty($google['result']) || !is_array($google['result'])) {
        return Wo_ApiMapDiscoveryAddressError('address_not_found', 404);
    }

    return array(
        'api_status' => 200,
        'address' => Wo_ApiMapDiscoveryAddressPayloadFromGeocodeResult($google['result'], $place_id)
    );
}

function Wo_ApiMapDiscoveryPlaceDetails() {
    $place_id = !empty($_POST['place_id']) ? trim($_POST['place_id']) : '';
    if ($place_id === '') {
        return Wo_ApiMapDiscoveryError('place_id_missing', 'place_id can not be empty.');
    }

    $google = Wo_ApiMapDiscoveryGoogleGet('place/details/json', array(
        'place_id' => $place_id,
        'language' => 'vi',
        'fields' => 'place_id,name,formatted_address,geometry,url,icon,icon_background_color'
    ), WO_API_MAP_DISCOVERY_TIMEOUT_MS, WO_API_MAP_DISCOVERY_CONNECT_TIMEOUT_MS, 900);
    if (!empty($google['errors'])) {
        return $google;
    }
    if (($google['status'] ?? '') !== 'OK' || empty($google['result'])) {
        return Wo_ApiMapDiscoveryError('place_not_found', 'Google place not found.', 404);
    }

    $result = $google['result'];
    $location = $result['geometry']['location'] ?? array();
    return array(
        'api_status' => 200,
        'place' => array(
            'source' => 'google',
            'place_id' => !empty($result['place_id']) ? $result['place_id'] : $place_id,
            'name' => !empty($result['name']) ? $result['name'] : '',
            'address' => !empty($result['formatted_address']) ? $result['formatted_address'] : '',
            'url' => !empty($result['url']) ? $result['url'] : '',
            'lat' => isset($location['lat']) ? (float) $location['lat'] : null,
            'lng' => isset($location['lng']) ? (float) $location['lng'] : null,
            'icon' => !empty($result['icon']) ? $result['icon'] : '',
            'icon_background_color' => !empty($result['icon_background_color']) ? $result['icon_background_color'] : ''
        )
    );
}

function Wo_ApiMapDiscoveryDecodePolyline($encoded_path) {
    $points = array();
    $index = 0;
    $lat = 0;
    $lng = 0;
    $path_length = strlen((string) $encoded_path);

    while ($index < $path_length) {
        $shift = 0;
        $result = 0;
        do {
            if ($index >= $path_length) {
                break 2;
            }
            $byte = ord($encoded_path[$index]) - 63;
            $index++;
            $result |= (($byte & 0x1f) << $shift);
            $shift += 5;
        } while ($byte >= 0x20);
        $lat += ($result & 1) ? ~(int) ($result >> 1) : (int) ($result >> 1);

        $shift = 0;
        $result = 0;
        do {
            if ($index >= $path_length) {
                break 2;
            }
            $byte = ord($encoded_path[$index]) - 63;
            $index++;
            $result |= (($byte & 0x1f) << $shift);
            $shift += 5;
        } while ($byte >= 0x20);
        $lng += ($result & 1) ? ~(int) ($result >> 1) : (int) ($result >> 1);

        $points[] = array(
            'lat' => $lat / 1e5,
            'lng' => $lng / 1e5
        );
    }

    return $points;
}

function Wo_ApiMapDiscoveryRouteSteps($leg) {
    $steps = array();
    if (empty($leg['steps']) || !is_array($leg['steps'])) {
        return $steps;
    }

    foreach ($leg['steps'] as $step) {
        $instruction = '';
        if (!empty($step['html_instructions'])) {
            $instruction = html_entity_decode(strip_tags($step['html_instructions']), ENT_QUOTES, 'UTF-8');
            $instruction = trim(preg_replace('/\s+/', ' ', $instruction));
        }

        $steps[] = array(
            'instruction' => $instruction,
            'maneuver' => !empty($step['maneuver']) ? $step['maneuver'] : '',
            'path' => Wo_ApiMapDiscoveryDecodePolyline(!empty($step['polyline']['points']) ? $step['polyline']['points'] : ''),
            'distanceMeters' => !empty($step['distance']['value']) ? (float) $step['distance']['value'] : 0,
            'durationSeconds' => !empty($step['duration']['value']) ? (float) $step['duration']['value'] : 0,
            'startLocation' => array(
                'lat' => !empty($step['start_location']['lat']) ? (float) $step['start_location']['lat'] : 0,
                'lng' => !empty($step['start_location']['lng']) ? (float) $step['start_location']['lng'] : 0
            ),
            'endLocation' => array(
                'lat' => !empty($step['end_location']['lat']) ? (float) $step['end_location']['lat'] : 0,
                'lng' => !empty($step['end_location']['lng']) ? (float) $step['end_location']['lng'] : 0
            )
        );
    }

    return $steps;
}

function Wo_ApiMapDiscoveryRoute() {
    $origin_lat = Wo_ApiMapDiscoveryNumber('origin_lat');
    $origin_lng = Wo_ApiMapDiscoveryNumber('origin_lng');
    $destination_lat = Wo_ApiMapDiscoveryNumber('destination_lat');
    $destination_lng = Wo_ApiMapDiscoveryNumber('destination_lng');
    $mode = Wo_ApiMapDiscoveryRouteMode();
    if ($origin_lat === null || $origin_lng === null || $destination_lat === null || $destination_lng === null) {
        return Wo_ApiMapDiscoveryError('coordinates_missing', 'Route coordinates are required.');
    }

    $google = Wo_ApiMapDiscoveryGoogleGet('directions/json', array(
        'origin' => number_format($origin_lat, 6, '.', '') . ',' . number_format($origin_lng, 6, '.', ''),
        'destination' => number_format($destination_lat, 6, '.', '') . ',' . number_format($destination_lng, 6, '.', ''),
        'mode' => $mode,
        'language' => 'vi',
        'region' => 'vn',
        'units' => 'metric',
        'alternatives' => 'true'
    ), WO_API_MAP_DISCOVERY_TIMEOUT_MS, WO_API_MAP_DISCOVERY_CONNECT_TIMEOUT_MS, 30);
    if (!empty($google['errors'])) {
        return $google;
    }
    if (($google['status'] ?? '') !== 'OK' || empty($google['routes'][0]['legs'][0])) {
        return Wo_ApiMapDiscoveryError('route_not_found', 'Google route not found.', 404);
    }

    $routes = array();
    foreach ($google['routes'] as $route_index => $candidate_route) {
        if (empty($candidate_route['legs'][0])) {
            continue;
        }
        $candidate_leg = $candidate_route['legs'][0];
        $routes[] = array(
            'id' => 'route-' . ($route_index + 1),
            'summary' => !empty($candidate_route['summary']) ? $candidate_route['summary'] : '',
            'path' => Wo_ApiMapDiscoveryDecodePolyline(!empty($candidate_route['overview_polyline']['points']) ? $candidate_route['overview_polyline']['points'] : ''),
            'steps' => Wo_ApiMapDiscoveryRouteSteps($candidate_leg),
            'distanceMeters' => !empty($candidate_leg['distance']['value']) ? (float) $candidate_leg['distance']['value'] : 0,
            'durationSeconds' => !empty($candidate_leg['duration']['value']) ? (float) $candidate_leg['duration']['value'] : 0,
            'mode' => $mode,
            'provider' => 'google'
        );
    }

    if (empty($routes)) {
        return Wo_ApiMapDiscoveryError('route_not_found', 'Google route not found.', 404);
    }

    usort($routes, function ($left, $right) {
        return ($left['durationSeconds'] <=> $right['durationSeconds']);
    });

    return array(
        'api_status' => 200,
        'route' => $routes[0],
        'routes' => $routes
    );
}

$rate_limit = (!empty($action) && in_array($action, $valid_actions, true))
    ? Wo_ApiMapDiscoveryRateLimit($action)
    : array('allowed' => true, 'retry_after' => 0);

if (empty($action) || !in_array($action, $valid_actions)) {
    $response_data = Wo_ApiMapDiscoveryError('type_missing', 'type can not be empty.');
}
else if (empty($rate_limit['allowed'])) {
    $response_data = Wo_ApiMapDiscoveryError('rate_limited', 'Too many map requests. Please try again shortly.', 429);
    $response_data['retry_after'] = (int) $rate_limit['retry_after'];
}
else if ($action == 'page_suggestions') {
    $response_data = Wo_ApiMapDiscoveryPageSuggestions();
}
else if ($action == 'place_autocomplete') {
    $response_data = Wo_ApiMapDiscoveryAutocomplete();
}
else if ($action == 'address_autocomplete') {
    $response_data = Wo_ApiMapDiscoveryAddressAutocomplete();
}
else if ($action == 'address_geocode') {
    $response_data = Wo_ApiMapDiscoveryAddressGeocode();
}
else if ($action == 'address_details') {
    $response_data = Wo_ApiMapDiscoveryAddressDetails();
}
else if ($action == 'place_details') {
    $response_data = Wo_ApiMapDiscoveryPlaceDetails();
}
else if ($action == 'route') {
    $response_data = Wo_ApiMapDiscoveryRoute();
}
