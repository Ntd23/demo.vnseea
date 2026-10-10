<?php
// English description: Page Inbox rules: who may read and answer a Page's messages as the Page, and the queries behind the mobile inbox.
//
// A Page conversation is still stored the WoWonder way: the Page side of the
// thread is the Page owner's user id (`from_id`/`to_id`) plus `page_id`. Members
// replying as the Page therefore write `from_id = owner`, so every existing
// reader (web, old apps, socket, push) keeps showing the reply as the Page. The
// member who actually sent it is kept in Wo_PageMessageSenders, which only the
// Page Inbox reads, so customers never see it.

if (!defined('T_PAGE_MESSAGE_SENDERS')) {
    define('T_PAGE_MESSAGE_SENDERS', 'Wo_PageMessageSenders');
}

if (!function_exists('VNSEEA_PageInboxSendersTableAvailable')) {
    /**
     * Guards sender writes until the 20261009 migration has run.
     */
    function VNSEEA_PageInboxSendersTableAvailable()
    {
        global $sqlConnect;

        static $available = null;
        if ($available !== null) {
            return $available;
        }
        $available = false;
        if (empty($sqlConnect)) {
            return $available;
        }
        $query = @mysqli_query($sqlConnect, "SHOW TABLES LIKE '" . T_PAGE_MESSAGE_SENDERS . "'");
        $available = $query && mysqli_num_rows($query) > 0;
        return $available;
    }
}

if (!function_exists('VNSEEA_PageInboxPermissionColumnAvailable')) {
    /**
     * Until the migration adds Wo_PageAdmins.messages only the owner has access.
     */
    function VNSEEA_PageInboxPermissionColumnAvailable()
    {
        global $sqlConnect;

        static $available = null;
        if ($available !== null) {
            return $available;
        }
        $available = false;
        if (!defined('T_PAGE_ADMINS') || empty($sqlConnect)) {
            return $available;
        }
        $query = @mysqli_query($sqlConnect, 'SHOW COLUMNS FROM ' . T_PAGE_ADMINS . " LIKE 'messages'");
        $available = $query && mysqli_num_rows($query) > 0;
        return $available;
    }
}

if (!function_exists('VNSEEA_PageInboxRole')) {
    /**
     * Returns 'owner', 'admin' (an admin with the Messages permission) or ''.
     * Site admins and moderators get no bypass: Page messages are private to
     * the Page's own team.
     */
    function VNSEEA_PageInboxRole($page_id, $user_id)
    {
        global $sqlConnect;

        $page_id = (int) $page_id;
        $user_id = (int) $user_id;
        if ($page_id < 1 || $user_id < 1) {
            return '';
        }
        $page = Wo_PageData($page_id);
        if (empty($page) || empty($page['user_id'])) {
            return '';
        }
        if ((int) $page['user_id'] === $user_id) {
            return 'owner';
        }
        if (!VNSEEA_PageInboxPermissionColumnAvailable()) {
            return '';
        }
        $query = mysqli_query(
            $sqlConnect,
            'SELECT COUNT(*) AS `count` FROM ' . T_PAGE_ADMINS .
            " WHERE `page_id` = {$page_id} AND `user_id` = {$user_id} AND `messages` = 1"
        );
        $row = $query ? mysqli_fetch_assoc($query) : null;
        return !empty($row['count']) ? 'admin' : '';
    }
}

if (!function_exists('VNSEEA_PageInboxCanAccess')) {
    function VNSEEA_PageInboxCanAccess($page_id, $user_id)
    {
        return VNSEEA_PageInboxRole($page_id, $user_id) !== '';
    }
}

if (!function_exists('VNSEEA_PageInboxMemberIds')) {
    /**
     * Everyone who answers for the Page: the owner and admins with Messages.
     */
    function VNSEEA_PageInboxMemberIds($page_id)
    {
        global $sqlConnect;

        $page_id = (int) $page_id;
        $page = $page_id > 0 ? Wo_PageData($page_id) : false;
        if (empty($page) || empty($page['user_id'])) {
            return array();
        }
        $member_ids = array((int) $page['user_id'] => true);
        if (VNSEEA_PageInboxPermissionColumnAvailable()) {
            $query = mysqli_query(
                $sqlConnect,
                'SELECT `user_id` FROM ' . T_PAGE_ADMINS .
                " WHERE `page_id` = {$page_id} AND `messages` = 1"
            );
            if ($query) {
                while ($row = mysqli_fetch_assoc($query)) {
                    $member_ids[(int) $row['user_id']] = true;
                }
            }
        }
        return array_keys($member_ids);
    }
}

