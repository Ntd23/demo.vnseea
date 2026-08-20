<?php

$endpoint = file_get_contents(__DIR__ . '/../api/v2/endpoints/fetch-recommended.php');
$helper = file_get_contents(__DIR__ . '/../assets/includes/functions_two.php');

$assertions = [
    'endpoint validates an offset cursor' => strpos($endpoint, '$_POST[\'offset\']') !== false,
    'endpoint requests latest page ordering' => strpos($endpoint, 'Wo_PageSug($limit, $offset, \'latest\')') !== false,
    'helper supports latest cursor mode' => strpos($helper, 'if ($type == "latest")') !== false,
    'helper orders page ids descending' => strpos($helper, 'ORDER BY `page_id` DESC') !== false,
];

foreach ($assertions as $label => $passed) {
    if (!$passed) {
        fwrite(STDERR, "FAIL: {$label}\n");
        exit(1);
    }
}

fwrite(STDOUT, "suggested pages pagination contract passed\n");
