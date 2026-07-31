<?php

$root = dirname(__DIR__);
$source = file_get_contents($root . '/api/v2/endpoints/map_discovery.php');

function assert_map_performance_contract($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

assert_map_performance_contract(
    strpos($source, "WO_API_MAP_DISCOVERY_TIMEOUT_MS', 4500") !== false &&
        strpos($source, "WO_API_MAP_DISCOVERY_CONNECT_TIMEOUT_MS', 1500") !== false &&
        strpos($source, '$fast ? 1300') !== false &&
        strpos($source, '$fast ? 500') !== false,
    'Google requests must use bounded normal and typing timeouts'
);
assert_map_performance_contract(
    strpos($source, 'CURLOPT_SSL_VERIFYPEER, true') !== false &&
        strpos($source, 'CURLOPT_SSL_VERIFYHOST, 2') !== false,
    'Google requests must verify TLS'
);
assert_map_performance_contract(
    strpos($source, 'function Wo_ApiMapDiscoveryCacheRead(') !== false &&
        strpos($source, 'function Wo_ApiMapDiscoveryCacheWrite(') !== false &&
        strpos($source, "array('OK', 'ZERO_RESULTS')") !== false,
    'successful Google reads must support bounded server-side caching'
);
assert_map_performance_contract(
    strpos($source, "Wo_ApiMapDiscoveryConsumeRateBucket(\$identity, 'all', 120)") !== false &&
        strpos($source, "'place_autocomplete' => 45") !== false &&
        strpos($source, "'rate_limited'") !== false &&
        strpos($source, "['retry_after']") !== false,
    'map discovery must enforce global and action-specific limits'
);
assert_map_performance_contract(
    strpos($source, 'usleep(1700000)') === false &&
        strpos($source, '$next_page_token') === false,
    'interactive Nearby search must not wait for additional Google pages'
);

echo "map discovery performance contract: ok\n";
