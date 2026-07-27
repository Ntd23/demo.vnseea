<?php

function assert_group_membership_contract($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$root = dirname(__DIR__);
$detail = file_get_contents($root . '/api/v2/endpoints/get-group-data.php');
$join = file_get_contents($root . '/api/v2/endpoints/join-group.php');

assert_group_membership_contract(
    strpos($detail, "'membership_status'") !== false &&
        strpos($detail, "Wo_IsJoinRequested") !== false,
    'group detail must return an explicit joined/requested/not_joined status'
);

assert_group_membership_contract(
    strpos($join, "\$_POST['action']") !== false &&
        strpos($join, "'membership_status'") !== false,
    'new clients must use an explicit idempotent join action'
);

assert_group_membership_contract(
    strpos($join, "\$join_action === 'join'") !== false &&
        strpos($join, "\$join_action === 'toggle'") !== false,
    'legacy toggle behavior must remain available while App join is idempotent'
);

echo "group membership contract: ok\n";
