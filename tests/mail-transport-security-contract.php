<?php

$root = dirname(__DIR__);
$mail_runtime = file_get_contents($root . '/assets/includes/functions_two.php');

function assert_mail_transport_contract($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

assert_mail_transport_contract(
    strpos($mail_runtime, '"verify_peer" => true') !== false &&
        strpos($mail_runtime, '"verify_peer_name" => true') !== false &&
        strpos($mail_runtime, '"allow_self_signed" => false') !== false,
    'SMTP TLS must verify the peer certificate and reject self-signed certificates'
);

echo "mail transport security contract passed\n";
