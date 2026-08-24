<?php

$root = dirname(__DIR__);

function vnseea_message_video_assert($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "Assertion failed: {$message}\n");
        exit(1);
    }
}

$migration = file_get_contents($root . '/database/migrations/20260824_message_video_thumbnails.sql');
$direct = file_get_contents($root . '/api/v2/endpoints/send-message.php');
$group = file_get_contents($root . '/api/v2/endpoints/group_chat.php');

vnseea_message_video_assert(strpos($migration, 'ADD COLUMN `media_thumb` VARCHAR(255) NULL') !== false, 'adds media_thumb idempotently');
vnseea_message_video_assert(strpos($direct, "\$message_data['media_thumb']") !== false, 'direct messages persist video thumbnails');
vnseea_message_video_assert(strpos($group, "\$message_data['media_thumb']") !== false, 'group messages persist video thumbnails');
vnseea_message_video_assert(strpos($direct, "\$message['media_thumb'] = Wo_GetMedia") !== false, 'direct responses expose canonical thumbnails');
vnseea_message_video_assert(strpos($group, "\$message['media_thumb'] = Wo_GetMedia") !== false, 'group responses expose canonical thumbnails');

echo "message video thumbnail contract: ok\n";
