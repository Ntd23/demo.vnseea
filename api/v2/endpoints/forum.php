<?php
// English description: Exposes forum browsing, members, search, owner lists, and mutations for the Nuxt forum bridge.

$response_data = array(
    'api_status' => 400
);

$limit = (!empty($_POST['limit']) && is_numeric($_POST['limit']) && $_POST['limit'] > 0 && $_POST['limit'] <= 50) ? Wo_Secure($_POST['limit']) : 20;
$offset = (!empty($_POST['offset']) && is_numeric($_POST['offset']) && $_POST['offset'] > 0) ? Wo_Secure($_POST['offset']) : 0;
$keyword = !empty($_POST['keyword']) ? Wo_Secure($_POST['keyword']) : '';
$action = !empty($_POST['action']) ? Wo_Secure($_POST['action']) : 'catalog';
$is_forum_admin = $wo['loggedin'] && (Wo_IsAdmin() || Wo_IsModerator());

if ($wo['config']['forum'] == 0) {
    $error_code = 5;
    $error_message = 'forum is disabled';
}

if (empty($error_code)) {
    if ($action == 'members') {
        if ($wo['loggedin'] == false) {
            $response_data = array(
                'api_status' => 401,
                'errors' => array('error_text' => 'login is required')
            );
        } else {
            $letter = !empty($_POST['letter']) ? strtolower(Wo_Secure($_POST['letter'])) : '';
            if (!preg_match('/^[a-z]$/', $letter)) {
                $letter = '';
            }

            $members = Wo_GetForumUsers(array(
                'offset' => $offset,
                'key' => $letter,
                'name' => $keyword
            ));
            $member_limit = 10;

            $response_data = array(
                'api_status' => 200,
                'members' => $members,
                'has_more' => count($members) >= $member_limit,
                'next_offset' => !empty($members) ? end($members)['user_id'] : null
            );
        }
    } else if ($action == 'search') {
        $search_in = !empty($_POST['search_in']) ? Wo_Secure($_POST['search_in']) : 'threads';
        $search_content = !empty($_POST['search_content']) && $_POST['search_content'] == '1';
        $section_id = (!empty($_POST['section_id']) && is_numeric($_POST['section_id'])) ? Wo_Secure($_POST['section_id']) : 0;

        if (strlen($keyword) < 4) {
            $response_data = array(
                'api_status' => 400,
                'errors' => array('error_text' => 'search terms must contain at least 4 characters')
            );
        } else if (!in_array($search_in, array('forums', 'threads', 'messages'))) {
            $response_data = array(
                'api_status' => 400,
                'errors' => array('error_text' => 'invalid forum search scope')
            );
        } else if ($search_in == 'forums') {
            $sections = Wo_GetForumSec(array(
                'search' => true,
                'id' => $section_id,
                'keyword' => $keyword,
                'forums' => true,
                'limit' => $limit,
                'offset' => $offset
            ));

            $response_data = array(
                'api_status' => 200,
                'result_type' => 'forums',
                'sections' => $sections,
                'threads' => array(),
                'messages' => array(),
                'has_more' => count($sections) >= $limit,
                'next_offset' => !empty($sections) ? end($sections)['id'] : null
            );
        } else if ($search_in == 'threads') {
            $threads = Wo_GetForumThreads(array(
                'search' => true,
                'offset' => $offset,
                'limit' => $limit,
                'subject' => $keyword,
                'post' => $search_content ? $keyword : false,
                'preview' => true
            ));
            foreach ($threads as $key => $thread) {
                $threads[$key]['forum_data'] = Wo_GetForum($thread['forum']);
                $threads[$key]['is_owner'] = $wo['loggedin'] && $thread['user'] == $wo['user']['id'];
                $threads[$key]['is_admin'] = $is_forum_admin;
            }

            $response_data = array(
                'api_status' => 200,
                'result_type' => 'threads',
                'sections' => array(),
                'threads' => $threads,
                'messages' => array(),
                'has_more' => count($threads) >= $limit,
                'next_offset' => !empty($threads) ? end($threads)['id'] : null
            );
        } else {
            $messages = Wo_SearchThreadReplies(array(
                'subject' => $keyword,
                'reply' => $search_content ? $keyword : false,
                'limit' => 1
            ));
            $target_thread_id = !empty($messages[0]['thread_id']) ? $messages[0]['thread_id'] : null;
            $target_forum_id = !empty($messages[0]['forum_id']) ? $messages[0]['forum_id'] : null;

            $response_data = array(
                'api_status' => 200,
                'result_type' => 'messages',
                'sections' => array(),
                'threads' => array(),
                'messages' => $messages,
                'target_thread_id' => $target_thread_id,
                'target_forum_id' => $target_forum_id,
                'has_more' => false,
                'next_offset' => null
            );
        }
    } else if ($action == 'my_messages') {
        if ($wo['loggedin'] == false) {
            $response_data = array(
                'api_status' => 401,
                'errors' => array('error_text' => 'login is required')
            );
        } else {
            $messages = Wo_GetMyReplies(array(
                'offset' => $offset,
                'limit' => $limit
            ));

            $response_data = array(
                'api_status' => 200,
                'messages' => $messages,
                'has_more' => count($messages) >= $limit,
                'next_offset' => !empty($messages) ? end($messages)['id'] : null
            );
        }
    } else if ($action == 'update_thread') {
        $thread_id = (!empty($_POST['thread_id']) && is_numeric($_POST['thread_id'])) ? Wo_Secure($_POST['thread_id']) : 0;
        $headline = !empty($_POST['headline']) ? trim($_POST['headline']) : '';
        $topicpost = !empty($_POST['topicpost']) ? trim($_POST['topicpost']) : '';
        $can_manage_thread = $wo['loggedin'] && $thread_id && (Wo_IsThreadOwner($thread_id) || Wo_IsAdmin() || Wo_IsModerator());

        if ($wo['loggedin'] == false) {
            $response_data = array(
                'api_status' => 401,
                'errors' => array('error_text' => 'login is required')
            );
        } else if (!$can_manage_thread) {
            $response_data = array(
                'api_status' => 403,
                'errors' => array('error_text' => 'you can not edit this thread')
            );
        } else if (strlen($headline) < 10 || empty($topicpost)) {
            $response_data = array(
                'api_status' => 400,
                'errors' => array('error_text' => 'invalid thread payload')
            );
        } else if (Wo_UpdateTopic($thread_id, array(
            'headline' => Wo_Secure($headline),
            'post' => Wo_BbcodeSecure($topicpost)
        ))) {
            $threads = Wo_GetForumThreads(array('id' => $thread_id, 'preview' => true));
            if (!empty($threads[0])) {
                $threads[0]['forum_data'] = Wo_GetForum($threads[0]['forum']);
                $threads[0]['is_owner'] = $threads[0]['user'] == $wo['user']['id'];
                $threads[0]['is_admin'] = $is_forum_admin;
            }

            $response_data = array(
                'api_status' => 200,
                'thread' => !empty($threads[0]) ? $threads[0] : null,
                'message' => 'thread updated'
            );
        } else {
            $response_data = array(
                'api_status' => 500,
                'errors' => array('error_text' => 'unable to update thread')
            );
        }
    } else if ($action == 'delete_thread') {
        $thread_id = (!empty($_POST['thread_id']) && is_numeric($_POST['thread_id'])) ? Wo_Secure($_POST['thread_id']) : 0;
        $can_manage_thread = $wo['loggedin'] && $thread_id && (Wo_IsThreadOwner($thread_id) || Wo_IsAdmin() || Wo_IsModerator());

        if ($wo['loggedin'] == false) {
            $response_data = array(
                'api_status' => 401,
                'errors' => array('error_text' => 'login is required')
            );
        } else if (!$can_manage_thread) {
            $response_data = array(
                'api_status' => 403,
                'errors' => array('error_text' => 'you can not delete this thread')
            );
        } else if (Wo_DeleteForumThread($thread_id)) {
            $response_data = array(
                'api_status' => 200,
                'deleted_id' => $thread_id,
                'message' => 'thread deleted'
            );
        } else {
            $response_data = array(
                'api_status' => 500,
                'errors' => array('error_text' => 'unable to delete thread')
            );
        }
    } else if ($action == 'update_reply') {
        $reply_id = (!empty($_POST['reply_id']) && is_numeric($_POST['reply_id'])) ? Wo_Secure($_POST['reply_id']) : 0;
        $subject = !empty($_POST['subject']) ? trim($_POST['subject']) : '';
        $content = !empty($_POST['content']) ? trim($_POST['content']) : '';
        $can_manage_reply = $wo['loggedin'] && $reply_id && (Wo_IsReplyOwner($reply_id) || Wo_IsAdmin() || Wo_IsModerator());

        if ($wo['loggedin'] == false) {
            $response_data = array(
                'api_status' => 401,
                'errors' => array('error_text' => 'login is required')
            );
        } else if (!$can_manage_reply) {
            $response_data = array(
                'api_status' => 403,
                'errors' => array('error_text' => 'you can not edit this reply')
            );
        } else if (strlen($subject) < 10 || empty($content)) {
            $response_data = array(
                'api_status' => 400,
                'errors' => array('error_text' => 'invalid reply payload')
            );
        } else if (Wo_ThreadUpdate($reply_id, array(
            'post_subject' => Wo_Secure($subject),
            'post_text' => Wo_BbcodeSecure($content)
        ))) {
            $replies = Wo_GetThreadReplies(array('id' => $reply_id));
            $response_data = array(
                'api_status' => 200,
                'reply' => !empty($replies[0]) ? $replies[0] : null,
                'message' => 'reply updated'
            );
        } else {
            $response_data = array(
                'api_status' => 500,
                'errors' => array('error_text' => 'unable to update reply')
            );
        }
    } else if ($action == 'delete_reply') {
        $reply_id = (!empty($_POST['reply_id']) && is_numeric($_POST['reply_id'])) ? Wo_Secure($_POST['reply_id']) : 0;
        $can_manage_reply = $wo['loggedin'] && $reply_id && (Wo_IsReplyOwner($reply_id) || Wo_IsAdmin() || Wo_IsModerator());

        if ($wo['loggedin'] == false) {
            $response_data = array(
                'api_status' => 401,
                'errors' => array('error_text' => 'login is required')
            );
        } else if (!$can_manage_reply) {
            $response_data = array(
                'api_status' => 403,
                'errors' => array('error_text' => 'you can not delete this reply')
            );
        } else if (Wo_DeleteThreadReply($reply_id)) {
            $response_data = array(
                'api_status' => 200,
                'deleted_id' => $reply_id,
                'message' => 'reply deleted'
            );
        } else {
            $response_data = array(
                'api_status' => 500,
                'errors' => array('error_text' => 'unable to delete reply')
            );
        }
    } else if ($action == 'threads') {
        $forum_id = (!empty($_POST['forum_id']) && is_numeric($_POST['forum_id'])) ? Wo_Secure($_POST['forum_id']) : 0;
        $forum = $forum_id ? Wo_GetForum($forum_id) : array();

        if (empty($forum)) {
            $response_data = array(
                'api_status' => 404,
                'errors' => array('error_text' => 'forum not found')
            );
        } else {
            $threads = Wo_GetForumThreads(array(
                'forum' => $forum_id,
                'offset' => $offset,
                'limit' => $limit,
                'search' => !empty($keyword),
                'subject' => $keyword,
                'preview' => true
            ));
            foreach ($threads as $key => $thread) {
                $threads[$key]['forum_data'] = $forum;
                $threads[$key]['is_owner'] = $wo['loggedin'] && $thread['user'] == $wo['user']['id'];
                $threads[$key]['is_admin'] = $is_forum_admin;
            }

            $response_data = array(
                'api_status' => 200,
                'can_create' => !empty($wo['config']['can_use_forum']),
                'forum' => $forum,
                'threads' => $threads,
                'has_more' => count($threads) >= $limit,
                'next_offset' => !empty($threads) ? end($threads)['id'] : null
            );
        }
    } else if ($action == 'my_threads') {
        if ($wo['loggedin'] == false) {
            $response_data = array(
                'api_status' => 401,
                'errors' => array('error_text' => 'login is required')
            );
        } else {
            $threads = Wo_GetForumThreads(array(
                'user' => $wo['user']['id'],
                'offset' => $offset,
                'limit' => $limit,
                'search' => !empty($keyword),
                'subject' => $keyword,
                'preview' => true
            ));
            foreach ($threads as $key => $thread) {
                $threads[$key]['forum_data'] = Wo_GetForum($thread['forum']);
                $threads[$key]['is_owner'] = $thread['user'] == $wo['user']['id'];
                $threads[$key]['is_admin'] = $is_forum_admin;
            }

            $response_data = array(
                'api_status' => 200,
                'can_create' => !empty($wo['config']['can_use_forum']),
                'threads' => $threads,
                'has_more' => count($threads) >= $limit,
                'next_offset' => !empty($threads) ? end($threads)['id'] : null
            );
        }
    } else if ($action == 'thread_detail') {
        $thread_id = (!empty($_POST['thread_id']) && is_numeric($_POST['thread_id'])) ? Wo_Secure($_POST['thread_id']) : 0;
        $thread = $thread_id ? Wo_GetForumThreads(array('id' => $thread_id, 'preview' => true)) : array();

        if (empty($thread)) {
            $response_data = array(
                'api_status' => 404,
                'errors' => array('error_text' => 'thread not found')
            );
        } else {
            Wo_AddThreadView($thread_id);
            $thread[0]['forum_data'] = Wo_GetForum($thread[0]['forum']);
            $thread[0]['is_owner'] = $wo['loggedin'] && $thread[0]['user'] == $wo['user']['id'];
            $thread[0]['is_admin'] = $is_forum_admin;
            $response_data = array(
                'api_status' => 200,
                'thread' => $thread[0],
                'can_create' => !empty($wo['config']['can_use_forum'])
            );
        }
    } else if ($action == 'create_thread') {
        $forum_id = (!empty($_POST['forum_id']) && is_numeric($_POST['forum_id'])) ? Wo_Secure($_POST['forum_id']) : 0;
        $headline = !empty($_POST['headline']) ? Wo_Secure($_POST['headline']) : '';
        $topicpost = !empty($_POST['topicpost']) ? Wo_Secure($_POST['topicpost']) : '';

        if ($wo['loggedin'] == false || empty($wo['config']['can_use_forum'])) {
            $response_data = array(
                'api_status' => 401,
                'errors' => array('error_text' => 'forum posting is not allowed')
            );
        } else if (empty($forum_id) || empty(Wo_GetForum($forum_id)) || strlen($headline) < 10 || strlen($topicpost) < 32) {
            $response_data = array(
                'api_status' => 400,
                'errors' => array('error_text' => 'invalid thread payload')
            );
        } else {
            $registration_data = array(
                'user' => $wo['user']['id'],
                'views' => 0,
                'headline' => $headline,
                'post' => $topicpost,
                'posted' => time(),
                'forum' => $forum_id
            );

            if (Wo_AddTopic($registration_data)) {
                $threads = Wo_GetForumThreads(array(
                    'forum' => $forum_id,
                    'user' => $wo['user']['id'],
                    'limit' => 1,
                    'preview' => true
                ));
                if (!empty($threads[0])) {
                    $threads[0]['forum_data'] = Wo_GetForum($threads[0]['forum']);
                    $threads[0]['is_owner'] = true;
                    $threads[0]['is_admin'] = $is_forum_admin;
                }

                $response_data = array(
                    'api_status' => 200,
                    'thread' => !empty($threads[0]) ? $threads[0] : null,
                    'message' => 'thread created'
                );
            } else {
                $response_data = array(
                    'api_status' => 500,
                    'errors' => array('error_text' => 'unable to create thread')
                );
            }
        }
    } else if ($action == 'reply_thread') {
        $thread_id = (!empty($_POST['thread_id']) && is_numeric($_POST['thread_id'])) ? Wo_Secure($_POST['thread_id']) : 0;
        $forum_id = (!empty($_POST['forum_id']) && is_numeric($_POST['forum_id'])) ? Wo_Secure($_POST['forum_id']) : 0;
        $subject = !empty($_POST['subject']) ? Wo_Secure($_POST['subject']) : '';
        $content = !empty($_POST['content']) ? $_POST['content'] : '';

        if ($wo['loggedin'] == false) {
            $response_data = array(
                'api_status' => 401,
                'errors' => array('error_text' => 'login is required')
            );
        } else if (empty($thread_id) || empty($forum_id) || strlen($subject) < 10 || strlen($content) < 2) {
            $response_data = array(
                'api_status' => 400,
                'errors' => array('error_text' => 'invalid reply payload')
            );
        } else {
            $registration_data = array(
                'thread_id' => $thread_id,
                'forum_id' => $forum_id,
                'poster_id' => $wo['user']['id'],
                'post_subject' => $subject,
                'post_text' => Wo_BbcodeSecure($content),
                'post_quoted' => 0,
                'posted_time' => time()
            );

            if (Wo_ThreadReply($registration_data)) {
                Wo_UpdateThreadLastPostTime($thread_id);
                $replies = Wo_GetThreadReplies(array(
                    'thread_id' => $thread_id,
                    'user' => $wo['user']['id'],
                    'order_by' => 'DESC',
                    'limit' => 1
                ));

                $thread = Wo_GetForumThreads(array('id' => $thread_id, 'preview' => true));
                if (!empty($thread[0])) {
                    $notification_data_array = array(
                        'recipient_id' => $thread[0]['user'],
                        'type' => 'thread_reply',
                        'thread_id' => $thread_id,
                        'text' => '',
                        'url' => 'index.php?link1=showthread&tid=' . $thread_id
                    );
                    Wo_RegisterNotification($notification_data_array);
                }

                $response_data = array(
                    'api_status' => 200,
                    'reply' => !empty($replies[0]) ? $replies[0] : null,
                    'message' => 'reply created'
                );
            } else {
                $response_data = array(
                    'api_status' => 500,
                    'errors' => array('error_text' => 'unable to create reply')
                );
            }
        }
    } else {
    $sections = Wo_GetForumSec(array(
        'forums' => true,
        'limit' => $limit,
        'offset' => $offset,
        'search' => !empty($keyword),
        'keyword' => $keyword
    ));

    $response_data = array(
        'api_status' => 200,
        'can_create' => !empty($wo['config']['can_use_forum']),
        'sections' => $sections,
        'has_more' => count($sections) >= $limit,
        'next_offset' => !empty($sections) ? end($sections)['id'] : null
    );
    }
}
