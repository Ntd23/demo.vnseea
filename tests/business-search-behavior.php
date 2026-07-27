<?php

function business_search_fail($message)
{
    fwrite(STDERR, "FAIL: {$message}\n");
    exit(1);
}

function business_search_assert($condition, $message)
{
    if (!$condition) {
        business_search_fail($message);
    }
}

function business_search_assert_same($expected, $actual, $message)
{
    if ($expected !== $actual) {
        business_search_fail(
            $message . "\nExpected: " . var_export($expected, true) .
            "\nActual: " . var_export($actual, true)
        );
    }
}

function business_search_find_request($requests, $path)
{
    foreach ($requests as $request) {
        if ($request['path'] === $path) {
            return $request;
        }
    }
    return null;
}

$_POST = array('type' => 'noop');
$wo = array('config' => array());

function Wo_Secure($value)
{
    return $value;
}

function Wo_GetMedia($value)
{
    return $value;
}

$endpoint = getenv('MAP_DISCOVERY_ENDPOINT');
if (!$endpoint) {
    $endpoint = dirname(__DIR__) . '/api/v2/endpoints/map_discovery.php';
}
business_search_assert(is_file($endpoint), 'Missing map discovery endpoint at ' . $endpoint);
require_once $endpoint;

business_search_assert(
    !function_exists('Wo_ApiMapDiscoveryGetGoogleTypeFromInput'),
    'Business search must not depend on a finite keyword classifier.'
);

$cases = array(
    array('query' => 'tóc', 'category' => null),
    array('query' => 'quán tóc', 'category' => 'hair_care'),
    array('query' => 'tiệm tóc', 'category' => 'hair_care'),
    array('query' => 'quán ăn', 'category' => 'restaurant'),
    array('query' => 'bánh sinh nhật', 'category' => null),
    array('query' => 'sửa xe', 'category' => null),
    array('query' => 'cây xăng', 'category' => 'gas_station')
);

foreach ($cases as $index => $case) {
    $requests = array();
    $GLOBALS['wo_api_map_discovery_google_get_mock'] = function ($path, array $query) use (&$requests, $index) {
        $requests[] = array('path' => $path, 'query' => $query);
        if ($path !== 'place/textsearch/json') {
            return array('status' => 'ZERO_RESULTS', 'results' => array(), 'predictions' => array());
        }

        return array(
            'status' => 'OK',
            'results' => array(
                array(
                    'place_id' => 'business-' . $index,
                    'name' => 'Business ' . $index,
                    'formatted_address' => 'Ha Noi, Vietnam',
                    'geometry' => array(
                        'location' => array('lat' => 21.0285, 'lng' => 105.8542)
                    ),
                    'types' => array('establishment')
                ),
                array(
                    'place_id' => 'business-far-' . $index,
                    'name' => 'Far Business ' . $index,
                    'formatted_address' => 'Outside requested radius',
                    'geometry' => array(
                        'location' => array('lat' => 21.5000, 'lng' => 105.8542)
                    ),
                    'types' => array('establishment')
                )
            )
        );
    };

    $_POST = array(
        'query' => $case['query'],
        'search_mode' => 'business',
        'prefer_address' => '1',
        'origin_lat' => '21.028500',
        'origin_lng' => '105.854200',
        'radius' => '5000',
        'fast' => '1'
    );
    if ($case['category'] !== null) {
        $_POST['category'] = $case['category'];
    }

    $response = Wo_ApiMapDiscoveryAutocomplete();
    $text_search = business_search_find_request($requests, 'place/textsearch/json');

    business_search_assert($text_search !== null, 'Every business query must call exact Text Search: ' . $case['query']);
    business_search_assert_same(
        $case['query'],
        $text_search['query']['query'],
        'Text Search must preserve the exact user query.'
    );
    business_search_assert_same(
        $case['category'],
        isset($text_search['query']['type']) ? $text_search['query']['type'] : null,
        'Category must remain an optional type hint.'
    );
    business_search_assert_same(
        1,
        count($response['predictions']),
        'Only the Text Search result inside the requested radius must be returned.'
    );

    foreach ($requests as $request) {
        business_search_assert(
            $request['path'] !== 'geocode/json',
            'Business search must never enter the address geocode pipeline.'
        );
    }
}

$requests = array();
$GLOBALS['wo_api_map_discovery_google_get_mock'] = function ($path, array $query) use (&$requests) {
    $requests[] = array('path' => $path, 'query' => $query);
    if ($path === 'place/textsearch/json') {
        return array(
            'status' => 'OK',
            'results' => array(
                array(
                    'place_id' => 'repair-too-far',
                    'name' => 'Sua xe ngoai pham vi',
                    'formatted_address' => 'Outside requested radius',
                    'geometry' => array(
                        'location' => array('lat' => 21.5000, 'lng' => 105.8542)
                    ),
                    'types' => array('car_repair')
                )
            )
        );
    }
    if ($path === 'place/nearbysearch/json') {
        return array(
            'status' => 'OK',
            'results' => array(
                array(
                    'place_id' => 'repair-fallback',
                    'name' => 'Sua xe gan day',
                    'vicinity' => 'Ha Noi',
                    'geometry' => array(
                        'location' => array('lat' => 21.03, 'lng' => 105.85)
                    ),
                    'types' => array('car_repair')
                )
            )
        );
    }
    return array('status' => 'ZERO_RESULTS', 'predictions' => array());
};

$_POST = array(
    'query' => 'sửa xe',
    'search_mode' => 'business',
    'origin_lat' => '21.028500',
    'origin_lng' => '105.854200',
    'radius' => '5000',
    'fast' => '1'
);
$fallback = Wo_ApiMapDiscoveryAutocomplete();
$nearby = business_search_find_request($requests, 'place/nearbysearch/json');

business_search_assert($nearby !== null, 'Nearby Search must recover when exact Text Search only returns out-of-radius places.');
business_search_assert_same('sửa xe', $nearby['query']['keyword'], 'Nearby fallback must keep the raw query.');
business_search_assert_same(1, count($fallback['predictions']), 'Nearby fallback result must be returned.');

$requests = array();
$GLOBALS['wo_api_map_discovery_google_get_mock'] = function ($path, array $query) use (&$requests) {
    $requests[] = array('path' => $path, 'query' => $query);
    return array('status' => 'ZERO_RESULTS', 'results' => array(), 'predictions' => array());
};

$_POST = array(
    'query' => 'cafe 1985',
    'search_mode' => 'business',
    'prefer_address' => '1',
    'global_search' => '1'
);
Wo_ApiMapDiscoveryAutocomplete();
$autocomplete = business_search_find_request($requests, 'place/autocomplete/json');

business_search_assert($autocomplete !== null, 'Named-place fallback must remain available for business search.');
business_search_assert(
    !isset($autocomplete['query']['types']),
    'Business autocomplete fallback must never be restricted to address types.'
);

unset($GLOBALS['wo_api_map_discovery_google_get_mock']);
fwrite(STDOUT, "business search behavior: ok\n");
