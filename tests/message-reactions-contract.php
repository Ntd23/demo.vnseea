<?php

function assert_message_reaction_contract($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$root = dirname(__DIR__);
$functions_one = file_get_contents($root . '/assets/includes/functions_one.php');
$functions_three = file_get_contents($root . '/assets/includes/functions_three.php');
$exceptions = file_get_contents($root . '/api/v2/endpoints/Exceptions/exceptions.php');
$endpoint = file_get_contents($root . '/api/v2/endpoints/react_message.php');
$group_chat = file_get_contents($root . '/api/v2/endpoints/group_chat.php');

assert_message_reaction_contract(
    strpos($functions_one, 'function VNSEEA_GetMessageReactionSummary') !== false,
    'canonical message reaction summary helper is missing'
);
assert_message_reaction_contract(
    strpos($functions_one, 'COUNT(*) AS reaction_count') !== false,
    'message reaction helper must count every reaction type'
);
assert_message_reaction_contract(
    strpos($exceptions, 'function VNSEEA_CanReactToMessage') !== false,
    'message participant authorization helper is missing'
);
assert_message_reaction_contract(
    strpos($endpoint, 'VNSEEA_CanReactToMessage') !== false,
    'reaction endpoint does not authorize access to the message'
);
assert_message_reaction_contract(
    strpos($endpoint, "\$action === 'remove'") !== false,
    'reaction endpoint does not support explicit removal'
);
assert_message_reaction_contract(
    strpos($endpoint, 'VNSEEA_GetMessageReactionSummary($message_id)') !== false,
    'reaction endpoint does not return the canonical snapshot'
);
assert_message_reaction_contract(
    strpos($endpoint, 'startTransaction()') !== false &&
        strpos($endpoint, 'rollback()') !== false,
    'swapping a reaction must be atomic'
);
assert_message_reaction_contract(
    strpos($functions_one, "VNSEEA_GetMessageReactionSummary(\$fetched_data['id'])") !== false,
    'one-to-one/page message readers do not use the canonical snapshot'
);
assert_message_reaction_contract(
    strpos($functions_three, "VNSEEA_GetMessageReactionSummary(\$fetched_data['id'])") !== false ||
        strpos($group_chat, "VNSEEA_GetMessageReactionSummary(\$message['id'])") !== false,
    'group message readers do not use the canonical snapshot'
);

echo "message reactions contract: ok\n";
