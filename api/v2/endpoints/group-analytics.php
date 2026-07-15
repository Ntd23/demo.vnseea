<?php
// English description: Returns group analytics buckets and aggregates for Nuxt group settings.

$response_data = array(
    'api_status' => 400,
);

if (!function_exists('Wo_GroupAnalyticsColumnExists')) {
    function Wo_GroupAnalyticsColumnExists($table, $column) {
        global $sqlConnect;

        $table = preg_replace('/[^A-Za-z0-9_]/', '', $table);
        $column = mysqli_real_escape_string($sqlConnect, $column);
        $query = mysqli_query($sqlConnect, "SHOW COLUMNS FROM `{$table}` LIKE '{$column}'");

        return $query && mysqli_num_rows($query) > 0;
    }
}

if (!function_exists('Wo_GroupAnalyticsFirstExistingColumn')) {
    function Wo_GroupAnalyticsFirstExistingColumn($table, $columns) {
        foreach ($columns as $column) {
            if (Wo_GroupAnalyticsColumnExists($table, $column)) {
                return $column;
            }
        }

        return '';
    }
}

if (!function_exists('Wo_GroupAnalyticsRange')) {
    function Wo_GroupAnalyticsRange($period) {
        $now = time();

        if ($period == 'year') {
            return array(
                'start' => strtotime('1 January ' . date('Y', $now) . ' 12:00am'),
                'end' => strtotime('31 December ' . date('Y', $now) . ' 11:59pm'),
                'labels' => array('T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'),
                'keys' => array('01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'),
                'format' => 'm',
            );
        }

        if ($period == 'month') {
            $days = cal_days_in_month(CAL_GREGORIAN, date('m', $now), date('Y', $now));
            $labels = array();
            $keys = array();

            for ($day = 1; $day <= $days; $day++) {
                $key = str_pad((string) $day, 2, '0', STR_PAD_LEFT);
                $labels[] = $key;
                $keys[] = $key;
            }

            return array(
                'start' => strtotime('1 ' . date('M', $now) . ' ' . date('Y', $now) . ' 12:00am'),
                'end' => strtotime($days . ' ' . date('M', $now) . ' ' . date('Y', $now) . ' 11:59pm'),
                'labels' => $labels,
                'keys' => $keys,
                'format' => 'd',
            );
        }

        if ($period == 'week') {
            $time = strtotime(date('l', $now) . ', ' . date('M', $now) . ' ' . date('d', $now) . ', ' . date('Y', $now));
            $week_start = date('l', $now) == 'Saturday'
                ? strtotime(date('M', $now) . ' ' . date('d', $now) . ', ' . date('Y', $now) . ' 12:00am')
                : strtotime('last saturday, 12:00am', $time);
            $week_end = date('l', $now) == 'Friday'
                ? strtotime(date('M', $now) . ' ' . date('d', $now) . ', ' . date('Y', $now) . ' 11:59pm')
                : strtotime('next Friday, 11:59pm', $time);

            return array(
                'start' => $week_start,
                'end' => $week_end,
                'labels' => array('T7', 'CN', 'T2', 'T3', 'T4', 'T5', 'T6'),
                'keys' => array('Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'),
                'format' => 'l',
            );
        }

        return array(
            'start' => strtotime(date('M', $now) . ' ' . date('d', $now) . ', ' . date('Y', $now) . ' 12:00am'),
            'end' => strtotime(date('M', $now) . ' ' . date('d', $now) . ', ' . date('Y', $now) . ' 11:59pm'),
            'labels' => array('00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'),
            'keys' => array('00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'),
            'format' => 'H',
        );
    }
}

if (empty($_POST['group_id'])) {
    $error_code = 3;
    $error_message = 'group_id (POST) is missing';
}

