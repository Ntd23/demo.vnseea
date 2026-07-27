<?php

function assert_delete_account_contract($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$root = dirname(__DIR__);
$endpoint = file_get_contents($root . '/api/v2/endpoints/delete-user.php');

assert_delete_account_contract(
    strpos($endpoint, 'Wo_HashPassword') !== false,
    'delete-user must verify the current password before deleting the user'
);

assert_delete_account_contract(
    strpos($endpoint, "'password_required'") !== false &&
        strpos($endpoint, "'password_mismatch'") !== false &&
        strpos($endpoint, "'delete_failed'") !== false,
    'delete-user must return stable non-sensitive error codes'
);

assert_delete_account_contract(
    strpos($endpoint, 'Wo_DeleteUser') > strpos($endpoint, 'Wo_HashPassword'),
    'user deletion must only run after password verification'
);

echo "delete account contract: ok\n";
