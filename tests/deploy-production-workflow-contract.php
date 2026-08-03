<?php

// English description: Guards the staged v2-to-primary production deployment contract.

function assert_deploy_contract($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "deploy production contract failed: {$message}\n");
        exit(1);
    }
}

$root = dirname(__DIR__);
$workflow_path = $root . '/.github/workflows/deploy-production.yml';
$script_path = $root . '/scripts/deploy-production.sh';

assert_deploy_contract(is_file($workflow_path), 'workflow file must exist');
assert_deploy_contract(is_file($script_path), 'server deployment script must exist');

$workflow = file_get_contents($workflow_path);
$script = file_get_contents($script_path);

assert_deploy_contract(
    strpos($workflow, 'RELEASE_SHA: ${{ github.sha }}') !== false &&
        strpos($workflow, 'PRIMARY_DEPLOY_PATH') !== false &&
        strpos($workflow, 'bash scripts/deploy-production.sh') !== false,
    'workflow must pass the exact commit and both deployment roots to the script'
);
assert_deploy_contract(
    strpos($workflow, 'deploy-v2:') !== false &&
        strpos($workflow, 'deploy-primary:') !== false &&
        strpos($workflow, 'needs: deploy-v2') !== false &&
        strpos($workflow, 'DEPLOY_STAGE: v2') !== false &&
        strpos($workflow, 'DEPLOY_STAGE: primary') !== false,
    'primary deployment must be a separate job gated by the v2 job'
);
assert_deploy_contract(
    strpos($workflow, 'V2_NODE_CONFIG_BACKUP') !== false &&
        substr_count($workflow, 'nodejs/config.json') >= 2,
    'v2 checkout must preserve its tracked database configuration'
);

assert_deploy_contract(
    strpos($script, 'smoke_test_target "$V2_BASE_URL"') !== false &&
        strpos($script, 'promote_primary_source') !== false &&
        strpos($workflow, 'needs: deploy-v2') !== false,
    'v2 smoke tests must complete before primary source promotion'
);

foreach (array(
    '/config.php',
    '/client/.env',
    '/nodejs/config.json',
    '/upload',
    '/cache',
    '/xhr/logs',
    '/client/.output',
    '/client/node_modules',
    '/nodejs/node_modules',
    '/social',
) as $protected_path) {
    assert_deploy_contract(
        strpos($script, $protected_path) !== false,
        "deployment must protect {$protected_path}"
    );
}

assert_deploy_contract(
    strpos($script, 'vnseea-client') !== false &&
        strpos($script, 'vnseea-realtime') !== false &&
        strpos($script, 'vnseea-web') !== false &&
        strpos($script, 'vnseea-web-realtime') !== false,
    'each domain must restart its own Nuxt and realtime PM2 processes'
);

assert_deploy_contract(
    strpos($script, 'curl --fail') !== false &&
        strpos($script, '/api/get-site-settings') !== false &&
        strpos($script, 'NUXT_BACKEND_SERVER_KEY') !== false &&
        strpos($script, '--data-urlencode') !== false &&
        strpos($script, 'transport=polling') !== false,
    'each stage must strictly test Nuxt, PHP API and Socket.IO'
);

assert_deploy_contract(
    strpos($script, 'rollback_target') !== false &&
        strpos($script, '.output.previous') !== false,
    'failed builds or smoke tests must restore the previous runtime'
);

assert_deploy_contract(
    strpos($script, 'pm2 restart vnseea-mobile') === false &&
        strpos($script, 'pm2 start vnseea-mobile') === false,
    'deployment must not start or restart a second mobile Socket.IO process'
);

echo "deploy production workflow contract: ok\n";