if (!function_exists('VNSEEA_PageInboxPushRecipients')) {
    /**
     * A customer's message is addressed to the owner (`to_id`); the other
     * members with Messages must hear about it too. Replies from the Page side
     * only go to the customer, as before.
     */
    function VNSEEA_PageInboxPushRecipients($message)
    {
        $page_id = !empty($message['page_id']) ? (int) $message['page_id'] : 0;
        if ($page_id < 1 || !empty($message['group_id'])) {
            return array();
        }
        $page = Wo_PageData($page_id);
        if (empty($page['user_id']) || (int) $message['to_id'] !== (int) $page['user_id']) {
            return array();
        }
        $sender_id = (int) $message['from_id'];
        $recipient_ids = array();
        foreach (VNSEEA_PageInboxMemberIds($page_id) as $member_id) {
            if ($member_id !== $sender_id) {
                $recipient_ids[] = $member_id;
            }
        }
        return $recipient_ids;
    }
}

if (!function_exists('VNSEEA_PageInboxAccessiblePageIds')) {
    /**
     * Pages whose inbox the user may open: pages they own, then pages where
     * they are an admin with the Messages permission.
     */
    function VNSEEA_PageInboxAccessiblePageIds($user_id)
    {
        global $sqlConnect;

        $user_id = (int) $user_id;
        if ($user_id < 1) {
            return array();
        }
        $page_ids = array();
        $owned = mysqli_query(
            $sqlConnect,
            'SELECT `page_id` FROM ' . T_PAGES . " WHERE `user_id` = {$user_id} ORDER BY `page_id` DESC"
        );
        if ($owned) {
            while ($row = mysqli_fetch_assoc($owned)) {
                $page_ids[(int) $row['page_id']] = 'owner';
            }
        }
        if (VNSEEA_PageInboxPermissionColumnAvailable()) {
            $admin = mysqli_query(
                $sqlConnect,
                'SELECT `page_id` FROM ' . T_PAGE_ADMINS .
                " WHERE `user_id` = {$user_id} AND `messages` = 1 ORDER BY `page_id` DESC"
            );
            if ($admin) {
                while ($row = mysqli_fetch_assoc($admin)) {
                    $page_id = (int) $row['page_id'];
                    if (!isset($page_ids[$page_id])) {
                        $page_ids[$page_id] = 'admin';
                    }
                }
            }
        }
        return $page_ids;
    }
}

if (!function_exists('VNSEEA_PageInboxUnreadCounts')) {
    /**
     * Unread customer messages per customer for one Page (keyed by user id).
     */
    function VNSEEA_PageInboxUnreadCounts($page_id, $owner_id, $customer_ids = null)
    {
        global $sqlConnect;

        $page_id = (int) $page_id;
        $owner_id = (int) $owner_id;
        $filter = '';
        if (is_array($customer_ids)) {
            $customer_ids = array_values(array_filter(array_map('intval', $customer_ids)));
            if (empty($customer_ids)) {
                return array();
            }
            $filter = ' AND `from_id` IN (' . implode(',', $customer_ids) . ')';
        }
        $counts = array();
        $query = mysqli_query(
            $sqlConnect,
            'SELECT `from_id`, COUNT(*) AS `count` FROM ' . T_MESSAGES .
            " WHERE `page_id` = {$page_id} AND `to_id` = {$owner_id} AND `from_id` <> {$owner_id}" .
            " AND `seen` = 0{$filter} GROUP BY `from_id`"
        );
        if ($query) {
            while ($row = mysqli_fetch_assoc($query)) {
                $counts[(int) $row['from_id']] = (int) $row['count'];
            }
        }
        return $counts;
    }
}

