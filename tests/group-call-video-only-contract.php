<?php

function group_call_assert_true($condition, $message) {
    if (!$condition) {
        fwrite(STDERR, $message . "\n");
        exit(1);
    }
}

function group_call_assert_same($expected, $actual, $message) {
    if ($expected !== $actual) {
        fwrite(STDERR, $message . "\nExpected: " . var_export($expected, true) . "\nActual: " . var_export($actual, true) . "\n");
        exit(1);
    }
}

function group_call_assert_contains($needle, $haystack, $message) {
    group_call_assert_true(strpos($haystack, $needle) !== false, $message);
}

function group_call_assert_not_contains($needle, $haystack, $message) {
    group_call_assert_true(strpos($haystack, $needle) === false, $message);
}

$root = dirname(__DIR__);
$policy_file = $root . '/assets/includes/vnseea_group_call_policy.php';

group_call_assert_true(file_exists($policy_file), 'The canonical new group-call policy helper is missing.');
require_once $policy_file;

group_call_assert_same('video', Wo_NormalizeNewGroupCallType('audio'), 'Legacy audio create requests must normalize to video.');
group_call_assert_same('video', Wo_NormalizeNewGroupCallType('video'), 'Video create requests must remain video.');
group_call_assert_same(true, Wo_CanStartNewGroupVideoCall(array(
    'video_chat' => 1,
    'can_use_video_call' => 1,
    'audio_chat' => 0,
    'can_use_audio_call' => 0
)), 'New group calls must depend only on video-call configuration.');
group_call_assert_same(false, Wo_CanStartNewGroupVideoCall(array(
    'video_chat' => 1,
    'can_use_video_call' => 0,
    'audio_chat' => 1,
    'can_use_audio_call' => 1
)), 'Audio-call configuration must not enable new group calls.');
group_call_assert_same(true, Wo_ShouldNotifyNewGroupCall(array('is_existing' => 0)), 'A newly-created group call must notify members.');
group_call_assert_same(false, Wo_ShouldNotifyNewGroupCall(array('is_existing' => 1)), 'An existing active group call must not notify members again.');

$functions = file_get_contents($root . '/assets/includes/functions_two.php');
$api_endpoint = file_get_contents($root . '/api/v2/endpoints/group_call.php');
$xhr_endpoint = file_get_contents($root . '/xhr/create_new_group_call.php');
$join_xhr_endpoint = file_get_contents($root . '/xhr/join_group_call.php');

group_call_assert_contains("return (\$call_type == 'audio') ? 'audio' : 'video';", $functions, 'Legacy audio records must remain readable as audio.');
group_call_assert_contains("'group_call_audio'", $functions, 'Historical audio group-call messages must remain supported.');
group_call_assert_contains('$call_type = Wo_NormalizeNewGroupCallType($call_type);', $functions, 'The canonical create helper must force the new-call policy.');
group_call_assert_contains("['is_existing'] = 1", $functions, 'The canonical create helper must mark reused active calls.');
group_call_assert_contains("['is_existing'] = 0", $functions, 'The canonical create helper must mark newly-created calls.');

group_call_assert_contains('$call_type = Wo_NormalizeNewGroupCallType', $api_endpoint, 'The v2 create endpoint must normalize all new calls to video.');
group_call_assert_contains('Wo_CanStartNewGroupVideoCall', $api_endpoint, 'The v2 create endpoint must use video-call configuration only.');
group_call_assert_contains('Wo_ShouldNotifyNewGroupCall($group_call)', $api_endpoint, 'The v2 create endpoint must suppress duplicate ringing for reused calls.');
group_call_assert_not_contains("(\$call_type == 'audio') ?", $api_endpoint, 'The v2 create endpoint must not branch on audio configuration.');

group_call_assert_contains('$call_type = Wo_NormalizeNewGroupCallType', $xhr_endpoint, 'The PHTML create endpoint must normalize all new calls to video.');
group_call_assert_contains('Wo_CanStartNewGroupVideoCall', $xhr_endpoint, 'The PHTML create endpoint must use video-call configuration only.');
group_call_assert_not_contains("(\$call_type == 'audio') ?", $xhr_endpoint, 'The PHTML create endpoint must not branch on audio configuration.');
group_call_assert_contains("'call_type' => 'video'", $join_xhr_endpoint, 'PHTML must normalize reused legacy group calls to the video room UI.');
group_call_assert_contains("Wo_BuildGroupCallJoinUrl(\$group_call['id'], 'video')", $join_xhr_endpoint, 'PHTML join URLs must always open the video group room.');

echo "group-call video-only backend contract: ok\n";
