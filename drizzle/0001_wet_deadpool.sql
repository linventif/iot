CREATE TABLE `sensor_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`device_id` varchar(255) NOT NULL,
	`setting` varchar(64) NOT NULL,
	`value` varchar(255) NOT NULL,
	`type` varchar(32) NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sensor_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `sensors` ADD `device_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `sensors` ADD `temp_pool` decimal(6,4) NOT NULL;--> statement-breakpoint
ALTER TABLE `sensors` ADD `temp_outdoor` decimal(6,4) NOT NULL;--> statement-breakpoint
ALTER TABLE `sensors` ADD `relay_state` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `sensors` ADD `wifi_signal` int NOT NULL;--> statement-breakpoint
ALTER TABLE `sensors` ADD `free_heap` int NOT NULL;--> statement-breakpoint
ALTER TABLE `sensors` ADD `uptime` int NOT NULL;--> statement-breakpoint
ALTER TABLE `sensors` ADD `device_timestamp` int NOT NULL;--> statement-breakpoint
ALTER TABLE `sensors` DROP COLUMN `sensor_id`;--> statement-breakpoint
ALTER TABLE `sensors` DROP COLUMN `temperature`;--> statement-breakpoint
ALTER TABLE `sensors` DROP COLUMN `unit`;--> statement-breakpoint
ALTER TABLE `sensors` DROP COLUMN `timestamp`;