if (!function_exists('VNSEEA_PageInboxConversations')) {
    /**
     * One row per customer, newest first. `$before_id` is the `last_message_id`
     * of the last row already shown, for pagination.
     */
    function VNSEEA_PageInboxConversations($page_id, $owner_id, $before_id = 0, $limit = 20, $search = '')
    {
        global $sqlConnect;

        $page_id = (int) $page_id;
        $owner_id = (int) $owner_id;
        $before_id = (int) $before_id;
        $limit = max(1, min(50, (int) $limit));
        $customer_expr = "IF(`from_id` = {$owner_id}, `to_id`, `from_id`)";
        $search_filter = '';
        $search = trim((string) $search);
        if ($search !== '') {
            $like = Wo_Secure('%' . $search . '%');
            $search_filter = " AND {$customer_expr} IN (SELECT `user_id` FROM " . T_USERS .
                " WHERE `username` LIKE '{$like}' OR `first_name` LIKE '{$like}' OR `last_name` LIKE '{$like}'" .
                " OR CONCAT(`first_name`, ' ', `last_name`) LIKE '{$like}')";
        }
        $having = $before_id > 0 ? " HAVING `last_message_id` < {$before_id}" : '';
        $query = mysqli_query(
            $sqlConnect,
            "SELECT {$customer_expr} AS `customer_id`, MAX(`id`) AS `last_message_id` FROM " . T_MESSAGES .
            " WHERE `page_id` = {$page_id} AND (`from_id` = {$owner_id} OR `to_id` = {$owner_id})" .
            " AND `from_id` <> `to_id`{$search_filter}" .
            " GROUP BY `customer_id`{$having} ORDER BY `last_message_id` DESC LIMIT {$limit}"
        );
        $rows = array();
        if ($query) {
            while ($row = mysqli_fetch_assoc($query)) {
                if ((int) $row['customer_id'] > 0) {
                    $rows[] = array(
                        'customer_id' => (int) $row['customer_id'],
                        'last_message_id' => (int) $row['last_message_id']
                    );
                }
            }
        }
        return $rows;
    }
}

if (!function_exists('VNSEEA_PageInboxCustomerHasWritten')) {
    /**
     * The Page may only answer conversations the customer started.
     */
    function VNSEEA_PageInboxCustomerHasWritten($page_id, $owner_id, $customer_id)
    {
        global $sqlConnect;

        $page_id = (int) $page_id;
        $owner_id = (int) $owner_id;
        $customer_id = (int) $customer_id;
        if ($page_id < 1 || $owner_id < 1 || $customer_id < 1 || $owner_id === $customer_id) {
            return false;
        }
        $query = mysqli_query(
            $sqlConnect,
            'SELECT `id` FROM ' . T_MESSAGES .
            " WHERE `page_id` = {$page_id} AND `from_id` = {$customer_id} AND `to_id` = {$owner_id} LIMIT 1"
        );
        return $query && mysqli_num_rows($query) > 0;
    }
}

if (!function_exists('VNSEEA_PageInboxThreadRows')) {
    /**
     * Raw rows of one Page conversation, newest first (same order as
     * page_chat `fetch`). Pass `$message_id` to load a single message.
     */
    function VNSEEA_PageInboxThreadRows($page_id, $owner_id, $customer_id, $before_id = 0, $after_id = 0, $limit = 20, $message_id = 0)
    {
        global $sqlConnect;

        $page_id = (int) $page_id;
        $owner_id = (int) $owner_id;
        $customer_id = (int) $customer_id;
        $limit = max(1, min(50, (int) $limit));
        $filters = '';
        if ((int) $message_id > 0) {
            $filters .= ' AND `id` = ' . (int) $message_id;
        }
        if ((int) $before_id > 0) {
            $filters .= ' AND `id` < ' . (int) $before_id;
        } elseif ((int) $after_id > 0) {
            $filters .= ' AND `id` > ' . (int) $after_id;
        }
        $query = mysqli_query(
            $sqlConnect,
            'SELECT * FROM ' . T_MESSAGES .
            " WHERE `page_id` = {$page_id}" .
            " AND ((`from_id` = {$owner_id} AND `to_id` = {$customer_id}) OR (`from_id` = {$customer_id} AND `to_id` = {$owner_id}))" .
            "{$filters} ORDER BY `id` DESC LIMIT {$limit}"
        );
        $rows = array();
        if ($query) {
            while ($row = mysqli_fetch_assoc($query)) {
                $rows[] = $row;
            }
        }
        return $rows;
    }
}

