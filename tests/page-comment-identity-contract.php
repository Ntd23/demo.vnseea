<?php

$root = dirname(__DIR__);

function page_comment_identity_assert($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$functions_one = file_get_contents($root . '/assets/includes/functions_one.php');
$functions_two = file_get_contents($root . '/assets/includes/functions_two.php');
$comments = file_get_contents($root . '/api/v2/endpoints/comments.php');
$push = file_get_contents($root . '/assets/includes/vnseea_push_delivery.php');

page_comment_identity_assert(
    strpos($functions_one, "'page_id' => \$page_id,\n            'post_id' => \$data['post_id']") !== false,
    'Page comments must persist the acting Page on their notification'
);
page_comment_identity_assert(
    strpos($functions_two, 'if (!empty($page_id)) {\n        $user_id = "";') === false,
    'Page replies must not clear the notification recipient'
);
page_comment_identity_assert(
    strpos($functions_two, '"page_id" => $page_id') !== false,
    'Page reply notifications must preserve the acting Page'
);
page_comment_identity_assert(
    strpos($comments, 'Wo_AddCommentReactions($comment_id, $reaction, $actor_page_id)') !== false,
    'comment reactions must pass the explicit Page actor'
);
page_comment_identity_assert(
    strpos($comments, "Wo_AddReplayReactions(\$wo['user']['id'],\$reply_id, \$reaction, \$actor_page_id)") !== false,
    'reply reactions must pass the explicit Page actor'
);
page_comment_identity_assert(
    strpos($push, "empty(\$notification['notifier_id']) && !empty(\$notification['page_id'])") !== false,
    'push title and avatar must resolve the Page actor'
);
page_comment_identity_assert(
    strpos($functions_one, '$is_reply_owner || Wo_IsPostOnwer($post_id, $logged_user_id) === true') !== false,
    'Page owners and admins must be allowed to delete replies on Page posts'
);
page_comment_identity_assert(
    strpos($functions_two, '$fetched_data["post_onwer"] = Wo_IsPostOnwer($post["id"], $wo["user"]["user_id"])') !== false,
    'reply payloads must expose Page moderation permission to the App'
);

fwrite(STDOUT, "page comment identity contract: ok\n");
