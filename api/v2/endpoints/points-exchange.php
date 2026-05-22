<?php
// English description: Converts user points into wallet balance for the Nuxt settings my points screen.

$response_data = array(
    'api_status' => 400
);

if (empty($wo['user']) || empty($wo['user']['id'])) {
    $error_code = 1;
    $error_message = 'User is not authenticated';
}
else {
    $user_id = (int) $wo['user']['user_id'];
    $points = 0;

    if (isset($_POST['points'])) {
        $points = (int) $_POST['points'];
    }

    if ($points < 1000 || $points % 1000 !== 0) {
        $error_code = 2;
        $error_message = 'Points must be exchanged in blocks of 1000.';
    }
    else {
        $user_data = Wo_UserData($user_id);
        $current_points = isset($user_data['points']) ? (int) $user_data['points'] : 0;
        $current_wallet = isset($user_data['wallet']) ? (float) $user_data['wallet'] : 0;
        $wallet_amount = ($points / 1000) * 10000;

        if ($current_points < $points) {
            $error_code = 3;
            $error_message = 'Not enough points to exchange.';
        }
        else {
            $new_points = $current_points - $points;
            $new_wallet = $current_wallet + $wallet_amount;
            $safe_points = (int) $points;
            $safe_amount = (float) $wallet_amount;
            $notes = mysqli_real_escape_string($sqlConnect, 'Exchange ' . $safe_points . ' points to wallet');
            $extra = mysqli_real_escape_string($sqlConnect, json_encode(array(
                'points' => $safe_points,
                'rate_points' => 1000,
                'rate_amount' => 10000
            )));

            mysqli_begin_transaction($sqlConnect);

            $update_user = mysqli_query($sqlConnect, "
                UPDATE " . T_USERS . "
                SET `points` = `points` - {$safe_points}, `wallet` = `wallet` + {$safe_amount}
                WHERE `user_id` = {$user_id}
                  AND `points` >= {$safe_points}
                LIMIT 1
            ");

            if ($update_user && mysqli_affected_rows($sqlConnect) > 0) {
                $insert_log = mysqli_query($sqlConnect, "
                    INSERT INTO " . T_PAYMENT_TRANSACTIONS . " (`userid`, `kind`, `amount`, `notes`, `extra`)
                    VALUES ({$user_id}, 'POINTS_EXCHANGE', {$safe_amount}, '{$notes}', '{$extra}')
                ");

                if ($insert_log) {
                    mysqli_commit($sqlConnect);
                    cache($user_id, 'users', 'delete');

                    $response_data = array(
                        'api_status' => 200,
                        'success' => true,
                        'message' => 'Points exchanged successfully.',
                        'exchanged_points' => $safe_points,
                        'amount' => $safe_amount,
                        'points' => $new_points,
                        'wallet' => $new_wallet
                    );
                }
                else {
                    mysqli_rollback($sqlConnect);
                    $error_code = 4;
                    $error_message = 'Unable to record point exchange.';
                }
            }
            else {
                mysqli_rollback($sqlConnect);
                $error_code = 5;
                $error_message = 'Unable to exchange points.';
            }
        }
    }
}
