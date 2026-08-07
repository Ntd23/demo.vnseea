<?php

$root = dirname(__DIR__);

function post_media_assert_true($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$helper_path = $root . '/assets/includes/vnseea_post_media.php';
$endpoint_path = $root . '/api/v2/endpoints/new_post.php';
$functions_path = $root . '/assets/includes/functions_one.php';

post_media_assert_true(file_exists($helper_path), 'post media helper must exist');
require_once $helper_path;

post_media_assert_true(
    VNSEEA_NormalizePostFileName('clip.mp4') === 'clip.mp4',
    'ordinary filenames must remain readable'
);
post_media_assert_true(
    VNSEEA_NormalizePostFileName('/private/mobile/clip.mp4') === 'clip.mp4',
    'provider paths must be reduced to a basename'
);

$long_name = 'snapvideo--' . str_repeat('%20caption', 40) . '.mp4';
$normalized = VNSEEA_NormalizePostFileName($long_name);
post_media_assert_true(strlen($normalized) <= 200, 'post filename must fit VARCHAR(200)');
post_media_assert_true(substr($normalized, -4) === '.mp4', 'truncation must preserve extension');
post_media_assert_true($normalized === VNSEEA_NormalizePostFileName($long_name), 'normalization must be deterministic');

$unicode_name = str_repeat('ảnh-video-', 40) . '.mov';
$normalized_unicode = VNSEEA_NormalizePostFileName($unicode_name);
post_media_assert_true(strlen($normalized_unicode) <= 200, 'unicode filename must be capped by bytes');
post_media_assert_true(substr($normalized_unicode, -4) === '.mov', 'unicode filename must preserve extension');

$endpoint = file_get_contents($endpoint_path);
$functions = file_get_contents($functions_path);
post_media_assert_true(
    strpos($endpoint, 'VNSEEA_NormalizePostFileName($mediaName)') !== false,
    'new post endpoint must normalize the stored media name'
);
post_media_assert_true(
    strpos($endpoint, '$created_post_media_files[] = $mediaFilename') !== false,
    'uploaded primary media must be registered for rollback cleanup'
);
post_media_assert_true(
    strpos($endpoint, "'[vnseea-new-post] register_failed") !== false,
    'database insert failures must be caught and logged'
);
post_media_assert_true(
    strpos($functions, "VNSEEA_NormalizePostFileName(\$re_data['postFileName'])") !== false,
    'all Wo_RegisterPost callers must receive the filename guard'
);
post_media_assert_true(
    strpos($functions, 'error_log(print_r($re_data, true))') === false,
    'post payloads and original filenames must not be dumped to PHP logs'
);

fwrite(STDOUT, "post media filename contract: ok\n");
