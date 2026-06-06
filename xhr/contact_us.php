<?php
// English description: Handles public contact-us form submissions and sends them to the configured site email.
if ($f == 'contact_us') {
    if ($wo['config']['reCaptcha'] == 1) {
        if (empty($_POST['g-recaptcha-response'])) {
            $errors[] = $error_icon . $wo['lang']['please_check_details'];
        }
        else{
            $recaptcha_data = array(
            'secret' => $wo['config']['recaptcha_secret_key'],
            'response' => $_POST['g-recaptcha-response']
            );

            $verify = curl_init();
            curl_setopt($verify, CURLOPT_URL, "https://www.google.com/recaptcha/api/siteverify");
            curl_setopt($verify, CURLOPT_POST, true);
            curl_setopt($verify, CURLOPT_POSTFIELDS, http_build_query($recaptcha_data));
            curl_setopt($verify, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($verify, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($verify);
            $response = json_decode($response);
            if (!$response->success) {
                $errors[] = $error_icon . $wo['lang']['reCaptcha_error'];
            }
        }
    }
    if (empty($_POST['first_name']) || empty($_POST['last_name']) || empty($_POST['email']) || empty($_POST['message'])) {
        $errors[] = $error_icon . $wo['lang']['please_check_details'];
    } else if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = $error_icon . $wo['lang']['email_invalid_characters'];
    }
    if (empty($errors)) {
        $first_name        = Wo_Secure($_POST['first_name'],1);
        $last_name         = Wo_Secure($_POST['last_name'],1);
        $email             = Wo_Secure($_POST['email']);
        $message           = Wo_Secure($_POST['message'],1);
        $name              = $first_name . ' ' . $last_name;
        $send_message_data = array(
            'from_email' => $wo['config']['siteEmail'],
            'from_name' => $name,
            'reply-to' => $email,
            'to_email' => $wo['config']['siteEmail'],
            'to_name' => $wo['config']['siteName'],
            'subject' => 'Contact us new message',
            'charSet' => 'utf-8',
            'message_body' => $message,
            'is_html' => false
        );
        if (!empty($_SERVER['HTTP_X_NUXT_BRIDGE'])) {
            $send_message_data['return'] = 'error';
        }
        $send              = Wo_SendMessage($send_message_data);
        if ($send === true) {
            $data = array(
                'status' => 200,
                'message' => $success_icon . $wo['lang']['email_sent']
            );
        } else {
            $errors[] = $error_icon . $wo['lang']['processing_error'];
            if (!empty($_SERVER['HTTP_X_NUXT_BRIDGE']) && is_string($send) && !empty($send)) {
                $mail_error = $send;
            }
        }
    }
    header("Content-type: application/json; charset=utf-8");
    if (!empty($errors)) {
        $response = array('errors' => $errors);
        if (!empty($mail_error)) {
            $response['mail_error'] = $mail_error;
        }
        echo json_encode($response);
    } else {
        echo json_encode($data);
    }
    exit();
}
