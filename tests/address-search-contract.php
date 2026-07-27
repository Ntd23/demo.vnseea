<?php

function address_contract_fail($message)
{
    fwrite(STDERR, "FAIL: {$message}\n");
    exit(1);
}

function address_contract_assert($condition, $message)
{
    if (!$condition) {
        address_contract_fail($message);
    }
}

function address_contract_function_slice($source, $function_name, $next_function_name = null)
{
    $start = strpos($source, "function {$function_name}");
    if ($start === false) {
        address_contract_fail("Missing function {$function_name}.");
    }

    $end = $next_function_name !== null
        ? strpos($source, "function {$next_function_name}", $start)
        : false;
    if ($end === false) {
        $end = strlen($source);
    }

    return substr($source, $start, $end - $start);
}

$root = dirname(__DIR__);
$canonical = file_get_contents($root . '/api/v2/endpoints/map_discovery.php');
$app_root = getenv('VNSEEA_APP_ROOT');
if (!$app_root) {
    $app_root = dirname($root) . '/vnseea-app-native';
}
$mirror_path = rtrim($app_root, '/\\') . '/phtml/api/v2/endpoints/map_discovery.php';
address_contract_assert(is_file($mirror_path), 'Missing App backend mirror at ' . $mirror_path);
$mirror = file_get_contents($mirror_path);

foreach (array($canonical, $mirror) as $source) {
    address_contract_assert(strpos($source, "'address_autocomplete'") !== false, 'Dedicated address autocomplete action must be registered.');
    address_contract_assert(strpos($source, "'address_geocode'") !== false, 'Dedicated address geocode action must be registered.');
    address_contract_assert(strpos($source, "'address_details'") !== false, 'Dedicated address details action must be registered.');
}

$canonical_autocomplete = address_contract_function_slice($canonical, 'Wo_ApiMapDiscoveryAddressAutocomplete', 'Wo_ApiMapDiscoveryAddressGeocode');
$mirror_autocomplete = address_contract_function_slice($mirror, 'Wo_ApiMapDiscoveryAddressAutocomplete', 'Wo_ApiMapDiscoveryAddressGeocode');

foreach (array($canonical_autocomplete, $mirror_autocomplete) as $autocomplete_source) {
    address_contract_assert(strpos($autocomplete_source, "place/autocomplete/json") !== false, 'Address autocomplete must use Places legacy autocomplete.');
    address_contract_assert(strpos($autocomplete_source, "'types' => 'geocode'") !== false, 'Address autocomplete must force geocode predictions.');
    address_contract_assert(strpos($autocomplete_source, "'components' => 'country:vn'") !== false, 'Address autocomplete must force Vietnam components.');
    address_contract_assert(strpos($autocomplete_source, "sessiontoken") !== false, 'Address autocomplete must forward the optional session token.');
    address_contract_assert(strpos($autocomplete_source, "place/nearbysearch/json") === false, 'Address autocomplete must not call Nearby Search.');
    address_contract_assert(strpos($autocomplete_source, "place/textsearch/json") === false, 'Address autocomplete must not call Text Search.');
    address_contract_assert(strpos($autocomplete_source, "Wo_ApiMapDiscoveryGetGoogleTypeFromInput") === false, 'Address autocomplete must not invoke the category classifier.');
    address_contract_assert(strpos($autocomplete_source, "Wo_ApiMapDiscoveryRequestedGoogleType") === false, 'Address autocomplete must not use requested category type routing.');
}

$canonical_business = address_contract_function_slice($canonical, 'Wo_ApiMapDiscoveryAutocomplete', 'Wo_ApiMapDiscoveryAddressAutocomplete');
$mirror_business = address_contract_function_slice($mirror, 'Wo_ApiMapDiscoveryAutocomplete', 'Wo_ApiMapDiscoveryAddressAutocomplete');
foreach (array($canonical_business, $mirror_business) as $business_source) {
    address_contract_assert(strpos($business_source, 'Wo_ApiMapDiscoveryRequestedGoogleType') !== false, 'Business discovery may use only a validated client category as a type hint.');
    address_contract_assert(strpos($business_source, "'query' => \$input") !== false, 'Business discovery must send the exact input to Text Search.');
    address_contract_assert(strpos($business_source, 'place/nearbysearch/json') !== false, 'Business discovery must keep Nearby Search.');
    address_contract_assert(strpos($business_source, 'place/textsearch/json') !== false, 'Business discovery must keep Text Search.');
    address_contract_assert(strpos($business_source, 'Wo_ApiMapDiscoveryFilterGooglePlaceResultsByRadius') !== false, 'Business discovery must hard-filter Google places by the requested radius.');
    address_contract_assert(strpos($business_source, '$result_limit = ($fast && !$global_search) ? 12 : 20;') !== false, 'Business discovery must bound typeahead and committed result counts.');
}

