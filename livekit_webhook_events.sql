-- English description: Creates the idempotency table used by LiveKit webhook processing.

CREATE TABLE IF NOT EXISTS `Wo_LiveKitWebhookEvents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` varchar(191) NOT NULL DEFAULT '',
  `event_type` varchar(64) NOT NULL DEFAULT '',
  `room_name` varchar(191) NOT NULL DEFAULT '',
  `payload_hash` char(64) NOT NULL DEFAULT '',
  `received_at` int(11) NOT NULL DEFAULT '0',
  `processed_at` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `event_id` (`event_id`),
  KEY `room_name` (`room_name`),
  KEY `event_type` (`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
