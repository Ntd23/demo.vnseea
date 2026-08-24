<?php

$root = dirname(__DIR__);
$screen = file_get_contents($root . '/admin-panel/pages/send_email/content.phtml');
$endpoint = file_get_contents($root . '/xhr/admin_setting.php');

function assert_admin_bulk_mail_guard($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

assert_admin_bulk_mail_guard(
    strpos($screen, 'id="selected_emails"') !== false,
    'Selected recipient IDs must be submitted through a dedicated hidden input'
);

assert_admin_bulk_mail_guard(
    strpos($screen, 'id="bulk_mail_confirmed"') !== false &&
        strpos($screen, 'beforeSubmit:') !== false,
    'Bulk sends must require an explicit client-side confirmation'
);

assert_admin_bulk_mail_guard(
    strpos($screen, '<option value="" selected>') !== false,
    'The bulk audience selector must not default to all users'
);

assert_admin_bulk_mail_guard(
    strpos($endpoint, "\$_POST['bulk_mail_confirmed']") !== false,
    'The backend must reject unconfirmed bulk sends'
);

assert_admin_bulk_mail_guard(
    strpos($endpoint, 'array_unique(array_filter(array_map') !== false,
    'Selected recipient IDs must be normalized and deduplicated server-side'
);

echo "admin bulk mail guard contract passed\n";
