ALTER TABLE `sensors` MODIFY COLUMN `temp_pool` decimal(6,4) NOT NULL;--> statement-breakpoint
ALTER TABLE `sensors` MODIFY COLUMN `temp_outdoor` decimal(6,4) NOT NULL;