<?php
// English description: Returns wallet balance, top-up capabilities, and transaction history for the Nuxt wallet bridge.

$response_data = array(
    'api_status' => 400
);

if (empty($wo['user']) || empty($wo['user']['id'])) {
    $error_code = 1;
    $error_message = 'User is not authenticated';
}
else {
    $currency = !empty($wo['config']['ads_currency']) ? $wo['config']['ads_currency'] : $wo['config']['currency'];
    $currency_symbol = Wo_GetCurrency($currency);
    $currency_rule = Wo_GetCurrencyRule($currency);
    $transactions = array();
    $raw_transactions = Wo_GetMytransactions();

    if (!empty($raw_transactions) && is_array($raw_transactions)) {
        foreach ($raw_transactions as $transaction) {
            $transactions[] = array(
                'id' => (int) $transaction['id'],
                'kind' => !empty($transaction['kind']) ? (string) $transaction['kind'] : '',
                'notes' => !empty($transaction['notes']) ? strip_tags((string) $transaction['notes']) : '',
                'amount' => isset($transaction['amount']) ? (float) $transaction['amount'] : 0,
                'transaction_dt' => !empty($transaction['transaction_dt']) ? (string) $transaction['transaction_dt'] : '',
            );
        }
    }

    $topup_methods = array();

    if (!empty($wo['config']['paypal']) && $wo['config']['paypal'] == 'yes') {
        $topup_methods[] = array(
            'value' => 'paypal',
            'label' => !empty($wo['lang']['paypal']) ? $wo['lang']['paypal'] : 'PayPal',
            'type' => 'redirect'
        );
    }

    if (!empty($wo['config']['bank_payment']) && $wo['config']['bank_payment'] == '1') {
        $topup_methods[] = array(
            'value' => 'bank_transfer',
            'label' => !empty($wo['lang']['bank_transfer']) ? $wo['lang']['bank_transfer'] : 'Bank Transfer',
            'type' => 'upload',
            'note' => !empty($wo['config']['bank_transfer_note']) ? strip_tags((string) $wo['config']['bank_transfer_note']) : ''
        );
    }

    if (!empty($wo['config']['sepay']) && in_array((string) $wo['config']['sepay'], array('1', 'yes', 'true', 'on'), true)) {
        $topup_methods[] = array(
            'value' => 'sepay',
            'label' => 'SePay VietQR',
            'type' => 'qr',
            'note' => !empty($wo['config']['sepay_bank_code']) ? (string) $wo['config']['sepay_bank_code'] : ''
        );
    }

    $can_withdraw = (
        (!empty($wo['config']['affiliate_system']) && $wo['config']['affiliate_system'] == 1)
        || (!empty($wo['config']['point_allow_withdrawal']) && $wo['config']['point_allow_withdrawal'] == 1)
        || (!empty($wo['config']['funding_system']) && $wo['config']['funding_system'] == 1)
        || (!empty($wo['config']['store_system']) && $wo['config']['store_system'] == 'on')
    );

    $response_data = array(
        'api_status' => 200,
        'balance' => isset($wo['user']['wallet']) ? (float) $wo['user']['wallet'] : 0,
        'withdrawable_balance' => isset($wo['user']['balance']) ? (float) $wo['user']['balance'] : 0,
        'currency' => $currency,
        'currency_symbol' => $currency_symbol,
        'currency_rule' => $currency_rule,
        'transactions' => $transactions,
        'topup_methods' => $topup_methods,
        'can_withdraw' => $can_withdraw ? true : false,
        'current_user' => array(
            'id' => (int) $wo['user']['user_id'],
            'name' => !empty($wo['user']['name']) ? $wo['user']['name'] : '',
            'username' => !empty($wo['user']['username']) ? $wo['user']['username'] : '',
            'avatar' => !empty($wo['user']['avatar']) ? $wo['user']['avatar'] : '',
        ),
    );
}