$canonical_pages = address_contract_function_slice($canonical, 'Wo_ApiMapDiscoveryPageSuggestions', 'Wo_ApiMapDiscoveryAddPrediction');
$mirror_pages = address_contract_function_slice($mirror, 'Wo_ApiMapDiscoveryPageSuggestions', 'Wo_ApiMapDiscoveryAddPrediction');
foreach (array($canonical_pages, $mirror_pages) as $page_source) {
    address_contract_assert(strpos($page_source, '$max_distance_meters') !== false, 'Page discovery must derive a hard distance boundary.');
    address_contract_assert(strpos($page_source, 'CAST(`lat` AS DECIMAL(10,7)) BETWEEN') !== false, 'Page discovery must bound database candidates by latitude.');
    address_contract_assert(strpos($page_source, '$distance_meters > $max_distance_meters') !== false, 'Page discovery must remove candidates outside the requested radius.');
}

$canonical_geocode = address_contract_function_slice($canonical, 'Wo_ApiMapDiscoveryAddressGeocode', 'Wo_ApiMapDiscoveryAddressDetails');
$mirror_geocode = address_contract_function_slice($mirror, 'Wo_ApiMapDiscoveryAddressGeocode', 'Wo_ApiMapDiscoveryAddressDetails');

foreach (array($canonical_geocode, $mirror_geocode) as $geocode_source) {
    address_contract_assert(strpos($geocode_source, "geocode/json") !== false, 'Address geocode must use Google Geocoding.');
    address_contract_assert(strpos($geocode_source, "address_not_found") !== false, 'Address geocode must emit the stable address_not_found error.');
    address_contract_assert(strpos($geocode_source, "google_request_denied") !== false, 'Address geocode must emit the stable google_request_denied error.');
}

$canonical_details = address_contract_function_slice($canonical, 'Wo_ApiMapDiscoveryAddressDetails', 'Wo_ApiMapDiscoveryPlaceDetails');
$mirror_details = address_contract_function_slice($mirror, 'Wo_ApiMapDiscoveryAddressDetails', 'Wo_ApiMapDiscoveryPlaceDetails');
$canonical_payload = address_contract_function_slice($canonical, 'Wo_ApiMapDiscoveryAddressPayloadFromGeocodeResult', 'Wo_ApiMapDiscoveryAddressPredictionFromGeocodeResult');
$mirror_payload = address_contract_function_slice($mirror, 'Wo_ApiMapDiscoveryAddressPayloadFromGeocodeResult', 'Wo_ApiMapDiscoveryAddressPredictionFromGeocodeResult');

foreach (array($canonical_details, $mirror_details) as $details_source) {
    address_contract_assert(strpos($details_source, "place/details/json") !== false, 'Address details must use Places Details.');
    address_contract_assert(strpos($details_source, "sessiontoken") !== false, 'Address details must forward the autocomplete session token.');
    address_contract_assert(strpos($details_source, "Wo_ApiMapDiscoveryAddressPayloadFromGeocodeResult") !== false, 'Address details must use the canonical address mapper.');
}

foreach (array($canonical_payload, $mirror_payload) as $payload_source) {
    address_contract_assert(strpos($payload_source, "'city'") !== false, 'Address details must expose city.');
    address_contract_assert(strpos($payload_source, "'district'") !== false, 'Address details must expose district.');
    address_contract_assert(strpos($payload_source, "'ward'") !== false, 'Address details must expose ward.');
    address_contract_assert(strpos($payload_source, "'country'") !== false, 'Address details must expose country.');
}

fwrite(STDOUT, "address search contract: ok\n");
