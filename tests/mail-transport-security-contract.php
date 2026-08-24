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

preg_match_all('/\$mail->SMTPOptions\s*=\s*array\(.*?\);/s', $mail_runtime, $smtp_option_blocks);
assert_mail_transport_contract(
    count($smtp_option_blocks[0]) >= 2,
    'Expected both direct and queued SMTP transports to define certificate verification'
);
foreach ($smtp_option_blocks[0] as $smtp_option_block) {
    assert_mail_transport_contract(
        strpos($smtp_option_block, '"verify_peer" => false') === false &&
            strpos($smtp_option_block, '"verify_peer_name" => false') === false &&
            strpos($smtp_option_block, '"allow_self_signed" => true') === false,
        'No SMTP transport may disable certificate verification'
    );
}

assert_mail_transport_contract(
    strpos($mail_runtime, '$mail->AltBody =') !== false,
    'HTML email must include a text/plain alternative body'
);

assert_mail_transport_contract(
    strpos($mail_runtime, '<!doctype html>') !== false,
    'Partial HTML email bodies must be wrapped in a complete HTML document'
);

echo "mail transport security contract passed\n";
