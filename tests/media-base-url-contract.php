<?php

require_once dirname(__DIR__) . '/assets/includes/vnseea_media_url.php';

function media_url_fail($message)
{
    fwrite(STDERR, "FAIL: {$message}\n");
    exit(1);
}

function media_url_assert_same($expected, $actual, $message)
{
    if ($expected !== $actual) {
        media_url_fail(
            $message . "\nExpected: " . var_export($expected, true) . "\nActual: " . var_export($actual, true)
        );
    }
}

putenv('MEDIA_BASE_URL=https://media.vnseea.vn/');

media_url_assert_same(
    'https://media.vnseea.vn/upload/photos/example.jpg',
    VNSEEA_GetSharedUploadUrl('upload/photos/example.jpg'),
    'Relative upload paths must use MEDIA_BASE_URL.'
);
media_url_assert_same(
    'https://media.vnseea.vn/upload/videos/example.mp4?version=2',
    VNSEEA_GetSharedUploadUrl('/upload/videos/example.mp4?version=2'),
    'Leading slashes and query strings must be preserved safely.'
);
media_url_assert_same(
    '',
    VNSEEA_GetSharedUploadUrl('themes/wondertag/img/logo.png'),
    'Non-upload assets must keep the existing site_url behavior.'
);
media_url_assert_same(
    '',
    VNSEEA_GetSharedUploadUrl('https://external.example/upload/photo.jpg'),
    'Absolute external URLs must not be rewritten.'
);

putenv('MEDIA_BASE_URL');

echo "media-base-url-contract: ok\n";
