<?php

$root = dirname(__DIR__);

function story_reply_bonus_assert($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

function story_reply_bonus_source($root, $path)
{
    $source = @file_get_contents($root . '/' . $path);
    story_reply_bonus_assert(is_string($source), "Unable to read {$path}");
    return $source;
}

$send_message = story_reply_bonus_source($root, 'api/v2/endpoints/send-message.php');
$functions = story_reply_bonus_source($root, 'assets/includes/functions_one.php');
$create_account = story_reply_bonus_source($root, 'api/v2/endpoints/create-account.php');
$wallet_overview = story_reply_bonus_source($root, 'api/v2/endpoints/wallet-overview.php');

story_reply_bonus_assert(
    strpos($send_message, 'VNSEEA_ValidateStoryReply') !== false,
    'send-message must validate Story ownership, expiry and viewer access before insert'
);
story_reply_bonus_assert(
    strpos($send_message, "\$message_data['story_id'] = \$story_reply['story_id'];") !== false &&
    strpos($send_message, "\$message_data['story_id'] = \$story_reply['story_id'];") < strpos($send_message, 'Wo_RegisterMessage($message_data)'),
    'story_id must be part of the initial message insert'
);
story_reply_bonus_assert(
    strpos($send_message, "\$message_data['type_two'] = 'story_reply';") !== false,
    'Story replies must use the canonical message type'
);
story_reply_bonus_assert(
    strpos($send_message, "update(T_MESSAGES,array('story_id'") === false,
    'send-message must not attach story_id after realtime publication'
);
story_reply_bonus_assert(
    strpos($functions, 'function VNSEEA_ValidateStoryReply') !== false &&
    strpos($functions, "['expire']") !== false &&
    strpos($functions, 'VNSEEA_CanViewStory') !== false &&
    strpos($functions, 'VNSEEA_CanViewSharedPostStory') !== false,
    'central Story reply validation must enforce expiry and privacy'
);
story_reply_bonus_assert(
    strpos($functions, 'story_available') !== false,
    'message mapping must expose whether the referenced Story remains available'
);

story_reply_bonus_assert(
    strpos($create_account, "'signup_points_bonus' => 500000") !== false,
    'API v2 registration must request the fixed 500,000 VNSEEA bonus'
);
story_reply_bonus_assert(
    strpos($functions, 'function Wo_RegisterUser($registration_data, $invited = false, $options = array())') !== false,
    'Wo_RegisterUser must accept internal registration options without changing legacy callers'
);
story_reply_bonus_assert(
    strpos($functions, "'POINTS_EARNED'") !== false &&
    strpos($functions, "'signup_bonus'") !== false,
    'signup bonus must create a visible points history entry'
);
story_reply_bonus_assert(
    strpos($functions, 'mysqli_begin_transaction') !== false &&
    strpos($functions, 'mysqli_commit') !== false &&
    strpos($functions, 'mysqli_rollback') !== false,
    'bonus registration must be transactional'
);

$register_start = strpos($functions, 'function Wo_RegisterUser(');
$register_end = strpos($functions, 'function Wo_ActivateUser(', $register_start);
$register_source = substr($functions, $register_start, $register_end - $register_start);
story_reply_bonus_assert(strpos($register_source, '`points` = `points` +') !== false, 'registration must credit users.points');
story_reply_bonus_assert(strpos($register_source, '`wallet`') === false, 'registration bonus must not modify wallet');
story_reply_bonus_assert(strpos($register_source, '`balance`') === false, 'registration bonus must not modify balance');
story_reply_bonus_assert(strpos($register_source, '`daily_points`') === false, 'registration bonus must not modify daily_points');
story_reply_bonus_assert(strpos($register_source, '`converted_points`') === false, 'registration bonus must not modify converted_points');
story_reply_bonus_assert(
    strpos($wallet_overview, "'signup_bonus'") !== false,
    'wallet overview must preserve the canonical signup bonus type'
);

echo "story reply and signup bonus contract: OK\n";
