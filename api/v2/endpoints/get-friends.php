<?php
// English description: Returns a user's following and follower contacts with relationship activity timestamps.
// +------------------------------------------------------------------------+
// | @author Deen Doughouz (DoughouzForest)
// | @author_url 1: http://www.hisotechgroup.com
// | @author_url 2: http://codecanyon.net/user/doughouzforest
// | @author_email: wowondersocial@gmail.com   
// +------------------------------------------------------------------------+
// | WoWonder - The Ultimate Social Networking Platform
// | Copyright (c) 2018 WoWonder. All rights reserved.
// +------------------------------------------------------------------------+
if (empty($_POST['user_id'])) {
    $error_code    = 3;
    $error_message = 'user_id (POST) is missing';
}

$limit = (!empty($_POST['limit']) && is_numeric($_POST['limit']) && $_POST['limit'] > 0 && $_POST['limit'] <= 50 ? Wo_Secure($_POST['limit']) : 20);
$following_offset = (!empty($_POST['following_offset']) && is_numeric($_POST['following_offset']) && $_POST['following_offset'] > 0 ? Wo_Secure($_POST['following_offset']) : 0);
$followers_offset = (!empty($_POST['followers_offset']) && is_numeric($_POST['followers_offset']) && $_POST['followers_offset'] > 0 ? Wo_Secure($_POST['followers_offset']) : 0);
if (!empty($_POST['type'])) {
	$types = explode(",", $_POST['type']);
	$user_id = Wo_Secure($_POST['user_id']);
	$f_data = array('following' => [],'followers' => []);
	if (in_array('following', $types)) {
		$following = Wo_GetFollowing($user_id, 'profile', $limit,$following_offset);
		foreach ($following as $key2 => $user_list) {

			$lastseen = ($user_list['lastseen'] > (time() - 60)) ? 'on' : 'off';
            $following[$key2] = $user_list;
            $following[$key2]['lastseen_unix_time'] = $user_list['lastseen'];
            $following[$key2]['lastseen_time_text'] = Wo_Time_Elapsed_String($user_list['lastseen']);
            $following[$key2]['lastseen'] = $lastseen;
            $following[$key2]['user_platform'] = Wo_GetPlatformFromUser_ID($user_list['user_id']);
            $following[$key2]['is_following'] = (Wo_IsFollowing($user_list['user_id'],$wo['user']['user_id'])) ? 1 : 0;

			foreach ($non_allowed as $key => $value) {
	            unset($following[$key2][$value]);
	        }
		}
		
		$f_data['following'] = $following;
	}

	if (in_array('followers', $types)) {
		$following = Wo_GetFollowers($user_id, 'profile', $limit,$followers_offset);
		foreach ($following as $key2 => $user_list) {

			$lastseen = ($user_list['lastseen'] > (time() - 60)) ? 'on' : 'off';
            $following[$key2] = $user_list;
            $following[$key2]['lastseen_unix_time'] = $user_list['lastseen'];
            $following[$key2]['lastseen_time_text'] = Wo_Time_Elapsed_String($user_list['lastseen']);
            $following[$key2]['lastseen'] = $lastseen;
            $following[$key2]['user_platform'] = Wo_GetPlatformFromUser_ID($user_list['user_id']);
            $following[$key2]['is_following'] = (Wo_IsFollowing($user_list['user_id'],$wo['user']['user_id'])) ? 1 : 0;

			foreach ($non_allowed as $key => $value) {
	            unset($following[$key2][$value]);
	        }
		}

		$f_data['followers'] = $following;
	}

    $relationship_user_ids = array();
    foreach (array('following', 'followers') as $relationship_type) {
        foreach ($f_data[$relationship_type] as $relationship_user) {
            $relationship_user_id = !empty($relationship_user['user_id']) ? (int) $relationship_user['user_id'] : 0;
            if ($relationship_user_id > 0 && $relationship_user_id !== (int) $user_id) {
                $relationship_user_ids[$relationship_user_id] = $relationship_user_id;
            }
        }
    }

    $relationship_activity_times = array();
    if (!empty($relationship_user_ids)) {
        $current_user_id = (int) $user_id;
        $relationship_user_ids_sql = implode(',', $relationship_user_ids);
        $relationship_activity_query = mysqli_query(
            $sqlConnect,
            "SELECT
                relationship_events.`related_user_id`,
                MAX(relationship_events.`time`) AS `relationship_activity_at`
             FROM (
                SELECT
                    CASE
                        WHEN `user_id` = {$current_user_id} THEN `follow_id`
                        ELSE `user_id`
                    END AS `related_user_id`,
                    `time`
                FROM " . T_ACTIVITIES . "
                WHERE `activity_type` IN ('following', 'friend')
                AND (
                    (`user_id` = {$current_user_id} AND `follow_id` IN ({$relationship_user_ids_sql}))
                    OR
                    (`follow_id` = {$current_user_id} AND `user_id` IN ({$relationship_user_ids_sql}))
                )

                UNION ALL

                SELECT
                    CASE
                        WHEN `notifier_id` = {$current_user_id} THEN `recipient_id`
                        ELSE `notifier_id`
                    END AS `related_user_id`,
                    `time`
                FROM " . T_NOTIFICATION . "
                WHERE `type` IN ('following', 'accepted_request')
                AND (
                    (`notifier_id` = {$current_user_id} AND `recipient_id` IN ({$relationship_user_ids_sql}))
                    OR
                    (`recipient_id` = {$current_user_id} AND `notifier_id` IN ({$relationship_user_ids_sql}))
                )
             ) relationship_events
             GROUP BY `related_user_id`"
        );

        if ($relationship_activity_query) {
            while ($relationship_activity = mysqli_fetch_assoc($relationship_activity_query)) {
                $related_user_id = (int) $relationship_activity['related_user_id'];
                $relationship_activity_times[$related_user_id] = (int) $relationship_activity['relationship_activity_at'];
            }
        }
    }

    foreach (array('following', 'followers') as $relationship_type) {
        foreach ($f_data[$relationship_type] as $relationship_key => $relationship_user) {
            $relationship_user_id = !empty($relationship_user['user_id']) ? (int) $relationship_user['user_id'] : 0;
            $f_data[$relationship_type][$relationship_key]['relationship_activity_at'] = !empty($relationship_activity_times[$relationship_user_id])
                ? $relationship_activity_times[$relationship_user_id]
                : 0;
        }
    }

	$response_data = array(
			    'api_status' => 200,
			    'data' => $f_data
			);

}
else{
	$error_code    = 4;
    $error_message = 'type can not be empty';
}
