<?php

$root = dirname(__DIR__);
$bridge = file_get_contents($root . '/client/server/api/auth/register.post.ts');
$login_bridge = file_get_contents($root . '/client/server/api/auth/login.post.ts');
$endpoint = file_get_contents($root . '/api/v2/endpoints/create-account.php');
$migration = file_get_contents($root . '/database/migrations/20260811_phone_only_registration.sql');

function phone_registration_assert($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

phone_registration_assert(
    strpos($bridge, 'phone_${digitsOnly}@vnseea.invalid') === false &&
    strpos($bridge, 'const email = isEmailIdentity ? identity : ""') !== false,
    'Nuxt registration must not create synthetic phone email addresses'
);
phone_registration_assert(
    strpos($bridge, 'phone_num: phoneNum || undefined') !== false,
    'Nuxt registration must send normalized phone_num'
);
phone_registration_assert(
    strpos($endpoint, "\$account_data['phone_number'] = Wo_Secure(\$phone_number, 0);") !== false,
    'Backend registration must persist phone_num as phone_number'
);
phone_registration_assert(
    strpos($endpoint, 'Wo_PhoneExists($phone_number)') !== false,
    'Backend registration must reject duplicate phone numbers'
);
phone_registration_assert(
    strpos($login_bridge, 'identity.replace(/\\D/g, "")') !== false,
    'Login must use the same phone normalization as registration'
);
phone_registration_assert(
    strpos($migration, 'MODIFY COLUMN `email` VARCHAR(255) NULL DEFAULT NULL') !== false,
    'Phone-only registration requires nullable unique email storage'
);

echo "phone registration contract: OK\n";