if (empty($error_code)) {
    $group_id = Wo_Secure($_POST['group_id']);
    $period = !empty($_POST['period']) && in_array($_POST['period'], array('day', 'week', 'month', 'year'))
        ? $_POST['period']
        : 'day';
    $group_data = Wo_GroupData($group_id);

    if (empty($group_data)) {
        $error_code = 6;
        $error_message = 'Group not found';
    } else if (empty($wo['user']['user_id'])) {
        $error_code = 7;
        $error_message = 'User not authenticated';
    } else if ((int) $group_data['user_id'] !== (int) $wo['user']['user_id'] && !Wo_IsCanGroupUpdate($group_id, 'analytics')) {
        $error_code = 8;
        $error_message = 'You do not have permission to view this group analytics';
    } else {
        $range = Wo_GroupAnalyticsRange($period);
        $members_by_key = array_fill_keys($range['keys'], 0);
        $chart = array();
        $start = (int) $range['start'];
        $end = (int) $range['end'];

        $members_query = mysqli_query($sqlConnect, "SELECT `time` FROM " . T_GROUP_MEMBERS . " WHERE `active` = '1' AND `group_id` = {$group_id} AND `time` >= {$start} AND `time` <= {$end}");
        if ($members_query && mysqli_num_rows($members_query)) {
            while ($row = mysqli_fetch_assoc($members_query)) {
                $key = date($range['format'], (int) $row['time']);
                if (array_key_exists($key, $members_by_key)) {
                    $members_by_key[$key] += 1;
                }
            }
        }

        foreach ($range['keys'] as $index => $key) {
            $chart[] = array(
                'label' => $range['labels'][$index],
                'likes' => (int) $members_by_key[$key],
                'views' => 0,
                'interactions' => 0,
            );
        }

        $total_members = Wo_CountGroupMembers($group_id);
        $total_posts = Wo_CountGroupPosts($group_id);

        $like_column = Wo_GroupAnalyticsFirstExistingColumn(T_POSTS, array('post_likes', 'likes', 'likes_count'));
        $comment_column = Wo_GroupAnalyticsFirstExistingColumn(T_POSTS, array('post_comments', 'comments', 'comments_count'));
        $share_column = Wo_GroupAnalyticsFirstExistingColumn(T_POSTS, array('post_share', 'post_shares', 'shares'));
        $view_column = Wo_GroupAnalyticsFirstExistingColumn(T_POSTS, array('post_views', 'views', 'view_count', 'videoViews'));
        $select_parts = array('COUNT(`id`) AS posts_total');
        $select_parts[] = !empty($like_column) ? "COALESCE(SUM(`{$like_column}`), 0) AS post_likes" : "0 AS post_likes";
        $select_parts[] = !empty($comment_column) ? "COALESCE(SUM(`{$comment_column}`), 0) AS post_comments" : "0 AS post_comments";
        $select_parts[] = !empty($share_column) ? "COALESCE(SUM(`{$share_column}`), 0) AS post_shares" : "0 AS post_shares";
        $select_parts[] = !empty($view_column) ? "COALESCE(SUM(`{$view_column}`), 0) AS post_views" : "0 AS post_views";
        $post_stats = array(
            'posts_total' => 0,
            'post_likes' => 0,
            'post_comments' => 0,
            'post_shares' => 0,
            'post_views' => 0,
        );
        $posts_in_period = 0;
        $posts_query = mysqli_query($sqlConnect, "SELECT " . implode(', ', $select_parts) . " FROM " . T_POSTS . " WHERE `group_id` = {$group_id}");

        if ($posts_query && mysqli_num_rows($posts_query)) {
            $post_stats = array_merge($post_stats, mysqli_fetch_assoc($posts_query));
        }

        $posts_period_query = mysqli_query($sqlConnect, "SELECT COUNT(`id`) AS count FROM " . T_POSTS . " WHERE `group_id` = {$group_id} AND `time` >= {$start} AND `time` <= {$end}");
        if ($posts_period_query && mysqli_num_rows($posts_period_query)) {
            $posts_period_data = mysqli_fetch_assoc($posts_period_query);
            $posts_in_period = (int) $posts_period_data['count'];
        }

        $interactions = (int) $post_stats['post_likes'] + (int) $post_stats['post_comments'] + (int) $post_stats['post_shares'];
        $views = (int) $post_stats['post_views'];
        $engagement_rate = $views > 0 ? round(($interactions / $views) * 100, 1) : 0;

        $response_data = array(
            'api_status' => 200,
            'period' => $period,
            'likes' => (int) $total_members,
            'likes_in_period' => (int) array_sum($members_by_key),
            'followers' => (int) $total_members,
            'posts' => (int) $total_posts,
            'posts_in_period' => (int) $posts_in_period,
            'interactions' => (int) $interactions,
            'views' => (int) $views,
            'engagement_rate' => (float) $engagement_rate,
            'chart' => $chart,
            'has_view_source' => !empty($view_column),
        );
    }
}
