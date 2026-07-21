-- English description: Disables profile-visit in-app notifications by default while preserving the user's ability to enable them later.

ALTER TABLE `Wo_Users`
  MODIFY `notification_settings` varchar(400) NOT NULL DEFAULT '{"e_liked":1,"e_shared":1,"e_wondered":0,"e_commented":1,"e_followed":1,"e_accepted":1,"e_mentioned":1,"e_joined_group":1,"e_liked_page":1,"e_visited":0,"e_profile_wall_post":1,"e_memory":1}';

UPDATE `Wo_Users`
SET `notification_settings` = REPLACE(
  `notification_settings`,
  '"e_visited":1',
  '"e_visited":0'
)
WHERE `notification_settings` LIKE '%"e_visited":1%';

UPDATE `Wo_Users`
SET `notification_settings` = REPLACE(
  `notification_settings`,
  '&quot;e_visited&quot;:1',
  '&quot;e_visited&quot;:0'
)
WHERE `notification_settings` LIKE '%&quot;e_visited&quot;:1%';
