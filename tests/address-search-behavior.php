<?php

function address_behavior_fail($message)
{
    fwrite(STDERR, "FAIL: {$message}\n");
    exit(1);
}

function address_behavior_assert($condition, $message)
{
    if (!$condition) {
        address_behavior_fail($message);
    }
}

function address_behavior_assert_same($expected, $actual, $message)
{
    if ($expected !== $actual) {
        address_behavior_fail(
            $message . "\nExpected: " . var_export($expected, true) . "\nActual: " . var_export($actual, true)
        );
    }
}

function address_behavior_assert_contains($needle, $haystack, $message)
{
    if (strpos($haystack, $needle) === false) {
        address_behavior_fail($message . "\nMissing: " . $needle . "\nActual: " . $haystack);
    }
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
address_behavior_assert(is_file($endpoint), 'Missing map discovery endpoint at ' . $endpoint);
require_once $endpoint;

$requests = array();
$GLOBALS['wo_api_map_discovery_google_get_mock'] = function ($path, array $query) use (&$requests) {
    $requests[] = array('path' => $path, 'query' => $query);

    if ($path === 'place/autocomplete/json') {
        return array(
            'status' => 'OK',
            'predictions' => array(
                array(
                    'place_id' => 'addr-place-1',
                    'description' => '12 Ly Thuong Kiet, Hoan Kiem, Ha Noi, Vietnam',
                    'structured_formatting' => array(
                        'main_text' => '12 Ly Thuong Kiet',
                        'secondary_text' => 'Hoan Kiem, Ha Noi, Vietnam'
                    ),
                    'types' => array('geocode')
                )
            )
        );
    }

    if ($path === 'geocode/json') {
        return array(
            'status' => 'OK',
            'results' => array(
                array(
                    'place_id' => 'geo-place-1',
                    'formatted_address' => '12 Ly Thuong Kiet, Phan Chu Trinh, Hoan Kiem, Ha Noi, Vietnam',
                    'geometry' => array(
                        'location' => array(
                            'lat' => 21.0245,
                            'lng' => 105.8572
                        )
                    ),
                    'address_components' => array(
                        array(
                            'long_name' => 'Phan Chu Trinh',
                            'types' => array('administrative_area_level_3', 'political')
                        ),
                        array(
                            'long_name' => 'Hoan Kiem',
                            'types' => array('administrative_area_level_2', 'political')
                        ),
                        array(
                            'long_name' => 'Ha Noi',
                            'types' => array('administrative_area_level_1', 'political')
                        ),
                        array(
                            'long_name' => 'Vietnam',
                            'types' => array('country', 'political')
                        )
                    ),
                    'types' => array('street_address')
                )
            )
        );
    }

    return array('status' => 'ZERO_RESULTS', 'results' => array());
};

$_POST = array(
    'query' => '24 ngõ 3 Tân Mỹ, Mỹ Đình 1',
    'language' => 'en',
    'sessiontoken' => 'session-token-1',
    'origin_lat' => '21.024500',
    'origin_lng' => '105.857200',
    'radius' => '999999'
);
$requests = array();
$autocomplete = Wo_ApiMapDiscoveryAddressAutocomplete();

address_behavior_assert_same(200, $autocomplete['api_status'], 'Address autocomplete must succeed.');
address_behavior_assert_same('place/autocomplete/json', $requests[0]['path'], 'Address autocomplete must call Places autocomplete first.');
address_behavior_assert_same('24 ngõ 3 Tân Mỹ, Mỹ Đình 1', $requests[0]['query']['input'], 'Address autocomplete must forward the raw address without classifying it as a business.');
address_behavior_assert_same('geocode', $requests[0]['query']['types'], 'Address autocomplete must force geocode predictions.');
address_behavior_assert_same('country:vn', $requests[0]['query']['components'], 'Address autocomplete must restrict to Vietnam.');
address_behavior_assert_same('en', $requests[0]['query']['language'], 'Address autocomplete must forward the language.');
address_behavior_assert_same('session-token-1', $requests[0]['query']['sessiontoken'], 'Address autocomplete must forward the session token.');
address_behavior_assert_same('21.024500,105.857200', $requests[0]['query']['location'], 'Address autocomplete must forward location bias coordinates.');
address_behavior_assert_same(50000, $requests[0]['query']['radius'], 'Address autocomplete must clamp the location bias radius.');
address_behavior_assert_same('addr-place-1', $autocomplete['predictions'][0]['place_id'], 'Address autocomplete must return Places predictions.');

$GLOBALS['wo_api_map_discovery_google_get_mock'] = function ($path, array $query) use (&$requests) {
    $requests[] = array('path' => $path, 'query' => $query);

    if ($path === 'place/autocomplete/json') {
        return array('status' => 'ZERO_RESULTS', 'predictions' => array());
    }

    if ($path === 'geocode/json') {
        return array(
            'status' => 'OK',
            'results' => array(
                array(
                    'place_id' => 'geo-fallback-1',
                    'formatted_address' => '1 Trang Tien, Trang Tien, Hoan Kiem, Ha Noi, Vietnam',
                    'geometry' => array(
                        'location' => array(
                            'lat' => 21.0257,
                            'lng' => 105.8554
                        )
                    ),
                    'address_components' => array(
                        array('long_name' => 'Trang Tien', 'types' => array('administrative_area_level_3', 'political')),
                        array('long_name' => 'Hoan Kiem', 'types' => array('administrative_area_level_2', 'political')),
                        array('long_name' => 'Ha Noi', 'types' => array('administrative_area_level_1', 'political')),
                        array('long_name' => 'Vietnam', 'types' => array('country', 'political'))
                    ),
                    'types' => array('street_address')
                )
            )
        );
    }

    return array('status' => 'ZERO_RESULTS');
};

$_POST = array(
    'query' => '1 Trang Tien',
    'language' => 'vi'
);
$requests = array();
$fallback = Wo_ApiMapDiscoveryAddressAutocomplete();

address_behavior_assert_same(200, $fallback['api_status'], 'Address autocomplete fallback must succeed.');
address_behavior_assert_same('place/autocomplete/json', $requests[0]['path'], 'Address autocomplete must still try Places first.');
address_behavior_assert_same('geocode/json', $requests[1]['path'], 'Address autocomplete must fall back to Geocoding.');
address_behavior_assert_same('geo-fallback-1', $fallback['predictions'][0]['place_id'], 'Address autocomplete fallback must surface Geocoding results.');
address_behavior_assert_same('geocode', $fallback['predictions'][0]['source'], 'Fallback suggestions must identify Geocoding as their source.');
address_behavior_assert_same('1 Trang Tien', $requests[1]['query']['address'], 'Fallback geocode must use the raw input.');

$GLOBALS['wo_api_map_discovery_google_get_mock'] = function ($path, array $query) use (&$requests) {
    $requests[] = array('path' => $path, 'query' => $query);

    return array(
        'status' => 'OK',
        'results' => array(
            array(
                'place_id' => 'geo-place-2',
                'formatted_address' => '20 Hai Ba Trung, Ben Nghe, Quan 1, Ho Chi Minh, Vietnam',
                'geometry' => array(
                    'location' => array(
                        'lat' => 10.7766,
                        'lng' => 106.7009
                    )
                ),
                'address_components' => array(
                    array('long_name' => 'Ben Nghe', 'types' => array('administrative_area_level_3', 'political')),
                    array('long_name' => 'Quan 1', 'types' => array('administrative_area_level_2', 'political')),
                    array('long_name' => 'Ho Chi Minh', 'types' => array('administrative_area_level_1', 'political')),
                    array('long_name' => 'Vietnam', 'types' => array('country', 'political'))
                ),
                'types' => array('street_address')
            )
        )
    );
};

$_POST = array(
    'query' => '20 Hai Ba Trung',
    'language' => 'vi'
);
$requests = array();
$geocode = Wo_ApiMapDiscoveryAddressGeocode();

address_behavior_assert_same(200, $geocode['api_status'], 'Address geocode must succeed.');
address_behavior_assert_same('geocode/json', $requests[0]['path'], 'Address geocode must use the Geocoding API.');
address_behavior_assert_same('20 Hai Ba Trung, Ben Nghe, Quan 1, Ho Chi Minh, Vietnam', $geocode['address']['address'], 'Address geocode must return the canonical formatted address.');
address_behavior_assert_same('Ho Chi Minh', $geocode['address']['city'], 'Address geocode must expose city.');
address_behavior_assert_same('Quan 1', $geocode['address']['district'], 'Address geocode must expose district.');
address_behavior_assert_same('Ben Nghe', $geocode['address']['ward'], 'Address geocode must expose ward.');
address_behavior_assert_same('Vietnam', $geocode['address']['country'], 'Address geocode must expose country.');

$GLOBALS['wo_api_map_discovery_google_get_mock'] = function ($path, array $query) use (&$requests) {
    $requests[] = array('path' => $path, 'query' => $query);

    return array(
        'status' => 'OK',
        'result' => array(
            'place_id' => 'addr-details-1',
            'formatted_address' => '14 Nguyen Hue, Ben Nghe, Quan 1, Ho Chi Minh, Vietnam',
            'geometry' => array(
                'location' => array(
                    'lat' => 10.7731,
                    'lng' => 106.7038
                )
            ),
            'address_components' => array(
                array('long_name' => 'Ben Nghe', 'types' => array('administrative_area_level_3', 'political')),
                array('long_name' => 'Quan 1', 'types' => array('administrative_area_level_2', 'political')),
                array('long_name' => 'Ho Chi Minh', 'types' => array('administrative_area_level_1', 'political')),
                array('long_name' => 'Vietnam', 'types' => array('country', 'political'))
            ),
            'types' => array('street_address')
        )
    );
};

$_POST = array(
    'place_id' => 'addr-details-1',
    'language' => 'vi',
    'sessiontoken' => 'session-token-details'
);
$requests = array();
$details = Wo_ApiMapDiscoveryAddressDetails();

address_behavior_assert_same(200, $details['api_status'], 'Address details must succeed.');
address_behavior_assert_same('place/details/json', $requests[0]['path'], 'Address details must resolve through Places Details.');
address_behavior_assert_same('addr-details-1', $requests[0]['query']['place_id'], 'Address details must look up the requested place id.');
address_behavior_assert_same('session-token-details', $requests[0]['query']['sessiontoken'], 'Address details must reuse the autocomplete session token.');
address_behavior_assert_same('14 Nguyen Hue, Ben Nghe, Quan 1, Ho Chi Minh, Vietnam', $details['address']['address'], 'Address details must return the canonical formatted address.');
address_behavior_assert_same('Ho Chi Minh', $details['address']['city'], 'Address details must expose city.');

unset($GLOBALS['wo_api_map_discovery_google_get_mock']);
$wo['config'] = array();
$_POST = array(
    'query' => '10 Le Loi',
    'language' => 'vi'
);
$not_configured = Wo_ApiMapDiscoveryAddressGeocode();

address_behavior_assert_same('google_not_configured', $not_configured['errors']['error_id'], 'Missing Google configuration must map to the stable error.');

$GLOBALS['wo_api_map_discovery_google_get_mock'] = function () {
    return array(
        'status' => 'REQUEST_DENIED',
        'error_message' => 'API key secret-key-123 is not authorized'
    );
};
$_POST = array(
    'query' => '10 Le Loi',
    'language' => 'vi'
);
$denied = Wo_ApiMapDiscoveryAddressGeocode();

address_behavior_assert_same('google_request_denied', $denied['errors']['error_id'], 'Denied Google responses must use the stable error code.');
address_behavior_assert_contains('denied', strtolower($denied['errors']['error_text']), 'Denied Google responses must use generic wording.');
address_behavior_assert(strpos($denied['errors']['error_text'], 'secret-key-123') === false, 'Denied Google responses must not leak the raw Google error.');

$GLOBALS['wo_api_map_discovery_google_get_mock'] = function () {
    return array('status' => 'ZERO_RESULTS', 'results' => array());
};
$_POST = array(
    'query' => 'Unknown Address',
    'language' => 'vi'
);
$not_found = Wo_ApiMapDiscoveryAddressGeocode();

address_behavior_assert_same('address_not_found', $not_found['errors']['error_id'], 'Missing addresses must use the stable not-found error.');

$_POST = array(
    'query' => 'a',
    'language' => 'vi'
);
$too_short = Wo_ApiMapDiscoveryAddressAutocomplete();
address_behavior_assert_same('query_invalid', $too_short['errors']['error_id'], 'Address autocomplete must reject queries shorter than two characters.');

$_POST = array(
    'query' => str_repeat('a', 161),
    'language' => 'vi'
);
$too_long = Wo_ApiMapDiscoveryAddressAutocomplete();
address_behavior_assert_same('query_invalid', $too_long['errors']['error_id'], 'Address autocomplete must reject queries longer than 160 characters.');

fwrite(STDOUT, "address search behavior: ok\n");
