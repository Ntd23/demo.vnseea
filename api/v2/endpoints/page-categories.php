<?php
// English description: Creates user-defined page categories and returns their persisted numeric identifiers.

$response_data = array(
    'api_status' => 400
);

$action = !empty($_POST['type']) ? Wo_Secure($_POST['type']) : '';

if ($action !== 'create') {
    $error_code = 4;
    $error_message = 'type must be create';
    return;
}

$category_name = !empty($_POST['name'])
    ? trim(strip_tags(html_entity_decode((string) $_POST['name'], ENT_QUOTES, 'UTF-8')))
    : '';
$category_length = function_exists('mb_strlen')
    ? mb_strlen($category_name, 'UTF-8')
    : strlen($category_name);

if ($category_length < 2 || $category_length > 80) {
    $error_code = 5;
    $error_message = 'category name must contain between 2 and 80 characters';
    return;
}

$normalized_name = function_exists('mb_strtolower')
    ? mb_strtolower($category_name, 'UTF-8')
    : strtolower($category_name);

foreach ($wo['page_categories'] as $category_id => $existing_name) {
    $decoded_name = trim(html_entity_decode((string) $existing_name, ENT_QUOTES, 'UTF-8'));
    $normalized_existing_name = function_exists('mb_strtolower')
        ? mb_strtolower($decoded_name, 'UTF-8')
        : strtolower($decoded_name);

    if ($normalized_existing_name === $normalized_name) {
        $response_data = array(
            'api_status' => 200,
            'category' => array(
                'value' => (string) $category_id,
                'label' => $decoded_name
            )
        );
        return;
    }
}

$insert_data = array(
    'type' => 'category'
);

foreach (Wo_LangsNamesFromDB() as $language) {
    $insert_data[$language] = Wo_Secure($category_name);
}

$language_id = $db->insert(T_LANGS, $insert_data);
if (empty($language_id)) {
    $error_code = 6;
    $error_message = 'unable to create category language';
    return;
}

$category_id = $db->insert(T_PAGES_CATEGORY, array(
    'lang_key' => (string) $language_id
));

if (empty($category_id)) {
    $db->where('id', $language_id)->delete(T_LANGS);
    $error_code = 7;
    $error_message = 'unable to create page category';
    return;
}

$db->where('id', $language_id)->update(T_LANGS, array(
    'lang_key' => (string) $language_id
));

$response_data = array(
    'api_status' => 200,
    'category' => array(
        'value' => (string) $category_id,
        'label' => $category_name
    )
);
