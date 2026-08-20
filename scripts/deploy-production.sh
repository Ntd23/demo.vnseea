#!/usr/bin/env bash

# Deploys one release in two explicit stages: v2 validation, then primary promotion.

set -Eeuo pipefail
IFS=$'\n\t'

DEPLOY_STAGE="${DEPLOY_STAGE:-}"
RELEASE_SHA="${RELEASE_SHA:-}"
V2_DEPLOY_PATH="${V2_DEPLOY_PATH:-}"
PRIMARY_DEPLOY_PATH="${PRIMARY_DEPLOY_PATH:-/home/vnseea/main}"
PNPM_BIN="${PNPM_BIN:-/root/.local/share/pnpm/bin/pnpm}"
V2_BASE_URL="${V2_BASE_URL:-https://v2.vnseea.vn}"
PRIMARY_BASE_URL="${PRIMARY_BASE_URL:-https://vnseea.vn}"
DEPLOY_STATE_DIR="${DEPLOY_STATE_DIR:-/home/vnseea/.deploy}"
PUSH_WORKER_SERVICE="${PUSH_WORKER_SERVICE:-vnseea-push-worker.service}"

V2_CLIENT_PROCESS="vnseea-client"
PRIMARY_CLIENT_PROCESS="vnseea-web"
PRIMARY_REALTIME_PROCESS="vnseea-web-realtime"
OBSOLETE_REALTIME_PROCESSES=(
    "vnseea-realtime"
    "vnseea-mobile-main-socketclear"
)

release_tree=''
new_manifest=''
stale_manifest=''

log() {
    printf '[deploy:%s] %s\n' "${DEPLOY_STAGE:-unknown}" "$*"
}

fail() {
    log "ERROR: $*"
    exit 1
}

cleanup() {
    if [[ -n "$release_tree" && -d "$release_tree" ]]; then
        rm -rf -- "$release_tree"
    fi
    if [[ -n "$new_manifest" && -f "$new_manifest" ]]; then
        rm -f -- "$new_manifest"
    fi
    if [[ -n "$stale_manifest" && -f "$stale_manifest" ]]; then
        rm -f -- "$stale_manifest"
    fi
}
trap cleanup EXIT

require_command() {
    command -v "$1" >/dev/null 2>&1 || fail "required command not found: $1"
}

