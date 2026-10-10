<?php
// English description: Mobile Page Inbox: the Page owner and admins with the Messages permission read and answer customer messages as the Page.
require_once 'assets/includes/vnseea_page_inbox.php';

$response_data = array(
    'api_status' => 400
);

$page_inbox_types = array('my_pages', 'list', 'fetch', 'send', 'read');
$page_inbox_type = !empty($_POST['type']) ? (string) $_POST['type'] : '';

if (!in_array($page_inbox_type, $page_inbox_types, true)) {
    $error_code    = 4;
    $error_message = 'type can not be empty';
} else {
    $page_inbox_viewer_id = (int) $wo['user']['user_id'];
    if (empty($wo['user']['timezone'])) {
        $wo['user']['timezone'] = 'UTC';
    }
    $page_inbox_timezone = new DateTimeZone($wo['user']['timezone']);

    if ($page_inbox_type == 'my_pages') {
        $pages = array();
        foreach (VNSEEA_PageInboxAccessiblePageIds($page_inbox_viewer_id) as $page_id => $role) {
            $page = Wo_PageData($page_id);
            if (empty($page) || empty($page['user_id'])) {
                continue;
            }
            $item = VNSEEA_PageInboxPublicPage($page);
            $item['role'] = $role;
            $item['unread_count'] = array_sum(VNSEEA_PageInboxUnreadCounts($page_id, $page['user_id']));
            $pages[] = $item;
        }
        $response_data = array(
            'api_status' => 200,
            'data' => $pages
        );
    } else {
        $page_id = (!empty($_POST['page_id']) && is_numeric($_POST['page_id'])) ? (int) $_POST['page_id'] : 0;
        $role = VNSEEA_PageInboxRole($page_id, $page_inbox_viewer_id);
        if ($role === '') {
            $error_code    = 5;
            $error_message = 'you can not access this page inbox';
        } else {
            $page = Wo_PageData($page_id);
            $owner_id = (int) $page['user_id'];
            $customer_id = (!empty($_POST['user_id']) && is_numeric($_POST['user_id'])) ? (int) $_POST['user_id'] : 0;
            $limit = (!empty($_POST['limit']) && is_numeric($_POST['limit'])) ? (int) $_POST['limit'] : 20;
            $before_id = (!empty($_POST['before']) && is_numeric($_POST['before'])) ? (int) $_POST['before'] : 0;
            $after_id = (!empty($_POST['after']) && is_numeric($_POST['after'])) ? (int) $_POST['after'] : 0;

            if ($page_inbox_type == 'list') {
                $search = !empty($_POST['search']) ? (string) $_POST['search'] : '';
                $rows = VNSEEA_PageInboxConversations($page_id, $owner_id, $before_id, $limit, $search);
                $customer_ids = array();
                $last_message_ids = array();
                foreach ($rows as $row) {
                    $customer_ids[] = $row['customer_id'];
                    $last_message_ids[] = $row['last_message_id'];
                }
                $unread = VNSEEA_PageInboxUnreadCounts($page_id, $owner_id, $customer_ids);
                $senders = VNSEEA_PageInboxSenders($last_message_ids);
                $conversations = array();
                foreach ($rows as $row) {
                    $customer = VNSEEA_PageInboxPublicUser($row['customer_id']);
                    if (empty($customer)) {
                        continue;
                    }
                    $last_rows = VNSEEA_PageInboxThreadRows($page_id, $owner_id, $row['customer_id'], 0, 0, 1, $row['last_message_id']);
                    $conversations[] = array(
                        'customer' => $customer,
                        'last_message_id' => (string) $row['last_message_id'],
                        'last_message' => !empty($last_rows)
                            ? VNSEEA_PageInboxFormatMessage($last_rows[0], $owner_id, $senders, $page_inbox_timezone)
                            : null,
                        'unread_count' => isset($unread[$row['customer_id']]) ? $unread[$row['customer_id']] : 0
                    );
                }
                $response_data = array(
                    'api_status' => 200,
                    'page' => VNSEEA_PageInboxPublicPage($page),
                    'role' => $role,
                    'data' => $conversations
                );
            } elseif ($customer_id < 1 || $customer_id === $owner_id) {
                $error_code    = 6;
                $error_message = 'user_id can not be empty';
            } elseif ($page_inbox_type == 'fetch') {
                $rows = VNSEEA_PageInboxThreadRows($page_id, $owner_id, $customer_id, $before_id, $after_id, $limit);
                $message_ids = array();
                foreach ($rows as $row) {
                    $message_ids[] = $row['id'];
                }
                $senders = VNSEEA_PageInboxSenders($message_ids);
                $messages = array();
                foreach ($rows as $row) {
                    $messages[] = VNSEEA_PageInboxFormatMessage($row, $owner_id, $senders, $page_inbox_timezone);
                }
                $response_data = array(
                    'api_status' => 200,
                    'customer' => VNSEEA_PageInboxPublicUser($customer_id),
                    'data' => $messages
                );
            } elseif ($page_inbox_type == 'read') {
                VNSEEA_PageInboxMarkRead($page_id, $owner_id, $customer_id);
                $response_data = array(
                    'api_status' => 200
                );
            } elseif ($page_inbox_type == 'send') {
                $has_content = !empty($_POST['text']) || !empty($_FILES['file']['name']) || !empty($_POST['image_url']) || !empty($_POST['gif']) || (!empty($_POST['lng']) && !empty($_POST['lat']));
                $reply_id = (!empty($_POST['reply_id']) && is_numeric($_POST['reply_id'])) ? (int) $_POST['reply_id'] : 0;
                if (!$has_content) {
                    $error_code    = 7;
                    $error_message = 'message can not be empty';
                } elseif (!VNSEEA_PageInboxCustomerHasWritten($page_id, $owner_id, $customer_id)) {
                    // A Page may only answer conversations the customer started.
                    $error_code    = 8;
                    $error_message = 'the page can only reply after the user messages it';
                } elseif ($reply_id > 0 && empty(VNSEEA_PageInboxThreadRows($page_id, $owner_id, $customer_id, 0, 0, 1, $reply_id))) {
                    $error_code    = 9;
                    $error_message = 'reply_id is not part of this conversation';
                } else {
                    $mediaFilename = '';
                    $mediaName     = '';
                    if (isset($_FILES['file']['name'])) {
                        $fileInfo      = array(
                            'file' => $_FILES["file"]["tmp_name"],
                            'name' => $_FILES['file']['name'],
                            'size' => $_FILES["file"]["size"],
                            'type' => $_FILES["file"]["type"]
                        );
                        $media         = Wo_ShareFile($fileInfo);
                        $mediaFilename = $media['filename'];
                        $mediaName     = $_FILES['file']['name'];
                    }
                    if (!empty($_POST['image_url'])) {
                        $fileend = '_url_image';
                        if (!empty($_POST['sticker_id'])) {
                            $fileend = '_' . Wo_Secure($_POST['sticker_id']);
                        }
                        $mediaFilename = Wo_ImportImageFromUrl($_POST['image_url'], $fileend);
                    }
                    $gif = '';
                    if (!empty($_POST['gif']) && strpos($_POST['gif'], '.gif') !== false) {
                        $gif = Wo_Secure($_POST['gif']);
                    }
                    $lng = 0;
                    $lat = 0;
                    if (!empty($_POST['lng']) && !empty($_POST['lat'])) {
                        $lng = Wo_Secure($_POST['lng']);
                        $lat = Wo_Secure($_POST['lat']);
                    }
                    // The Page side of a thread is the owner's user id, so the
                    // reply reaches the customer as the Page on every client.
                    $message_data = array(
                        'from_id' => $owner_id,
                        'page_id' => $page_id,
                        'to_id' => $customer_id,
                        'media' => Wo_Secure($mediaFilename),
                        'mediaFileName' => Wo_Secure($mediaName),
                        'time' => time(),
                        'text' => '',
                        'stickers' => $gif,
                        'lng' => $lng,
                        'lat' => $lat,
                    );
                    if (!empty($_POST['text'])) {
                        $message_data['text'] = Wo_Secure($_POST['text']);
                    }
                    $last_id = Wo_RegisterPageMessage($message_data);
                    if ($last_id && $last_id > 0) {
                        VNSEEA_PageInboxRecordSender($last_id, $page_id, $page_inbox_viewer_id);
                        if ($reply_id > 0) {
                            $db->where('id', $last_id)->update(T_MESSAGES, array('reply_id' => $reply_id));
                        }
                        $rows = VNSEEA_PageInboxThreadRows($page_id, $owner_id, $customer_id, 0, 0, 1, $last_id);
                        $senders = VNSEEA_PageInboxSenders(array($last_id));
                        $messages = array();
                        foreach ($rows as $row) {
                            $messages[] = VNSEEA_PageInboxFormatMessage($row, $owner_id, $senders, $page_inbox_timezone);
                        }
                        $response_data = array(
                            'api_status' => 200,
                            'message_hash_id' => !empty($_POST['message_hash_id']) ? Wo_Secure($_POST['message_hash_id']) : '',
                            'data' => $messages
                        );
                    } else {
                        $error_code    = 10;
                        $error_message = 'something went wrong';
                    }
                }
            }
        }
    }
}
