CREATE TABLE `sensors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sensor_id` varchar(255) NOT NULL,
	`temperature` decimal(5,2) NOT NULL,
	`unit` varchar(10) NOT NULL DEFAULT 'celsius',
	`timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sensors_id` PRIMARY KEY(`id`)
);
