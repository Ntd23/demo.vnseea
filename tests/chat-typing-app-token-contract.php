<?php
// English description: Verifies that the app's bearer access token reaches one-to-one and group typing state through the Nuxt bridge, without a PHP browser session.

$root = dirname(__DIR__);

function typing_assert($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$sources = array(
    'current_user' => str_replace("\r\n", "\n", file_get_contents($root . '/client/server/utils/backend-current-user.ts')),
    'shared' => str_replace("\r\n", "\n", file_get_contents($root . '/client/server/api/messages/_shared.ts')),
    'group' => str_replace("\r\n", "\n", file_get_contents($root . '/client/server/api/messages/group/typing.post.ts')),
    'status' => file_get_contents($root . '/api/v2/endpoints/get-chat-typing-status.php'),
    'set_status' => file_get_contents($root . '/api/v2/endpoints/set-chat-typing-status.php'),
);

// Bearer tokens are accepted only where a route opts in, never instead of a browser session.
typing_assert(strpos($sources['current_user'], 'const bearerSession = !cookieSession && options.allowBearerToken ? getBearerAccessToken(event) : ""') !== false, 'bearer tokens are opt-in and never replace a browser session');
typing_assert(strpos($sources['current_user'], '&& !bearerSession') !== false, 'a rejected app token never clears browser cookies');
typing_assert(preg_match('#/\^Bearer\\\\s\+\(\[A-Za-z0-9\._~-\]\{16,256\}\)\$/i#', $sources['current_user']) === 1, 'only token-shaped bearer values are accepted');

// One-to-one typing from the app goes through API v2 with the app's own token.
typing_assert(strpos($sources['shared'], 'const appAccessToken = getCookie(event, "user_id") ? "" : getBearerAccessToken(event)') !== false, 'one-to-one typing detects the app token');
typing_assert(strpos($sources['shared'], '"set-chat-typing-status"') !== false && strpos($sources['shared'], '"get-chat-typing-status"') !== false, 'app typing writes and reads through API v2');
typing_assert(strpos($sources['shared'], 'status: input.action === "start" ? "typing" : "stopped"') !== false, 'start and stop map to the API v2 statuses');
typing_assert(strpos($sources['set_status'], "\$typing = (\$_POST['status'] == 'typing') ? 1 : 0;") !== false, 'API v2 clears typing for any other status');

// Group typing only needs to know who is typing.
typing_assert(strpos($sources['group'], 'getBackendCurrentUser(event, { allowBearerToken: true })') !== false, 'group typing accepts the app token');

// The read side mirrors what get_user_messages reports.
typing_assert(strpos($sources['status'], "'typing' => Wo_IsTyping(\$recipient_id) ? 1 : 0,") !== false, 'typing status reads the same flag as get_user_messages');
typing_assert(strpos($sources['status'], "->where('is_typing', 2)") !== false, 'recording status is reported too');
typing_assert(strpos($sources['status'], "\$recipient_id = isset(\$_POST['user_id']) ? (int) \$_POST['user_id'] : 0;") !== false, 'the partner id is read as an integer');

fwrite(STDOUT, "chat typing app token contract: ok\n");
