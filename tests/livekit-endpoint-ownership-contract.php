<?php

$root = dirname(__DIR__);

function endpoint_contract_assert($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$migration = $root . '/database/migrations/20260803_livekit_endpoint_leases.sql';
$helper = $root . '/assets/includes/vnseea_livekit_endpoint.php';
endpoint_contract_assert(file_exists($migration), 'endpoint lease migration must exist');
endpoint_contract_assert(file_exists($helper), 'endpoint ownership helper must exist');

$helperSource = file_get_contents($helper);
$migrationSource = file_get_contents($migration);
$direct = file_get_contents($root . '/api/v2/endpoints/livekit.php');
$group = file_get_contents($root . '/api/v2/endpoints/group_call.php');
$live = file_get_contents($root . '/assets/includes/vnseea_live.php');
$liveXhr = file_get_contents($root . '/xhr/live.php');
$liveApi = file_get_contents($root . '/api/v2/endpoints/live.php');
$livekit = file_get_contents($root . '/assets/includes/functions_two.php');
$legacyAnswer = file_get_contents($root . '/xhr/answer_call.php');
$legacyClose = file_get_contents($root . '/xhr/close_call.php');
$legacyDecline = file_get_contents($root . '/xhr/decline_call.php');
$legacyGroupJoin = file_get_contents($root . '/xhr/join_group_call.php');
$legacyDirectPayload = file_get_contents($root . '/xhr/livekit_call_payload.php');
$legacyGroupPayload = file_get_contents($root . '/xhr/get_group_call_payload.php');
$legacyGroupDecline = file_get_contents($root . '/xhr/decline_group_call_invite.php');
$pushDelivery = file_get_contents($root . '/assets/includes/vnseea_push_delivery.php');
$postActions = file_get_contents($root . '/api/v2/endpoints/post-actions.php');
$xhrPosts = file_get_contents($root . '/xhr/posts.php');

endpoint_contract_assert(strpos($helperSource, 'function VNSEEA_GetRequestEndpointId') !== false, 'request endpoint resolver must exist');
endpoint_contract_assert(strpos($helperSource, 'function VNSEEA_ClaimLiveKitEndpoint') !== false, 'atomic endpoint claim must exist');
endpoint_contract_assert(strpos($helperSource, 'function VNSEEA_IsLiveKitEndpointOwner') !== false, 'endpoint owner guard must exist');
endpoint_contract_assert(strpos($helperSource, 'function VNSEEA_ReleaseLiveKitEndpoint') !== false, 'endpoint release must exist');
endpoint_contract_assert(strpos($helperSource, 'function VNSEEA_DirectCallEndpointScope') !== false, 'direct calls must separate audio and video endpoint scopes');
endpoint_contract_assert(strpos($migrationSource, "'direct_audio'") !== false && strpos($migrationSource, "'direct_video'") !== false, 'endpoint lease migration must allow distinct direct audio and video scopes');

$canonicalCalls = file_get_contents($root . '/assets/includes/vnseea_livekit_call.php');

endpoint_contract_assert(strpos($direct, 'VNSEEA_DirectCallEndpointScope') !== false, 'direct calls must derive endpoint scope from call type');
endpoint_contract_assert(strpos($direct, 'call_answered_elsewhere') !== false, 'second direct endpoint must be rejected');
endpoint_contract_assert(strpos($direct, "'endpoint_owned' =>") !== false, 'direct status responses must report ownership for the requesting endpoint');
endpoint_contract_assert(strpos($direct, 'answered_endpoint_id') === false, 'direct API and realtime responses must not expose the winning endpoint id');
endpoint_contract_assert(strpos($group, "'group_call'") !== false, 'group calls must use endpoint leases');
endpoint_contract_assert(strpos($group, "require_once 'assets/includes/vnseea_livekit_call.php'") !== false, 'API group calls must load the shared call helpers');
endpoint_contract_assert(strpos($group, 'group_call_active_on_another_device') !== false, 'second group endpoint must be rejected');
endpoint_contract_assert(strpos($group, "'endpoint_owned' =>") !== false, 'group sync must report ownership for the requesting endpoint');
endpoint_contract_assert(strpos($group, 'active_endpoint_id') === false, 'group API and realtime responses must not expose the active endpoint id');
endpoint_contract_assert(strpos($direct, "'endpoint_id' => \$endpoint_id") === false, 'direct participant metadata must not expose the endpoint id');
endpoint_contract_assert(strpos($group, "'endpoint_id' => \$endpoint_id") === false, 'group participant metadata must not expose the endpoint id');
endpoint_contract_assert(strpos($legacyDirectPayload, "'endpoint_id' => \$endpoint_id") === false, 'legacy direct participant metadata must not expose the endpoint id');
endpoint_contract_assert(strpos($legacyGroupPayload, "'endpoint_id' => \$endpoint_id") === false, 'legacy group participant metadata must not expose the endpoint id');
endpoint_contract_assert(strpos($group, 'mysqli_rollback($sqlConnect)') !== false, 'failed group joins must roll back their endpoint claim');
endpoint_contract_assert(strpos($legacyGroupJoin, 'mysqli_rollback($sqlConnect)') !== false, 'legacy failed group joins must roll back their endpoint claim');
endpoint_contract_assert(strpos($canonicalCalls, 'function Wo_PublishCanonicalLiveKitGroupState') !== false, 'group realtime ownership state must use a shared publisher');
endpoint_contract_assert(strpos($canonicalCalls, 'function Wo_DismissCanonicalLiveKitGroupOtherEndpoints') !== false, 'group winner must use a shared endpoint dismiss helper');
endpoint_contract_assert(strpos($legacyGroupJoin, 'Wo_PublishCanonicalLiveKitGroupState') !== false, 'Nuxt group joins must publish the winning endpoint');
endpoint_contract_assert(strpos($legacyGroupJoin, 'Wo_DismissCanonicalLiveKitGroupOtherEndpoints') !== false, 'Nuxt group joins must dismiss losing endpoints');
endpoint_contract_assert(strpos($legacyGroupJoin, "require_once 'assets/includes/vnseea_livekit_call.php'") !== false, 'Nuxt group join must load the shared call helpers');
endpoint_contract_assert(strpos($legacyAnswer, 'VNSEEA_ReleaseLiveKitEndpoint($endpoint_scope') !== false, 'legacy failed direct answers must release their endpoint claim');
endpoint_contract_assert(strpos($legacyAnswer, '$answered_rows') !== false, 'legacy direct answer must preserve affected rows before call-log queries');
endpoint_contract_assert(strpos($legacyAnswer, 'answered_endpoint_id') === false, 'legacy direct answer must not expose the winning endpoint id');
endpoint_contract_assert(strpos($legacyClose, '$livekit_source = Wo_GetCallSourceById($id, $resolved_call_type);') !== false, 'legacy close must derive the provider from the call row instead of trusting request input');
endpoint_contract_assert(strpos($legacyClose, "\$livekit_source['provider'] === 'livekit'") !== false, 'legacy close must enforce endpoint ownership for every LiveKit row');
endpoint_contract_assert(strpos($legacyDecline, '$declined_rows') !== false, 'legacy direct decline must preserve affected rows before call-log queries');
endpoint_contract_assert(strpos($legacyDecline, '$endpoint_claimed') !== false, 'failed legacy direct declines must release their endpoint claim');
endpoint_contract_assert(strpos($legacyGroupDecline, "if (!empty(\$claim['ok']))") !== false, 'legacy group decline must release successful claims even when the mutation loses a race');
endpoint_contract_assert(substr_count($group, "if (!empty(\$endpoint_claim['ok']))") >= 2, 'API group decline paths must release successful claims even when the mutation loses a race');
endpoint_contract_assert(strpos($pushDelivery, "\$is_control && \$target_endpoint_id === ''") !== false, 'control pushes must skip legacy targets without endpoint ownership');

endpoint_contract_assert(strpos($live, "'live'") !== false, 'live creation must claim a host endpoint');
endpoint_contract_assert(substr_count($live, "->where('live_time', time() - 45, '>=')") >= 2, 'live creation must block another endpoint throughout the stale heartbeat window');
endpoint_contract_assert(strpos($liveXhr, 'live_active_on_another_device') !== false, 'non-host endpoint must not end the live');
endpoint_contract_assert(strpos($live, 'function VNSEEA_IsLiveHostEndpoint') !== false, 'live host endpoint check must be centralized');
endpoint_contract_assert(strpos($live, 'function VNSEEA_CanDeletePostFromEndpoint') !== false, 'active live deletion guard must be centralized');
endpoint_contract_assert(strpos($postActions, 'VNSEEA_CanDeletePostFromEndpoint') !== false, 'API post deletion must enforce active live endpoint ownership');
endpoint_contract_assert(strpos($xhrPosts, 'VNSEEA_CanDeletePostFromEndpoint') !== false, 'legacy post deletion must enforce active live endpoint ownership');
$checkCommentsStart = strpos($liveApi, "if (\$_POST['type'] == 'check_comments')");
$deleteStart = strpos($liveApi, "if (\$_POST['type'] == 'delete')");
$checkCommentsSource = ($checkCommentsStart !== false && $deleteStart !== false)
    ? substr($liveApi, $checkCommentsStart, $deleteStart - $checkCommentsStart)
    : '';
endpoint_contract_assert(strpos($checkCommentsSource, 'VNSEEA_IsLiveHostEndpoint') !== false, 'API v2 heartbeat must resolve host ownership inside check_comments');
endpoint_contract_assert(strpos($livekit, '$endpoint_id') !== false, 'LiveKit identities must include endpoint context');
endpoint_contract_assert(strpos($livekit, "'endpoint_id' => \$endpoint_id") === false, 'livestream participant metadata must not expose the endpoint id');

echo "LiveKit endpoint ownership contract passed.\n";
