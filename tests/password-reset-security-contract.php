<?php

$root = dirname(__DIR__);

function password_reset_contract_assert($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

function password_reset_contract_source($root, $path)
{
    $source = @file_get_contents($root . '/' . $path);
    password_reset_contract_assert(is_string($source), "Unable to read {$path}");
    return $source;
}

$route_policy = password_reset_contract_source($root, 'client/src/auth/application/constants/route-policy.ts');
$reset_page = password_reset_contract_source($root, 'client/app/pages/reset-password.vue');
$reset_presentation = password_reset_contract_source($root, 'client/src/auth/presentation/pages/ResetPasswordPage.vue');
$reset_view_model = password_reset_contract_source($root, 'client/src/auth/application/view-models/useResetPasswordPageVM.ts');
$vi_locale = password_reset_contract_source($root, 'client/i18n/locales/vi.json');
$en_locale = password_reset_contract_source($root, 'client/i18n/locales/en.json');
$endpoint = password_reset_contract_source($root, 'api/v2/endpoints/reset_password.php');

$guest_only_start = strpos($route_policy, 'const guestOnlyPaths');
$guest_only_end = strpos($route_policy, '])', $guest_only_start);
$guest_only_source = substr($route_policy, $guest_only_start, $guest_only_end - $guest_only_start);

password_reset_contract_assert(
    strpos($guest_only_source, '"/reset-password"') === false,
    'reset-password must remain accessible when another account is authenticated'
);
password_reset_contract_assert(
    strpos($route_policy, '"/reset-password"') !== false,
    'reset-password must remain a public route'
);
password_reset_contract_assert(
    strpos($reset_page, 'middleware: "guest"') === false,
    'reset-password page must not run the authenticated-user guest redirect'
);
password_reset_contract_assert(
    strpos($reset_presentation, 'accountNoticeDescription') !== false &&
        strpos($reset_presentation, ':readonly="Boolean(emailFromQuery)"') !== false,
    'reset form must identify and lock the account email supplied by the reset link'
);
password_reset_contract_assert(
    strpos($reset_view_model, 'emailFromQuery,') !== false,
    'reset view model must expose the link email to the presentation'
);
password_reset_contract_assert(
    strpos($vi_locale, '"accountNoticeDescription"') !== false &&
        strpos($en_locale, '"accountNoticeDescription"') !== false,
    'reset account notice must be localized in Vietnamese and English'
);

password_reset_contract_assert(
    strpos($endpoint, "explode('_', \$code, 2)") !== false,
    'reset endpoint must derive the target user ID from the signed reset token'
);
password_reset_contract_assert(
    strpos($endpoint, "where('user_id', \$token_user_id)") !== false &&
        strpos($endpoint, "where('email', \$email)") !== false,
    'reset endpoint must bind the submitted email to the token owner'
);
password_reset_contract_assert(
    strpos($endpoint, "\$update_query = \$db->where('user_id', \$token_user_id)") !== false &&
        strpos($endpoint, "\$updated = \$update_query->update") !== false,
    'password updates must target the token owner by user ID'
);
password_reset_contract_assert(
    strpos($endpoint, "where('email',\$email)->update") === false &&
        strpos($endpoint, "where('email', \$email)->update") === false,
    'password updates must never target an independently submitted email'
);
password_reset_contract_assert(
    strpos($endpoint, "'email_code' => ''") !== false &&
        strpos($endpoint, "'time_code_sent' => 0") !== false,
    'successful reset must invalidate the reset token and its expiry'
);

echo "password reset security contract: OK\n";