if (!function_exists('VNSEEA_PageInboxSenders')) {
    /**
     * Members who sent the given Page-side messages, keyed by message id.
     */
    function VNSEEA_PageInboxSenders($message_ids)
    {
        global $sqlConnect;

        $message_ids = array_values(array_filter(array_map('intval', (array) $message_ids)));
        if (empty($message_ids) || !VNSEEA_PageInboxSendersTableAvailable()) {
            return array();
        }
        $senders = array();
        $query = mysqli_query(
            $sqlConnect,
            'SELECT `message_id`, `sent_by_user_id` FROM ' . T_PAGE_MESSAGE_SENDERS .
            ' WHERE `message_id` IN (' . implode(',', $message_ids) . ')'
        );
        if ($query) {
            while ($row = mysqli_fetch_assoc($query)) {
                $senders[(int) $row['message_id']] = (int) $row['sent_by_user_id'];
            }
        }
        return $senders;
    }
}

if (!function_exists('VNSEEA_PageInboxRecordSender')) {
    function VNSEEA_PageInboxRecordSender($message_id, $page_id, $user_id)
    {
        global $sqlConnect;

        $message_id = (int) $message_id;
        $page_id = (int) $page_id;
        $user_id = (int) $user_id;
        if ($message_id < 1 || $page_id < 1 || $user_id < 1 || !VNSEEA_PageInboxSendersTableAvailable()) {
            return false;
        }
        $time = time();
        return (bool) mysqli_query(
            $sqlConnect,
            'INSERT INTO ' . T_PAGE_MESSAGE_SENDERS .
            ' (`message_id`, `page_id`, `sent_by_user_id`, `created_at`)' .
            " VALUES ({$message_id}, {$page_id}, {$user_id}, {$time})" .
            ' ON DUPLICATE KEY UPDATE `sent_by_user_id` = VALUES(`sent_by_user_id`)'
        );
    }
}

if (!function_exists('VNSEEA_PageInboxMarkRead')) {
    function VNSEEA_PageInboxMarkRead($page_id, $owner_id, $customer_id)
    {
        global $sqlConnect;

        $page_id = (int) $page_id;
        $owner_id = (int) $owner_id;
        $customer_id = (int) $customer_id;
        if ($page_id < 1 || $owner_id < 1 || $customer_id < 1) {
            return false;
        }
        $time = time();
        return (bool) mysqli_query(
            $sqlConnect,
            'UPDATE ' . T_MESSAGES . " SET `seen` = {$time}" .
            " WHERE `page_id` = {$page_id} AND `from_id` = {$customer_id} AND `to_id` = {$owner_id} AND `seen` = 0"
        );
    }
}

if (!function_exists('VNSEEA_PageInboxPublicUser')) {
    /**
     * The few user fields the inbox shows; never the full WoWonder user row.
     */
    function VNSEEA_PageInboxPublicUser($user_id)
    {
        $user = (int) $user_id > 0 ? Wo_UserData((int) $user_id) : false;
        if (empty($user)) {
            return null;
        }
        return array(
            'user_id' => (string) $user['user_id'],
            'username' => isset($user['username']) ? $user['username'] : '',
            'name' => isset($user['name']) ? $user['name'] : '',
            'avatar' => isset($user['avatar']) ? $user['avatar'] : ''
        );
    }
}

if (!function_exists('VNSEEA_PageInboxPublicPage')) {
    function VNSEEA_PageInboxPublicPage($page)
    {
        return array(
            'page_id' => (string) $page['page_id'],
            'page_name' => isset($page['page_name']) ? $page['page_name'] : '',
            'page_title' => isset($page['page_title']) ? $page['page_title'] : '',
            'avatar' => isset($page['avatar']) ? $page['avatar'] : '',
            'url' => isset($page['url']) ? $page['url'] : ''
        );
    }
}