validate_deploy_root() {
    local root="$1"
    local label="$2"
    [[ "$root" == /home/* && "$root" != /home && "$root" != /home/ ]] ||
        fail "$label deploy root is unsafe: $root"
    [[ -d "$root/client" ]] || fail "$label client directory not found: $root/client"
}

safe_remove_client_dir() {
    local root="$1"
    local relative="$2"
    local target="$root/client/$relative"
    [[ "$target" == "$root/client/"* ]] || fail "refusing to remove unsafe path: $target"
    if [[ -e "$target" || -L "$target" ]]; then
        rm -rf -- "$target"
    fi
}

rollback_target() {
    local root="$1"
    local process_name="$2"
    local client_dir="$root/client"

    pm2 stop "$process_name" >/dev/null 2>&1 || true
    if [[ -d "$client_dir/.output.previous" ]]; then
        safe_remove_client_dir "$root" '.output'
        mv "$client_dir/.output.previous" "$client_dir/.output"
    fi
    if [[ -f "$client_dir/.output/server/index.mjs" ]]; then
        pm2 restart "$process_name" --update-env >/dev/null
    fi
}

build_nuxt_target() {
    local root="$1"
    local process_name="$2"
    local client_dir="$root/client"

    log "Install dependencies for $process_name"
    (
        cd "$client_dir"
        "$PNPM_BIN" install --frozen-lockfile
    ) || return 1

    log "Build Nuxt for $process_name"
    pm2 stop "$process_name" >/dev/null 2>&1 || true

    safe_remove_client_dir "$root" '.output.previous'
    if [[ -d "$client_dir/.output" ]]; then
        mv "$client_dir/.output" "$client_dir/.output.previous"
    fi
    safe_remove_client_dir "$root" '.nuxt'
    safe_remove_client_dir "$root" 'node_modules/.vite'

    if ! (
        cd "$client_dir"
        NODE_OPTIONS='--max-old-space-size=4096' "$PNPM_BIN" build
    ) || [[ ! -f "$client_dir/.output/server/index.mjs" ]]; then
        log "Nuxt build failed for $process_name; restoring previous output"
        rollback_target "$root" "$process_name"
        return 1
    fi

    if ! pm2 restart "$process_name" --update-env >/dev/null; then
        log "PM2 restart failed for $process_name; restoring previous output"
        rollback_target "$root" "$process_name"
        return 1
    fi
}

finalize_output() {
    local root="$1"
    safe_remove_client_dir "$root" '.output.previous'
}

reload_php() {
    systemctl reload php8.3-fpm >/dev/null 2>&1 ||
        systemctl restart php8.3-fpm >/dev/null
}

restart_push_worker() {
    log "Restart dedicated push worker"
    systemctl restart "$PUSH_WORKER_SERVICE" >/dev/null &&
        systemctl is-active --quiet "$PUSH_WORKER_SERVICE"
}

restart_realtime() {
    local root="$1"
    local process_name="$2"
    (
        cd "$root/client"
        REALTIME_PROCESS_NAME="$process_name" \
            pm2 startOrReload ecosystem.config.cjs \
                --only "$process_name" --update-env >/dev/null
    )
}

retire_obsolete_realtime() {
    local process_name
    for process_name in "${OBSOLETE_REALTIME_PROCESSES[@]}"; do
        [[ "$process_name" == "$PRIMARY_REALTIME_PROCESS" ]] && continue
        pm2 delete "$process_name" >/dev/null 2>&1 || true
    done
}

run_realtime_contract_tests() {
    local root="$1"
    (
        cd "$root/client"
        node --test \
            scripts/message-realtime-server.test.mjs \
            scripts/post-realtime-server.test.mjs \
            scripts/livekit-realtime-server.test.mjs
    )
}

curl_with_retry() {
    curl --fail --silent --show-error --location \
        --connect-timeout 5 --max-time 20 \
        --retry 5 --retry-delay 2 --retry-connrefused "$@"
}

read_env_value() {
    local env_file="$1"
    local key="$2"
    local line
    local value

    line="$(grep -m1 -E "^${key}=" "$env_file" 2>/dev/null || true)"
    value="${line#*=}"
    value="${value%$'\r'}"
    if [[ "$value" == \"*\" && "$value" == *\" ]]; then
        value="${value:1:${#value}-2}"
    elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
        value="${value:1:${#value}-2}"
    fi
    printf '%s' "$value"
}

smoke_test_target() {
    local base_url="$1"
    local root="$2"
    local api_response
    local socket_response
    local server_key

    server_key="$(read_env_value "$root/client/.env" 'NUXT_BACKEND_SERVER_KEY')"
    [[ -n "$server_key" ]] || {
        log "NUXT_BACKEND_SERVER_KEY is missing for $base_url"
        return 1
    }

    log "Smoke test Nuxt at $base_url"
    curl_with_retry "$base_url/home" >/dev/null

    log "Smoke test PHP API at $base_url"
    api_response="$(curl_with_retry --get \
        --data-urlencode "server_key=$server_key" \
        "$base_url/api/get-site-settings")"
    grep -Eq '"api_status"[[:space:]]*:[[:space:]]*200' <<<"$api_response" ||
        return 1

    log "Smoke test Socket.IO v4 at $base_url"
    socket_response="$(curl_with_retry "$base_url/socket.io/?EIO=4&transport=polling")"
    grep -Eq '^0.*"sid"' <<<"$socket_response" || return 1
}

install_dependencies_best_effort() {
    local root="$1"
    (
        cd "$root/client"
        "$PNPM_BIN" install --frozen-lockfile
    ) || log "WARNING: could not restore dependencies for $root"
}

rollback_v2_source() {
    local previous_sha="${PREVIOUS_V2_SHA:-}"
    [[ -n "$previous_sha" ]] || return 0
    git -C "$V2_DEPLOY_PATH" cat-file -e "$previous_sha^{commit}" 2>/dev/null || return 0

    log "Restore v2 source to $previous_sha"
    git -C "$V2_DEPLOY_PATH" reset --hard "$previous_sha" >/dev/null
    git -C "$V2_DEPLOY_PATH" clean -fd -- \
        client/app client/server client/src client/realtime client/scripts >/dev/null
    install_dependencies_best_effort "$V2_DEPLOY_PATH"
    reload_php
}

is_protected_primary_path() {
    case "$1" in
        config.php|client/.env|client/.env.*|nodejs/config.json|nodejs/models/wo_langs.js|\
        upload|upload/*|upload*.zip|cache|cache/*|xhr/logs|xhr/logs/*|logs|logs/*|\
        client/.output|client/.output/*|client/.nuxt|client/.nuxt/*|\
        client/node_modules|client/node_modules/*|nodejs/node_modules|nodejs/node_modules/*|\
        social|social/*|vnseea.sql)
            return 0
            ;;
    esac
    return 1
}

prepare_release_tree() {
    local sha="$1"

    release_tree="$(mktemp -d "$DEPLOY_STATE_DIR/release-${sha:0:12}.XXXXXX")" || return 1
    new_manifest="$(mktemp "$DEPLOY_STATE_DIR/manifest-${sha:0:12}.XXXXXX")" || return 1
    git -C "$V2_DEPLOY_PATH" archive "$sha" |
        tar -xf - -C "$release_tree" || return 1
    git -C "$V2_DEPLOY_PATH" ls-tree -r --name-only "$sha" |
        LC_ALL=C sort >"$new_manifest" || return 1
}

promote_primary_source() {
    local sha="$1"
    local manifest="$DEPLOY_STATE_DIR/primary-tracked-files.txt"
    local fallback_sha="${PRIMARY_BASE_SHA:-}"
    local target
    local relative

    cleanup
    release_tree=''
    new_manifest=''
    stale_manifest=''
    prepare_release_tree "$sha" || return 1

    if [[ ! -f "$manifest" && -n "$fallback_sha" ]] &&
        git -C "$V2_DEPLOY_PATH" cat-file -e "$fallback_sha^{commit}" 2>/dev/null; then
        git -C "$V2_DEPLOY_PATH" ls-tree -r --name-only "$fallback_sha" |
            LC_ALL=C sort >"$manifest" || return 1
    fi

    if [[ -f "$manifest" ]]; then
        stale_manifest="$(mktemp "$DEPLOY_STATE_DIR/stale-${sha:0:12}.XXXXXX")" || return 1
        LC_ALL=C comm -23 "$manifest" "$new_manifest" >"$stale_manifest" || return 1
        while IFS= read -r relative; do
            [[ -n "$relative" ]] || continue
            is_protected_primary_path "$relative" && continue
            target="$PRIMARY_DEPLOY_PATH/$relative"
            [[ "$target" == "$PRIMARY_DEPLOY_PATH/"* ]] ||
                fail "refusing to remove unsafe primary path: $target"
            if [[ -f "$target" || -L "$target" ]]; then
                rm -f -- "$target" || return 1
            fi
        done <"$stale_manifest"
        rm -f -- "$stale_manifest"
        stale_manifest=''
    fi

    log "Promote source $sha to $PRIMARY_DEPLOY_PATH"
    # Record the intended tracked set before rsync so a partial transfer can be
    # rolled back without leaving files introduced by the failed release.
    cp "$new_manifest" "$manifest" || return 1
    rsync -a --no-owner --no-group --no-perms \
        --exclude='/config.php' \
        --exclude='/client/.env' \
        --exclude='/client/.env.*' \
        --exclude='/nodejs/config.json' \
        --exclude='/nodejs/models/wo_langs.js' \
        --exclude='/upload/' \
        --exclude='/upload*/' \
        --exclude='/upload*.zip' \
        --exclude='/cache/' \
        --exclude='/xhr/logs/' \
        --exclude='/logs/' \
        --exclude='/client/.output/' \
        --exclude='/client/.nuxt/' \
        --exclude='/client/node_modules/' \
        --exclude='/nodejs/node_modules/' \
        --exclude='/social/' \
        --exclude='/vnseea.sql' \
        "$release_tree/" "$PRIMARY_DEPLOY_PATH/" || return 1

    printf '%s\n' "$sha" >"$DEPLOY_STATE_DIR/primary-source.sha" || return 1
    cleanup
    release_tree=''
    new_manifest=''
    stale_manifest=''
}

primary_rollback_sha() {
    local success_file="$DEPLOY_STATE_DIR/primary-success.sha"
    if [[ -s "$success_file" ]]; then
        cat "$success_file"
    elif [[ -n "${PRIMARY_BASE_SHA:-}" ]]; then
        printf '%s\n' "$PRIMARY_BASE_SHA"
    fi
}

rollback_primary_source() {
    local rollback_sha="$1"
    [[ -n "$rollback_sha" ]] || {
        log 'WARNING: no primary source rollback SHA is available'
        return 0
    }
    git -C "$V2_DEPLOY_PATH" cat-file -e "$rollback_sha^{commit}" 2>/dev/null || {
        log "WARNING: primary rollback commit is unavailable: $rollback_sha"
        return 0
    }

    log "Restore primary source to $rollback_sha"
    promote_primary_source "$rollback_sha"
    install_dependencies_best_effort "$PRIMARY_DEPLOY_PATH"
    if ! reload_php; then
        rollback_target "$V2_DEPLOY_PATH" "$V2_CLIENT_PROCESS"
        rollback_v2_source
        fail 'PHP-FPM reload failed after v2 build; primary promotion was not started'
    fi
    restart_realtime "$PRIMARY_DEPLOY_PATH" "$PRIMARY_REALTIME_PROCESS" || true
}

deploy_v2() {
    local current_sha
    current_sha="$(git -C "$V2_DEPLOY_PATH" rev-parse HEAD)"
    [[ "$current_sha" == "$RELEASE_SHA" ]] ||
        fail "v2 checkout is $current_sha, expected $RELEASE_SHA"

    if ! run_realtime_contract_tests "$V2_DEPLOY_PATH"; then
        rollback_v2_source
        fail 'Socket.IO v4 relay contract tests failed; primary promotion was not started'
    fi

    if ! build_nuxt_target "$V2_DEPLOY_PATH" "$V2_CLIENT_PROCESS"; then
        rollback_v2_source
        fail 'v2 Nuxt build failed; primary promotion was not started'
    fi

    reload_php
    if ! smoke_test_target "$V2_BASE_URL" "$V2_DEPLOY_PATH"; then
        rollback_target "$V2_DEPLOY_PATH" "$V2_CLIENT_PROCESS"
        rollback_v2_source
        fail 'v2 smoke test failed; primary promotion was not started'
    fi

    finalize_output "$V2_DEPLOY_PATH"
    printf '%s\n' "$RELEASE_SHA" >"$DEPLOY_STATE_DIR/v2-success.sha"
    printf '%s\n' "${PREVIOUS_V2_SHA:-}" >"$DEPLOY_STATE_DIR/v2-previous.sha"
    pm2 save >/dev/null
    log 'v2 deployment and smoke tests passed'
}

deploy_primary() {
    local validated_sha
    local rollback_sha

    [[ -s "$DEPLOY_STATE_DIR/v2-success.sha" ]] ||
        fail 'v2 success marker is missing'
    validated_sha="$(cat "$DEPLOY_STATE_DIR/v2-success.sha")"
    [[ "$validated_sha" == "$RELEASE_SHA" ]] ||
        fail "v2 validated $validated_sha, not $RELEASE_SHA"

    if [[ -z "${PRIMARY_BASE_SHA:-}" && -s "$DEPLOY_STATE_DIR/v2-previous.sha" ]]; then
        PRIMARY_BASE_SHA="$(cat "$DEPLOY_STATE_DIR/v2-previous.sha")"
    fi
    rollback_sha="$(primary_rollback_sha)"

    if ! promote_primary_source "$RELEASE_SHA"; then
        rollback_primary_source "$rollback_sha" || true
        fail 'primary source promotion failed and rollback was attempted'
    fi
    if ! build_nuxt_target "$PRIMARY_DEPLOY_PATH" "$PRIMARY_CLIENT_PROCESS"; then
        rollback_primary_source "$rollback_sha"
        fail 'primary Nuxt build failed and the previous release was restored'
    fi

    if ! reload_php; then
        rollback_target "$PRIMARY_DEPLOY_PATH" "$PRIMARY_CLIENT_PROCESS"
        rollback_primary_source "$rollback_sha"
        fail 'PHP-FPM reload failed and the previous primary release was restored'
    fi
    if ! restart_realtime "$PRIMARY_DEPLOY_PATH" "$PRIMARY_REALTIME_PROCESS" ||
        ! smoke_test_target "$PRIMARY_BASE_URL" "$PRIMARY_DEPLOY_PATH"; then
        rollback_target "$PRIMARY_DEPLOY_PATH" "$PRIMARY_CLIENT_PROCESS"
        rollback_primary_source "$rollback_sha"
        fail 'primary smoke test failed and the previous release was restored'
    fi
    if ! restart_push_worker; then
        fail 'primary release passed smoke tests but the push worker could not be restarted'
    fi

    finalize_output "$PRIMARY_DEPLOY_PATH"
    printf '%s\n' "$RELEASE_SHA" >"$DEPLOY_STATE_DIR/primary-success.sha"
    retire_obsolete_realtime
    pm2 save >/dev/null
    log 'primary deployment and smoke tests passed'
}

require_command git
require_command rsync
require_command tar
require_command curl
require_command pm2
[[ -x "$PNPM_BIN" ]] || fail "pnpm binary is not executable: $PNPM_BIN"
[[ "$RELEASE_SHA" =~ ^[0-9a-fA-F]{40}$ ]] || fail 'RELEASE_SHA must be a full Git commit SHA'
validate_deploy_root "$V2_DEPLOY_PATH" 'v2'
validate_deploy_root "$PRIMARY_DEPLOY_PATH" 'primary'
mkdir -p "$DEPLOY_STATE_DIR"

case "$DEPLOY_STAGE" in
    v2)
        deploy_v2
        ;;
    primary)
        deploy_primary
        ;;
    *)
        fail "DEPLOY_STAGE must be v2 or primary, got: $DEPLOY_STAGE"
        ;;
esac
