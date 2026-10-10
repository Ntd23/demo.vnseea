<?php
// English description: Verifies Page Inbox access rules, Page-identity replies and that the replying member never leaks to customers.

$root = dirname(__DIR__);

function page_inbox_assert($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

// Minimal WoWonder stand-ins: page 7 is owned by user 100.
function Wo_PageData($page_id)
{
    return (int) $page_id === 7
        ? array('page_id' => 7, 'user_id' => 100, 'page_name' => 'shop', 'page_title' => 'Shop', 'avatar' => 'a.jpg', 'url' => 'u')
        : false;
}

require_once $root . '/assets/includes/vnseea_page_inbox.php';

// Behaviour without a database (before the migration has run).
page_inbox_assert(VNSEEA_PageInboxPermissionColumnAvailable() === false, 'without the migration admins must not get inbox access');
page_inbox_assert(VNSEEA_PageInboxSendersTableAvailable() === false, 'without the migration the senders table must be treated as missing');
page_inbox_assert(VNSEEA_PageInboxRole(7, 100) === 'owner', 'the Page owner must always reach the inbox');
page_inbox_assert(VNSEEA_PageInboxRole(7, 200) === '', 'other users must not reach the inbox');
page_inbox_assert(VNSEEA_PageInboxRole(8, 100) === '', 'unknown Pages must not grant access');
page_inbox_assert(VNSEEA_PageInboxRole(0, 0) === '', 'invalid ids must not grant access');
page_inbox_assert(VNSEEA_PageInboxMemberIds(7) === array(100), 'the owner is always a Page Inbox member');
page_inbox_assert(VNSEEA_PageInboxRecordSender(1, 7, 100) === false, 'sender writes must be skipped before the migration');
page_inbox_assert(VNSEEA_PageInboxSenders(array(1, 2)) === array(), 'sender reads must be empty before the migration');
page_inbox_assert(VNSEEA_PageInboxCustomerHasWritten(7, 100, 100) === false, 'the owner cannot be their own customer');

page_inbox_assert(
    VNSEEA_PageInboxPushRecipients(array('page_id' => 7, 'from_id' => 300, 'to_id' => 100)) === array(100),
    'a customer message to the Page must notify the Page members'
);
page_inbox_assert(
    VNSEEA_PageInboxPushRecipients(array('page_id' => 7, 'from_id' => 100, 'to_id' => 300)) === array(),
    'a Page-side reply must only notify the customer'
);
page_inbox_assert(
    VNSEEA_PageInboxPushRecipients(array('page_id' => 0, 'from_id' => 300, 'to_id' => 100)) === array(),
    'direct messages must not fan out to Page members'
);

// Source contracts.
$include = file_get_contents($root . '/assets/includes/vnseea_page_inbox.php');
$endpoint = file_get_contents($root . '/api/v2/endpoints/page_inbox.php');
$page_chat = file_get_contents($root . '/api/v2/endpoints/page_chat.php');
$privileges = file_get_contents($root . '/api/v2/endpoints/update_privileges.php');
$push = file_get_contents($root . '/assets/includes/vnseea_push_delivery.php');
$migration = file_get_contents($root . '/database/migrations/20261009_page_inbox.sql');

$role_start = strpos($include, 'function VNSEEA_PageInboxRole');
$role_body = substr($include, $role_start, strpos($include, 'function VNSEEA_PageInboxCanAccess') - $role_start);
page_inbox_assert(
    strpos($role_body, 'Wo_IsAdmin') === false && strpos($role_body, 'Wo_IsModerator') === false,
    'site admins and moderators must not bypass Page Inbox access'
);
page_inbox_assert(
    strpos($endpoint, "'from_id' => \$owner_id") !== false,
    'replies must be stored as the Page side (the owner id) so every client shows the Page'
);
page_inbox_assert(
    strpos($endpoint, 'VNSEEA_PageInboxRecordSender($last_id, $page_id, $page_inbox_viewer_id)') !== false,
    'the member who replied must be recorded for the team'
);
page_inbox_assert(
    strpos($endpoint, 'VNSEEA_PageInboxCustomerHasWritten($page_id, $owner_id, $customer_id)') !== false,
    'the Page must not start conversations'
);
page_inbox_assert(
    strpos($endpoint, 'VNSEEA_PageInboxRole($page_id, $page_inbox_viewer_id)') !== false,
    'every Page-scoped action must check inbox access'
);
page_inbox_assert(
    strpos($page_chat, 'sent_by') === false && strpos($page_chat, 'PageMessageSenders') === false,
    'customer-facing page_chat must never expose the replying member'
);
page_inbox_assert(
    strpos($migration, 'ALTER TABLE `Wo_Messages`') === false,
    'the replying member must live outside Wo_Messages so SELECT * reads cannot leak it'
);
page_inbox_assert(
    strpos($migration, "ADD COLUMN `messages` TINYINT(1) NOT NULL DEFAULT 0") !== false,
    'existing admins must not get the Messages permission automatically'
);
page_inbox_assert(
    strpos($privileges, "isset(\$_POST['messages'])") !== false,
    'clients that do not send the Messages permission must not reset it'
);
page_inbox_assert(
    strpos($push, 'VNSEEA_PageInboxPushRecipients($message)') !== false,
    'Page messages must notify admins with the Messages permission'
);
page_inbox_assert(
    strpos($push, '$sender_name = $page_title;') !== false,
    'Page-side replies must be announced as the Page'
);

echo "page inbox contract passed\n";
