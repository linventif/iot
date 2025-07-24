CREATE TABLE `sensors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`device_id` varchar(255) NOT NULL,
	`temp_pool` decimal(5,4) NOT NULL,
	`temp_outdoor` decimal(5,4) NOT NULL,
	`relay_state` boolean NOT NULL,
	`wifi_signal` int NOT NULL,
	`free_heap` int NOT NULL,
	`uptime` int NOT NULL,
	`device_timestamp` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sensors_id` PRIMARY KEY(`id`)
);
