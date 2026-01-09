-- Common/Member database schema for parity testing
USE sammo_common;

-- System table
CREATE TABLE `system` (
	`NO` INT(11) NOT NULL AUTO_INCREMENT,
	`REG` VARCHAR(1) NULL DEFAULT 'N',
	`LOGIN` VARCHAR(1) NULL DEFAULT 'N',
	`NOTICE` VARCHAR(256) NULL DEFAULT '',
	`CRT_DATE` DATETIME NULL DEFAULT NULL,
	`MDF_DATE` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`NO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Member table
CREATE TABLE `member` (
	`NO` INT(11) NOT NULL AUTO_INCREMENT,
	`oauth_id` BIGINT(20) NULL DEFAULT NULL,
	`ID` VARCHAR(64) NOT NULL,
	`EMAIL` VARCHAR(64) NULL DEFAULT NULL,
	`oauth_type` ENUM('NONE','KAKAO') NOT NULL,
	`oauth_info` TEXT NOT NULL DEFAULT '{}',
	`token_valid_until` DATETIME NULL DEFAULT NULL,
	`PW` CHAR(128) NOT NULL,
	`salt` CHAR(16) NOT NULL,
	`third_use` INT(1) NOT NULL DEFAULT '0',
	`NAME` VARCHAR(64) NOT NULL,
	`PICTURE` VARCHAR(64) NULL DEFAULT 'default.jpg',
	`IMGSVR` INT(1) NULL DEFAULT '0',
	`acl` TEXT NOT NULL DEFAULT '{}',
	`penalty` TEXT NOT NULL DEFAULT '{}',
	`GRADE` INT(1) NULL DEFAULT '1',
	`REG_NUM` INT(3) NULL DEFAULT '0',
	`REG_DATE` DATETIME NOT NULL,
	`BLOCK_NUM` INT(3) NULL DEFAULT '0',
	`BLOCK_DATE` DATETIME NULL DEFAULT NULL,
	`delete_after` DATE NULL DEFAULT NULL,
	PRIMARY KEY (`NO`),
	UNIQUE INDEX `ID` (`ID`),
	UNIQUE INDEX `EMAIL` (`EMAIL`),
	UNIQUE INDEX `kauth_id` (`oauth_id`),
	INDEX `delete_after` (`delete_after`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Member log table
CREATE TABLE `member_log` (
	`id` BIGINT(20) NOT NULL AUTO_INCREMENT,
	`member_no` INT(11) NOT NULL,
	`date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`action_type` ENUM('reg','try_login','login','logout','oauth','change_pw','make_general','access_server','delete') NOT NULL,
	`action` TEXT NULL DEFAULT NULL,
	PRIMARY KEY (`id`),
	INDEX `action` (`member_no`, `action_type`, `date`),
	INDEX `member` (`member_no`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- KV Storage
CREATE TABLE IF NOT EXISTS `storage` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`namespace` VARCHAR(40) NOT NULL,
	`key` VARCHAR(40) NOT NULL,
	`value` TEXT NOT NULL,
	PRIMARY KEY (`id`),
	UNIQUE INDEX `key` (`namespace`, `key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Login token
CREATE TABLE `login_token` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`user_id` INT(11) NOT NULL,
	`base_token` VARCHAR(20) NOT NULL,
	`reg_ip` VARCHAR(40) NOT NULL,
	`reg_date` DATETIME NOT NULL,
	`expire_date` DATETIME NOT NULL,
	PRIMARY KEY (`id`),
	UNIQUE INDEX `by_token` (`base_token`),
	INDEX `by_date` (`user_id`, `expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Banned member
CREATE TABLE `banned_member` (
	`no` INT NOT NULL AUTO_INCREMENT,
	`hashed_email` VARCHAR(128) NOT NULL,
	`info` TEXT NULL,
	PRIMARY KEY (`no`),
	UNIQUE INDEX `email` (`hashed_email`(128))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default system record
INSERT INTO `system` (`REG`, `LOGIN`, `NOTICE`, `CRT_DATE`, `MDF_DATE`) 
VALUES ('Y', 'Y', 'Parity Test Server', NOW(), NOW());

-- Insert test user
INSERT INTO `member` (`ID`, `EMAIL`, `oauth_type`, `oauth_info`, `PW`, `salt`, `NAME`, `REG_DATE`)
VALUES ('test_user', 'test@example.com', 'NONE', '{}', 'dummy_hash', 'dummy_salt', 'Test User', NOW());