if (!function_exists('VNSEEA_PageInboxFormatMessage')) {
    /**
     * Hydrates a raw Wo_Messages row in the same shape page_chat `fetch`
     * returns, so the app reuses its message mapper. Page-side messages sit on
     * the right for every Page member and carry `sent_by`.
     */
    function VNSEEA_PageInboxFormatMessage($row, $owner_id, $senders, $timezone)
    {
        $owner_id = (int) $owner_id;
        $message = $row;
        $is_page_side = (int) $message['from_id'] === $owner_id;
        $message['user_data'] = VNSEEA_PageInboxPublicUser($message['from_id']);
        $message['text'] = Wo_Emo(Wo_Markup($message['text']));
        $message['reply'] = !empty($message['reply_id']) ? GetMessageById($message['reply_id']) : array();
        $message['reaction'] = VNSEEA_GetMessageReactionSummary($message['id']);
        $message['pin'] = VNSEEA_GetMessagePinFlag($message['id']);
        $message['fav'] = 'no';
        $message = VNSEEA_AttachCanonicalMessageContext($message);

        $message['is_page_side'] = $is_page_side ? 1 : 0;
        $message['onwer'] = $is_page_side ? 1 : 0;
        $message['sent_by'] = null;
        if ($is_page_side) {
            $sender_id = isset($senders[(int) $message['id']]) ? $senders[(int) $message['id']] : $owner_id;
            $message['sent_by'] = VNSEEA_PageInboxPublicUser($sender_id);
        }

        $message['text'] = openssl_encrypt($message['text'], 'AES-128-ECB', $message['time']);
        $position = $is_page_side ? 'right' : 'left';
        $message['position'] = $position;
        $message['type'] = Wo_GetFilePosition($message['media']);
        if ($message['type_two'] == 'contact') {
            $message['type'] = 'contact';
        }
        if (!empty($message['lng']) && !empty($message['lat'])) {
            $message['type'] = 'map';
        }
        $message['type'] = $position . '_' . $message['type'];
        $message['file_size'] = 0;
        if (!empty($message['media'])) {
            $message['file_size'] = '0MB';
            $message['media'] = Wo_GetMedia($message['media']);
        }
        $message['time_text'] = VNSEEA_PageInboxTimeText($message['time'], $timezone);

        if (!empty($message['reply']) && is_array($message['reply'])) {
            $reply = $message['reply'];
            $reply_position = (int) $reply['from_id'] === $owner_id ? 'right' : 'left';
            // The app names the quoted sender from messageUser; keep only public fields.
            $reply['messageUser'] = VNSEEA_PageInboxPublicUser($reply['from_id']);
            if (empty($reply['stickers'])) {
                $reply['stickers'] = '';
            }
            $reply['position'] = $reply_position;
            $reply['type'] = Wo_GetFilePosition($reply['media']);
            if (!empty($reply['stickers']) && strpos($reply['stickers'], '.gif') !== false) {
                $reply['type'] = 'gif';
            }
            if ($reply['type_two'] == 'contact') {
                $reply['type'] = 'contact';
            }
            $reply['type'] = $reply_position . '_' . $reply['type'];
            $reply['product'] = null;
            if (!empty($reply['product_id'])) {
                $reply['type'] = $reply_position . '_product';
                $reply['product'] = Wo_GetProduct($reply['product_id']);
            }
            $reply['file_size'] = 0;
            if (!empty($reply['media'])) {
                $reply['file_size'] = '0MB';
                $reply['media'] = Wo_GetMedia($reply['media']);
            }
            $reply['time_text'] = VNSEEA_PageInboxTimeText($reply['time'], $timezone);
            $message['reply'] = $reply;
        }
        return $message;
    }
}

if (!function_exists('VNSEEA_PageInboxTimeText')) {
    function VNSEEA_PageInboxTimeText($timestamp, $timezone)
    {
        $timestamp = (int) $timestamp;
        if ($timestamp < 1) {
            return '';
        }
        if ($timestamp < time() - 86400) {
            return date('m.d.y', $timestamp);
        }
        $time = new DateTime('now', $timezone);
        $time->setTimestamp($timestamp);
        return $time->format('H:i');
    }
}
