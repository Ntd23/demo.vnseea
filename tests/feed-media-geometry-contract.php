<?php

$root = dirname(__DIR__);
require_once $root . '/assets/includes/vnseea_post_media.php';

function vnseea_geometry_assert($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "Assertion failed: {$message}\n");
        exit(1);
    }
}

$geometry = VNSEEA_NormalizeMediaGeometry('1080', '1920');
vnseea_geometry_assert($geometry['width'] === 1080, 'normalizes width');
vnseea_geometry_assert($geometry['height'] === 1920, 'normalizes height');
vnseea_geometry_assert(abs($geometry['aspect_ratio'] - 0.5625) < 0.000001, 'calculates aspect ratio');
vnseea_geometry_assert(VNSEEA_NormalizeMediaGeometry(0, 100) === null, 'rejects zero width');
vnseea_geometry_assert(VNSEEA_NormalizeMediaGeometry(50000, 100) === null, 'rejects unsafe dimensions');

$list = VNSEEA_NormalizeMediaGeometryList(json_encode(array(
    array('width' => 800, 'height' => 600),
    null,
    array('width' => 720, 'height' => 1280),
)));
vnseea_geometry_assert($list[0]['aspect_ratio'] === 1.333333, 'normalizes list item');
vnseea_geometry_assert($list[1] === null, 'preserves missing list geometry');
vnseea_geometry_assert($list[2]['width'] === 720, 'preserves media order');

$png_path = tempnam(sys_get_temp_dir(), 'vnseea-geometry-');
file_put_contents(
    $png_path,
    base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAIAAAADCAYAAABWKLW/AAAAFElEQVQImWNgoBpgYGBgYGBg+A8AAAwAAf6n8gAAAABJRU5ErkJggg==')
);
$image_geometry = VNSEEA_ReadImageMediaGeometry($png_path);
@unlink($png_path);
vnseea_geometry_assert(is_array($image_geometry), 'reads uploaded image geometry');
vnseea_geometry_assert($image_geometry['width'] === 2, 'reads image width');
vnseea_geometry_assert($image_geometry['height'] === 3, 'reads image height');

$new_post_source = file_get_contents($root . '/api/v2/endpoints/new_post.php');
vnseea_geometry_assert(strpos($new_post_source, "photo_media_geometry") !== false, 'accepts ordered photo geometry');
vnseea_geometry_assert(strpos($new_post_source, "VNSEEA_ReadImageMediaGeometry") !== false, 'trusts server image dimensions');
vnseea_geometry_assert(strpos($new_post_source, "VNSEEA_PostMediaGeometryColumnsAvailable") !== false, 'stays compatible before migration');
vnseea_geometry_assert(strpos($new_post_source, "video_thumbnail_contract") !== false, 'accepts the App thumbnail aspect contract');
vnseea_geometry_assert(strpos($new_post_source, "preserve_aspect_v1") !== false, 'recognizes aspect-preserving App thumbnails');
vnseea_geometry_assert(strpos($new_post_source, "if (!\$preserve_video_thumbnail_aspect)") !== false, 'keeps the legacy fixed crop behind a compatibility branch');

echo "feed media geometry contract: ok\n";
