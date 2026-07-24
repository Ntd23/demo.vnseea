<?php

$root = dirname(__DIR__);

function profile_media_assert_true($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$helperPath = $root . '/assets/includes/vnseea_profile_media.php';
$endpointPath = $root . '/api/v2/endpoints/update-user-data.php';

profile_media_assert_true(file_exists($helperPath), 'canonical profile media helper must exist');

require_once $helperPath;

profile_media_assert_true(
    VNSEEA_ProfileMediaImageMatchesContract('avatar', array(1080, 1080)),
    'avatar contract must accept a square crop'
);
profile_media_assert_true(
    VNSEEA_ProfileMediaImageMatchesContract('cover', array(1836, 664)),
    'cover contract must accept the profile hero crop at 2x density'
);
profile_media_assert_true(
    !VNSEEA_ProfileMediaImageMatchesContract('cover', array(1600, 900)),
    'cover contract must reject a crop that does not match the profile hero'
);

$helper = file_get_contents($helperPath);
$endpoint = file_get_contents($endpointPath);

profile_media_assert_true(strpos($helper, "canonical_crop_v1") !== false, 'helper must own the canonical crop contract');
profile_media_assert_true(strpos($helper, 'startTransaction()') !== false, 'canonical upload must start a transaction');
profile_media_assert_true(strpos($helper, 'rollback()') !== false, 'canonical upload must rollback failures');
profile_media_assert_true(strpos($helper, 'if (!$db->commit())') !== false, 'canonical upload must verify commit success');
profile_media_assert_true(strpos($helper, 'profile_media_post_failed') !== false, 'post insert failure must have a stable error code');
profile_media_assert_true(strpos($helper, "'profile_media' =>") !== false, 'success response must contain canonical profile media');
profile_media_assert_true(strpos($helper, "'full_url' =>") !== false, 'success response must contain full url');
profile_media_assert_true(strpos($helper, "'post_id' =>") !== false, 'success response must contain post id');
profile_media_assert_true(strpos($helper, 'Wo_Resize_Crop_Image(918, 332') === false, 'canonical cover must not be cropped to the legacy ratio');
profile_media_assert_true(strpos($helper, '$target_width = $kind === \'avatar\' ? 1080 : 1836') !== false, 'canonical cover must retain 2x hero density');
profile_media_assert_true(strpos($helper, 'max(90, $configured_quality)') !== false, 'profile media quality must not fall below 90');
profile_media_assert_true(strpos($endpoint, 'VNSEEA_HandleCanonicalProfileMediaRequest') !== false, 'API v2 must delegate the canonical request');
profile_media_assert_true(strpos($endpoint, "profile_media_contract") !== false, 'API v2 must detect the canonical contract');

fwrite(STDOUT, "profile media upload contract: ok\n");
