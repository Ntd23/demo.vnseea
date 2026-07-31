<?php

$root = dirname(__DIR__);
$functions = file_get_contents($root . '/assets/includes/functions_one.php');
$get_chats = file_get_contents($root . '/api/v2/endpoints/get_chats.php');

function assert_backend_performance_contract($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$header_start = strpos($functions, 'function Wo_GetMessagesHeader(');
$header_end = strpos($functions, 'function Wo_RegisterMessage(', $header_start);
$header_source = substr($functions, $header_start, $header_end - $header_start);
assert_backend_performance_contract(
    substr_count($header_source, 'mysqli_query($sqlConnect, $query_one)') === 1 &&
        strpos($header_source, 'ORDER BY `id` DESC LIMIT 1') !== false &&
        strpos($header_source, 'mysqli_num_rows($sql_query_one)') === false,
    'Wo_GetMessagesHeader must query only the latest message, not the full conversation history'
);

foreach (array(
    'VNSEEA_GetMessagesHeaderBatch',
    'VNSEEA_GetUnreadMessageCountsBatch',
    'VNSEEA_GetConversationMutesBatch',
    'VNSEEA_GetChatColorsBatch',
    'VNSEEA_GetPageMessageHeadersBatch',
    'VNSEEA_GetMessageReactionSummariesBatch',
) as $helper) {
    assert_backend_performance_contract(
        strpos($functions, "function {$helper}(") !== false,
        "{$helper} is missing"
    );
    assert_backend_performance_contract(
        strpos($get_chats, "{$helper}(") !== false || $helper === 'VNSEEA_GetMessageReactionSummariesBatch',
        "get_chats must use {$helper}"
    );
}

assert_backend_performance_contract(
    strpos($get_chats, "->where('chat_id'") === false &&
        strpos($get_chats, 'Wo_CountMessages(') === false &&
        strpos($get_chats, 'Wo_GetMessagesHeader(') === false &&
        strpos($get_chats, 'Wo_GetChatColor(') === false &&
        strpos($get_chats, 'Wo_GetPageMessages(') === false,
    'get_chats must not issue mute, unread, latest-message or color queries per conversation'
);

$groups_start = strpos($functions, 'function Wo_GetGroupsListAPP(');
$groups_end = strpos($functions, 'function Wo_GetPostCommentsSort(', $groups_start);
$groups_source = substr($functions, $groups_start, $groups_end - $groups_start);
assert_backend_performance_contract(
    strpos($groups_source, 'Wo_GetChatGroupLastMessage(') === false &&
        strpos($groups_source, 'Wo_GetGChatMemebers(') === false &&
        strpos($groups_source, 'Wo_CheckLastGroupAction(') === false,
    'group chat list must batch last messages, members and unread state'
);

foreach (array(
    'VNSEEA_PrimePostDataBatch',
    'VNSEEA_PrimePostAlbumMediaBatch',
    'VNSEEA_PrimePostPollBatch',
    'VNSEEA_PrimeFeedSummaryPublishers',
    'VNSEEA_PostBatchUserData',
    'VNSEEA_PostBatchPageData',
) as $helper) {
    assert_backend_performance_contract(
        strpos($functions, "function {$helper}(") !== false,
        "{$helper} is missing"
    );
}
assert_backend_performance_contract(
    strpos($functions, "array('profile' => \$hydration_profile)") !== false &&
        strpos($functions, "implode(' UNION ALL ', \$metric_queries)") !== false &&
        strpos($functions, "['vnseea_post_batch_context']['metrics']") !== false,
    'feed posts must prime raw rows and aggregate viewer/count metrics before Wo_PostData hydration'
);

$post_data_start = strpos($functions, 'function Wo_PostData(');
$post_data_end = strpos($functions, 'function Wo_IsSubscriptionPaidForPublisher(', $post_data_start);
$post_data_source = substr($functions, $post_data_start, $post_data_end - $post_data_start);
assert_backend_performance_contract(
    strpos($post_data_source, "\$is_feed_summary = !empty(\$batch_context['summary_post_ids'][\$story_id])") !== false &&
        strpos($post_data_source, "\$story['get_post_comments'] = array();") !== false,
    'feed_summary must return comment counts without hydrating comment rows'
);
assert_backend_performance_contract(
    strpos($functions, "`post_id` IN ({\$ids_sql}) OR `parent_id` IN ({\$ids_sql})") !== false &&
        strpos($post_data_source, "\$batch_context['album_media'][\$parent_id]") !== false,
    'feed media must be loaded once for all album and multi-image posts'
);
assert_backend_performance_contract(
    strpos($functions, 'COALESCE(v.`option_votes`, 0)') !== false &&
        strpos($functions, 'GROUP BY `option_id`') !== false &&
        strpos($post_data_source, "\$batch_context['poll_options'][\$story_id]") !== false,
    'feed poll options and viewer votes must be aggregated for the whole post batch'
);
assert_backend_performance_contract(
    strpos($functions, 'FROM ' . "' . T_USERS . '" . ' WHERE `user_id` IN (') !== false &&
        strpos($functions, 'FROM ' . "' . T_PAGES . '" . ' WHERE `page_id` IN (') !== false &&
        strpos($functions, "'users' => \$publishers['users']") !== false,
    'feed publishers must be loaded as lightweight user/page batches'
);

$posts_endpoint = file_get_contents($root . '/api/v2/endpoints/posts.php');
assert_backend_performance_contract(
    substr_count($posts_endpoint, "'hydration_profile' => 'feed_summary'") === 5,
    'all five App feed list endpoints must opt into feed_summary hydration'
);

$post_tags = file_get_contents($root . '/assets/includes/vnseea_post_tags.php');
assert_backend_performance_contract(
    strpos($post_tags, 'function VNSEEA_GetPostTaggedUsersBatch(') !== false &&
        strpos($post_tags, "t.`post_id` IN (") !== false,
    'tagged users must be loaded once for the post batch'
);

echo "backend performance contract: ok\n";
