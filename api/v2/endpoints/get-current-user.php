<?php
// +------------------------------------------------------------------------+
// | @author Deen Doughouz (DoughouzForest)
// | @author_url 1: http://www.hisotechgroup.com
// | @author_url 2: http://codecanyon.net/user/doughouzforest
// | @author_email: wowondersocial@gmail.com
// +------------------------------------------------------------------------+
// | WoWonder - The Ultimate Social Networking Platform
// | Copyright (c) 2018 WoWonder. All rights reserved.
// +------------------------------------------------------------------------+
$bootstrapped_standalone = false;

if (!isset($wo) || !is_array($wo)) {
    $bootstrapped_standalone = true;
    header_remove('Server');
    header('Content-type: application/json');

    $root_path = dirname(__DIR__, 3);
    $previous_working_directory = getcwd();

    if ($root_path && is_dir($root_path)) {
        chdir($root_path);
    }

    require_once $root_path . '/assets/init.php';
    require_once $root_path . '/api/v2/init.php';

    if (function_exists('decryptConfigData')) {
        decryptConfigData();
    }

    if ($previous_working_directory) {
        chdir($previous_working_directory);
    }
}

$response_data = array(
    'api_status' => 400,
);

$session_id = '';
if (!empty($_GET['session_id'])) {
    $session_id = $_GET['session_id'];
}

$current_user_id = 0;
if (!empty($session_id) && function_exists('Wo_GetUserFromSessionID')) {
    $resolved_user_id = Wo_GetUserFromSessionID($session_id);
    if (!empty($resolved_user_id)) {
        $current_user_id = (int) $resolved_user_id;
    }
}

if (empty($current_user_id) && !empty($wo['loggedin']) && $wo['loggedin'] === true && !empty($wo['user']['user_id'])) {
    $current_user_id = (int) $wo['user']['user_id'];
}

if (empty($current_user_id)) {
    $response_data = array(
        'api_status' => '401',
        'errors' => array(
            'error_id' => '1',
            'error_text' => 'User is not authenticated',
        ),
    );
} else {
    $current_user = Wo_UserData($current_user_id);
    $current_user_ = Wo_UpdateUserDetails($current_user, true, true, true);

    if (is_array($current_user_)) {
        $current_user = $current_user_;
    }

    $response_data = array(
        'api_status' => 200,
        'user_data' => array(
            'user_id' => (int) $current_user['user_id'],
            'name' => !empty($current_user['name'])
                ? $current_user['name']
                : (!empty(trim(($current_user['first_name'] ?? '') . ' ' . ($current_user['last_name'] ?? '')))
                    ? trim(($current_user['first_name'] ?? '') . ' ' . ($current_user['last_name'] ?? ''))
                    : (!empty($current_user['username']) ? $current_user['username'] : 'User')),
            'username' => !empty($current_user['username']) ? $current_user['username'] : '',
            'avatar' => !empty($current_user['avatar']) ? $current_user['avatar'] : '',
            'admin' => isset($current_user['admin']) ? (int) $current_user['admin'] : 0,
            'wallet' => $current_user['wallet'] ?? null,
            'points' => $current_user['points'] ?? null,
        ),
    );
}

if ($bootstrapped_standalone === true) {
    header('Content-Type: application/json');
    echo json_encode($response_data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}
