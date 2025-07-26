CREATE TABLE `sensor_history` (
	`id` varchar(255) NOT NULL,
	`pool_temp` double NOT NULL,
	`out_temp` double NOT NULL,
	`relay_state` boolean NOT NULL,
	`force_state` varchar(10) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now())
);
