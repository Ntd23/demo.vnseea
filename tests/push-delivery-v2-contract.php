<?php

$root = dirname(__DIR__);

function push_v2_source($root, $path)
{
    $full_path = $root . '/' . $path;
    return file_exists($full_path) ? file_get_contents($full_path) : '';
}

function assert_push_v2_contract($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$migration = push_v2_source($root, 'database/migrations/20260729_push_delivery_v2.sql');
$tables = push_v2_source($root, 'assets/includes/tabels.php');
$service = push_v2_source($root, 'assets/includes/vnseea_push_delivery.php');
$legacy_service = push_v2_source($root, 'assets/includes/onesignal_config.php');
$endpoint = push_v2_source($root, 'api/v2/endpoints/push-devices.php');
$router = push_v2_source($root, 'api-v2.php');
$logout = push_v2_source($root, 'api/v2/endpoints/delete-access-token.php');
$delete_user = push_v2_source($root, 'api/v2/endpoints/delete-user.php');
$get_messages = push_v2_source($root, 'api/v2/endpoints/get_user_messages.php');
$group_messages = push_v2_source($root, 'api/v2/endpoints/group_chat.php');
$mute = push_v2_source($root, 'api/v2/endpoints/mute.php');
$cron = push_v2_source($root, 'cron-job.php');
$message_runtime = push_v2_source($root, 'assets/includes/functions_one.php');
$legacy_push_runtime = push_v2_source($root, 'assets/includes/functions_three.php');

foreach (array(
    'Wo_PushInstallations',
    'Wo_PushTokens',
    'Wo_PushDeliveries',
) as $table_name) {
    assert_push_v2_contract(
        strpos($migration, "CREATE TABLE IF NOT EXISTS `{$table_name}`") !== false,
        "{$table_name} migration is missing"
    );
}

assert_push_v2_contract(
    strpos($migration, 'UNIQUE KEY `installation_provider` (`installation_id`, `provider`)') !== false,
    'installation/provider must be unique'
);
assert_push_v2_contract(
    strpos($migration, 'UNIQUE KEY `provider_token` (`provider`, `token_hash`)') !== false,
    'provider token ownership must be unique'
);
assert_push_v2_contract(
    strpos($migration, 'UNIQUE KEY `user_type_chat` (`push_mute_user_id`, `push_mute_type`, `push_mute_chat_id`)') !== false &&
        strpos($migration, 'GENERATED ALWAYS AS') !== false &&
        substr_count($migration, 'IFNULL(') >= 5 &&
        strpos($migration, 'SET `message_id` = 0') !== false,
    'conversation mute rows must be unique without collapsing message favorites'
);
assert_push_v2_contract(
    strpos($migration, '`idempotency_key` CHAR(36)') !== false &&
        strpos($migration, "`platform` ENUM('ios','android')") !== false,
    'each delivery must persist its provider idempotency key and platform'
);

foreach (array(
    'T_PUSH_INSTALLATIONS',
    'T_PUSH_TOKENS',
    'T_PUSH_DELIVERIES',
) as $constant) {
    assert_push_v2_contract(
        strpos($tables, "define('{$constant}'") !== false,
        "{$constant} is missing"
    );
}

assert_push_v2_contract(
    strpos($endpoint, "case 'register'") !== false &&
        strpos($endpoint, "case 'release'") !== false,
    'push device endpoint must support register and release'
);
assert_push_v2_contract(
    strpos($service, 'hash_equals') !== false,
    'release must compare the device secret in constant time'
);
assert_push_v2_contract(
    substr_count($service, "'idempotent_replay' => true") >= 2,
    'release and provider deactivation must tolerate an installation not registered yet'
);
assert_push_v2_contract(
    strpos($service, 'legacy_token_ownership_clear_failed') !== false &&
        strpos($service, '`android_n_device_id`') !== false &&
        strpos($service, '`ios_voip_token`') !== false &&
        strpos($service, 'token_ownership_transferred') !== false,
    'claiming a registry token must clear stale legacy ownership'
);
assert_push_v2_contract(
    strpos($router, "'push-devices'") !== false,
    'push device release must be routable without a session'
);
assert_push_v2_contract(
    strpos($logout, 'VNSEEA_ReleasePushInstallation') !== false,
    'logout must release only the current installation'
);
assert_push_v2_contract(
    strpos($delete_user, 'VNSEEA_DeactivateUserPushInstallations') !== false,
    'account deletion must deactivate every installation'
);

assert_push_v2_contract(
    strpos($service, 'https://api.onesignal.com/notifications') !== false &&
        strpos($service, 'include_subscription_ids') !== false &&
        strpos($service, 'Authorization: Key ') !== false,
    'delivery service must use the current OneSignal API contract'
);
assert_push_v2_contract(
    strpos($service, 'function VNSEEA_PushDeliveryDebugLog') !== false &&
        strpos($service, 'vnseea_push_debug.log') !== false &&
        strpos($service, 'FILE_APPEND | LOCK_EX') !== false &&
        strpos($service, "'push_device_register_attempt'") !== false &&
        strpos($service, "'push_device_register_success'") !== false &&
        strpos($service, "'push_device_register_error'") !== false &&
        strpos($service, "'push_device_release_attempt'") !== false &&
        strpos($service, "'push_device_release_success'") !== false &&
        strpos($service, "'push_device_release_error'") !== false &&
        strpos($service, "'push_targets_missing'") !== false &&
        strpos($service, "'onesignal_delivery_attempt'") !== false &&
        strpos($service, "'onesignal_delivery_response'") !== false,
    'new push delivery path must expose target resolution and provider responses in backend diagnostics'
);
$target_lookup_start = strpos($service, 'function VNSEEA_GetUserPushTargets');
$target_lookup_end = strpos(
    $service,
    'function VNSEEA_PushDeliveryTargetIsActive',
    $target_lookup_start
);
$target_lookup = substr(
    $service,
    $target_lookup_start,
    $target_lookup_end - $target_lookup_start
);
assert_push_v2_contract(
    strpos($target_lookup, '$has_provider_registration') !== false &&
        strpos($target_lookup, 'token_row.`provider`=\'{$provider_sql}\'') !== false &&
        strpos($target_lookup, '$has_installation') === false,
    'legacy fallback must be suppressed by registration for the requested provider, not by an unrelated VoIP installation'
);
assert_push_v2_contract(
    strpos($service, 'CURLOPT_SSL_VERIFYPEER, true') !== false &&
        strpos($service, 'CURLOPT_SSL_VERIFYHOST, 2') !== false,
    'provider requests must verify TLS'
);
assert_push_v2_contract(
    strpos($service, "\$request['ios_sound'] = 'default';") !== false &&
        strpos($legacy_service, "\$final_request_data['ios_sound'] = 'default';") !== false &&
        strpos($service, 'app_notification_sound.mp3') === false &&
        strpos($legacy_service, "\$default_mobile_notification_sound . '.mp3'") === false,
    'iOS push must use the bundled system sound instead of a missing custom file'
);
assert_push_v2_contract(
    strpos($service, 'push_debug_file_write_failed') !== false &&
        strpos($legacy_service, 'push_debug_file_write_failed') !== false,
    'push diagnostics must fall back to PHP error logging when the dedicated file is not writable'
);
assert_push_v2_contract(
    strpos($service, '$no_valid_subscriptions') !== false &&
        strpos($service, '$recipient_count') !== false &&
        strpos($service, "'invalid_token' => (bool)(\$invalid_token || \$no_valid_subscriptions)") !== false,
    'OneSignal 2xx responses without a recipient must deactivate the invalid subscription'
);
assert_push_v2_contract(
    strpos($service, "array('Unregistered', 'ExpiredToken')") !== false,
    'APNs ExpiredToken and Unregistered responses must deactivate the VoIP token'
);
assert_push_v2_contract(
    strpos($service, 'array(60, 300, 900, 3600)') !== false &&
        strpos($service, 'attempt_count') !== false,
    'delivery retries must use the approved schedule'
);
assert_push_v2_contract(
    strpos($service, "'idempotency_key' => !empty(\$delivery['idempotency_key'])") !== false &&
        strpos($service, "'idempotency_key' => (string)\$delivery['batch_uuid']") === false,
    'OneSignal idempotency must be unique per delivery rather than per batch'
);
assert_push_v2_contract(
    strpos($service, 'VNSEEA_PushDeliveryTargetIsActive') !== false &&
        strpos($service, 'VNSEEA_IsConversationMuted($recipient_id, $conversation_type, $conversation_id)') !== false &&
        strpos($service, 'T_GROUP_CHAT_USERS') !== false,
    'each retry must recheck installation ownership, mute, and group membership'
);
assert_push_v2_contract(
    strpos($service, "'notification_id'") !== false &&
        strpos($service, "'message_id'") !== false &&
        strpos($service, "'message_type'") !== false,
    'push payloads must expose canonical navigation identifiers'
);
assert_push_v2_contract(
    strpos($service, "'push_kind' => 'message'") !== false &&
        strpos($service, "'notification_type' => 'message'") !== false &&
        strpos($service, "'type' => \$conversation['type']") !== false &&
        strpos($service, "'user_id' => \$conversation['type'] === 'user'") !== false &&
        strpos($service, "'page_id' => \$conversation['type'] === 'page'") !== false &&
        strpos($service, "'group_id' => \$conversation['type'] === 'group'") !== false,
    'message push must preserve Android native conversation routing fields'
);
assert_push_v2_contract(
    strpos($service, "'user_id' => \$recipient_id") !== false &&
        strpos($service, "'chat_id' => \$conversation_id") !== false,
    'mute lookup must be scoped to the exact recipient and conversation'
);
assert_push_v2_contract(
    strpos($service, 'member.`last_seen`') !== false &&
        strpos($service, "(int)\$member['last_seen'] >= (int)\$message['time']") !== false,
    'group retries must stop after the recipient has read the message'
);
$social_enqueue_start = strpos($service, 'function VNSEEA_EnqueueNotificationPush');
$social_enqueue_end = strpos($service, 'function VNSEEA_OneSignalConfigForPlatform', $social_enqueue_start);
$social_enqueue = substr(
    $service,
    $social_enqueue_start,
    $social_enqueue_end - $social_enqueue_start
);
assert_push_v2_contract(
    strpos($social_enqueue, "'recipient_id' => (string)\$recipient_id") !== false,
    'every social push must identify its recipient for account-scoped navigation'
);

assert_push_v2_contract(
    strpos($get_messages, 'Wo_MessagesPushNotifier') === false,
    'reading direct messages must not dispatch push'
);
assert_push_v2_contract(
    strpos($group_messages, 'Wo_MessagesPushNotifier') === false,
    'reading group messages must not dispatch push'
);
assert_push_v2_contract(
    strpos($group_messages, 'Wo_UpdateGChatLastSeen($group_id)') !== false,
    'reading group messages must advance the recipient last-seen watermark'
);
assert_push_v2_contract(
    strpos($message_runtime, 'VNSEEA_EnqueueMessagePush') !== false,
    'message commit path must enqueue push delivery'
);
assert_push_v2_contract(
    strpos($message_runtime, "function_exists('VNSEEA_EnqueueNotificationPush')") !== false,
    'social delivery must not depend on legacy native-push flags'
);
foreach (array('Wo_NotificationWebPushNotifier', 'Wo_MessagesPushNotifier') as $legacy_notifier) {
    $notifier_start = strpos($legacy_push_runtime, "function {$legacy_notifier}()");
    $notifier_queue = strpos(
        $legacy_push_runtime,
        'return VNSEEA_ProcessPushDeliveryQueue(50);',
        $notifier_start
    );
    assert_push_v2_contract(
        $notifier_start !== false &&
        $notifier_queue !== false &&
        $notifier_queue - $notifier_start < 300,
        "{$legacy_notifier} must only drain deliveries already in the queue"
    );
}
assert_push_v2_contract(
    strpos($mute, "\$chat_id = (int)\$_POST['chat_id']") !== false &&
        strpos($mute, "\$chat_type = (string)\$_POST['type']") !== false &&
        strpos($mute, "where('user_id', \$wo['user']['id'])") !== false &&
        strpos($mute, "where('message_id',0)") !== false &&
        strpos($mute, "\$update_data['message_id'] = 0") !== false,
    'mute endpoint must define the conversation scope and verify ownership'
);
assert_push_v2_contract(
    strpos($cron, 'VNSEEA_ProcessPushDeliveryQueue') !== false,
    'cron must process pending push deliveries'
);

require_once $root . '/assets/includes/vnseea_push_delivery.php';
assert_push_v2_contract(
    function_exists('VNSEEA_ShouldUseLegacyPushFallback'),
    'provider-scoped legacy fallback helper is missing'
);
assert_push_v2_contract(
    VNSEEA_ShouldUseLegacyPushFallback(false, 0) === true,
    'legacy token must remain usable until the requested provider is registered'
);
assert_push_v2_contract(
    VNSEEA_ShouldUseLegacyPushFallback(true, 0) === false,
    'an intentionally inactive provider must not revive a stale legacy token'
);
assert_push_v2_contract(
    VNSEEA_ShouldUseLegacyPushFallback(false, 1) === false,
    'active registry targets must take precedence over legacy tokens'
);
assert_push_v2_contract(
    function_exists('VNSEEA_OneSignalResponseHasRecipient'),
    'OneSignal recipient classifier is missing'
);
assert_push_v2_contract(
    VNSEEA_OneSignalResponseHasRecipient(200, array('id' => 'message-id', 'recipients' => 1)) === true,
    'OneSignal response with one recipient must be accepted'
);
assert_push_v2_contract(
    VNSEEA_OneSignalResponseHasRecipient(200, array('id' => 'message-id', 'recipients' => 0)) === false,
    'OneSignal response with zero recipients must not be marked sent'
);
$preview_cases = array(
    'text' => array(array('text' => 'Xin chào'), 'text'),
    'link' => array(array('text' => 'https://vnseea.vn/about'), 'link'),
    'location' => array(array('lat' => '21.0', 'lng' => '105.8'), 'location'),
    'image' => array(array('media' => 'upload/photos/photo.jpg'), 'image'),
    'video' => array(array('media' => 'upload/videos/video.mp4'), 'video'),
    'audio' => array(array('type_two' => 'audio', 'media' => 'upload/audio/voice.m4a'), 'audio'),
    'file' => array(array('media' => 'upload/files/report.pdf'), 'file'),
    'sticker' => array(array('type_two' => 'sticker', 'stickers' => 'smile.webp'), 'sticker'),
    'gif' => array(array('stickers' => 'reaction.gif'), 'gif'),
    'shared_post' => array(array('text' => 'https://vnseea.vn/post/42'), 'shared_post'),
    'story' => array(array('type_two' => 'story_reply', 'story_id' => 7), 'story'),
    'product' => array(array('type_two' => 'product_inquiry', 'product_id' => 9), 'product'),
    'order' => array(array('type_two' => 'market_order_request', 'market_order_hash' => 'order-hash'), 'order'),
    'pin' => array(array('type_two' => 'message_pin_event'), 'pin'),
    'call' => array(array('type_two' => 'call_event'), 'call_event')
);
foreach ($preview_cases as $name => $case) {
    $descriptor = VNSEEA_MessagePushDescriptor($case[0], 'vi');
    assert_push_v2_contract(
        !empty($descriptor['text']) && $descriptor['type'] === $case[1],
        "message preview type {$name} is not canonical"
    );
}

echo "push delivery v2 contract: OK\n";
