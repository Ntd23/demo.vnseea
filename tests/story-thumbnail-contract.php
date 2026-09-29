<?php

$root = dirname(__DIR__);

$create = file_get_contents($root . '/api/v2/endpoints/create-story.php');
if ($create === false) {
    fwrite(STDERR, "Unable to read api/v2/endpoints/create-story.php\n");
    exit(1);
}

$assertions = array(
    array(
        substr_count($create, 'Wo_Resize_Crop_Image(540, 960, ') === 2,
        'uploaded covers and ffmpeg frames must both be cropped to a 9:16 story thumbnail'
    ),
    array(
        strpos($create, 'Wo_Resize_Crop_Image(400, 400, ') === false,
        'story thumbnails must not be square 400x400 crops that blur the home story rail'
    ),
);

foreach ($assertions as $assertion) {
    if (!$assertion[0]) {
        fwrite(STDERR, "FAIL: {$assertion[1]}\n");
        exit(1);
    }
}

echo "story thumbnail contract: ok\n";
