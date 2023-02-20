/*
SQLyog Ultimate v13.1.1 (64 bit)
MySQL - 10.4.24-MariaDB : Database - tuvandinhduong
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
USE `tuvandinhduong`;

/*Table structure for table `active_mode_of_living` */

DROP TABLE IF EXISTS `active_mode_of_living`;

CREATE TABLE `active_mode_of_living` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `detail` longtext NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `active_mode_of_living` */

/*Table structure for table `alternative_food` */

DROP TABLE IF EXISTS `alternative_food`;

CREATE TABLE `alternative_food` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `food_info_id` int(11) NOT NULL,
  `weight_food_info` int(11) NOT NULL,
  `food_info_unit` varchar(255) DEFAULT NULL,
  `food_info_id_replace` int(11) NOT NULL,
  `food_info_unit_replace` varchar(255) DEFAULT NULL,
  `weight_food_info_replace` int(11) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `alternative_food` */

/*Table structure for table `customer` */

DROP TABLE IF EXISTS `customer`;

CREATE TABLE `customer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cus_name` varchar(255) NOT NULL DEFAULT '',
  `cus_email` varchar(255) DEFAULT NULL,
  `cus_phone` varchar(255) DEFAULT NULL,
  `cus_gender` tinyint(1) DEFAULT NULL,
  `cus_birthday` date DEFAULT NULL,
  `cus_address` varchar(1024) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`cus_phone`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

/*Data for the table `customer` */

insert  into `customer`(`id`,`cus_name`,`cus_email`,`cus_phone`,`cus_gender`,`cus_birthday`,`cus_address`,`department_id`,`created_at`,`updated_at`) values 
(1,'Nguyễn Quốc Đat','','0989402893',1,'0000-00-00','24 Trâu Quỳ Gia lâm Hà nội',2,NULL,'2023-02-20 15:03:42'),
(2,'Nguyễn Phương Linh','','0941926837',0,'2020-10-15','24 Trâu Quỳ  - Gia Lâm - Hà Nội',2,'2023-02-20 15:20:14','2023-02-20 15:20:14');

/*Table structure for table `department` */

DROP TABLE IF EXISTS `department`;

CREATE TABLE `department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `hospital_id` int(11) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

/*Data for the table `department` */

insert  into `department`(`id`,`name`,`hospital_id`,`phone`,`updated_at`) values 
(2,'Khoa dinh dưỡng',1,'','2023-02-16 14:04:14');

/*Table structure for table `examine` */

DROP TABLE IF EXISTS `examine`;

CREATE TABLE `examine` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `count_id` varchar(255) NOT NULL,
  `cus_name` varchar(1024) NOT NULL,
  `cus_phone` varchar(255) DEFAULT NULL,
  `cus_email` varchar(1024) DEFAULT NULL,
  `cus_gender` tinyint(1) DEFAULT NULL,
  `cus_birthday` date DEFAULT NULL,
  `cus_address` varchar(1024) DEFAULT NULL,
  `diagnostic` longtext DEFAULT NULL COMMENT 'Chuan doan',
  `cus_length` float DEFAULT NULL,
  `cus_cntc` float DEFAULT NULL,
  `cus_cnht` float DEFAULT NULL,
  `cus_bmi` float DEFAULT NULL,
  `clinical_examination` longtext DEFAULT NULL COMMENT 'Kham lam sang',
  `erythrocytes` float DEFAULT NULL,
  `cus_bc` float DEFAULT NULL,
  `cus_tc` float DEFAULT NULL,
  `cus_albumin` float DEFAULT NULL,
  `cus_nakcl` float DEFAULT NULL,
  `cus_astaltggt` float DEFAULT NULL,
  `cus_urecreatinin` float DEFAULT NULL,
  `cus_bilirubin` float DEFAULT NULL,
  `exa_note` float DEFAULT NULL,
  `cus_fat` float DEFAULT NULL,
  `cus_water` float DEFAULT NULL,
  `cus_visceral_fat` float DEFAULT NULL,
  `cus_bone_weight` float DEFAULT NULL,
  `cus_chcb` float DEFAULT NULL,
  `cus_waist` float DEFAULT NULL,
  `cus_butt` float DEFAULT NULL,
  `cus_cseomong` float DEFAULT NULL,
  `active_mode_of_living` longtext DEFAULT NULL COMMENT 'che do van dong sinh hoat',
  `department_id` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL COMMENT '1 tiep nhan 2 dang kham 3 hoan thanh 4 da huy',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

/*Data for the table `examine` */

insert  into `examine`(`id`,`count_id`,`cus_name`,`cus_phone`,`cus_email`,`cus_gender`,`cus_birthday`,`cus_address`,`diagnostic`,`cus_length`,`cus_cntc`,`cus_cnht`,`cus_bmi`,`clinical_examination`,`erythrocytes`,`cus_bc`,`cus_tc`,`cus_albumin`,`cus_nakcl`,`cus_astaltggt`,`cus_urecreatinin`,`cus_bilirubin`,`exa_note`,`cus_fat`,`cus_water`,`cus_visceral_fat`,`cus_bone_weight`,`cus_chcb`,`cus_waist`,`cus_butt`,`cus_cseomong`,`active_mode_of_living`,`department_id`,`status`,`created_by`,`created_at`,`updated_at`) values 
(1,'','Nguyễn Quốc Đạt','0989402893','',1,'1990-08-31','24 Trâu Quỳ - Gia Lâm - Hà Nội','',0,0,0,0,'',0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,1,NULL,'2023-02-20 17:28:06','2023-02-20 14:56:34'),
(2,'','Nguyễn Quốc Đat','0989402893','',1,'1990-08-31','24 Trâu Quỳ Gia lâm Hà nội','',0,0,0,0,'',0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,1,NULL,'2023-02-20 17:28:05','2023-02-20 15:03:42'),
(3,'','Nguyễn Phương Linh','0941926837','',0,'2020-10-15','24 Trâu Quỳ  - Gia Lâm - Hà Nội','',0,0,0,0,'',0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,1,NULL,'2023-02-20 17:27:32','2023-02-20 15:20:14');

/*Table structure for table `food_info` */

DROP TABLE IF EXISTS `food_info`;

CREATE TABLE `food_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `food_type_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `weight` int(11) DEFAULT 100 COMMENT 'g',
  `energy` int(11) DEFAULT NULL COMMENT 'kcal',
  `protein` float DEFAULT NULL COMMENT 'g',
  `animal_protein` float DEFAULT NULL COMMENT 'g',
  `lipid` float DEFAULT NULL COMMENT 'g',
  `unanimal_lipid` float DEFAULT NULL COMMENT 'g',
  `carbohydrate` float DEFAULT NULL COMMENT 'g',
  `created_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `food_info` */

/*Table structure for table `hospital` */

DROP TABLE IF EXISTS `hospital`;

CREATE TABLE `hospital` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(1024) DEFAULT NULL,
  `address` varchar(1024) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

/*Data for the table `hospital` */

insert  into `hospital`(`id`,`name`,`address`,`phone`,`updated_at`) values 
(1,'Bệnh viện nhiệt đới trung ương','Kim chung  - Đông Anh - Hà Nội','','2023-02-15 17:10:20'),
(2,'Bệnh viện Tâm An','','','2023-02-15 17:18:26');

/*Table structure for table `log_err` */

DROP TABLE IF EXISTS `log_err`;

CREATE TABLE `log_err` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL DEFAULT 0,
  `short_message` varchar(1000) DEFAULT NULL,
  `full_message` longtext DEFAULT NULL,
  `page_url` varchar(500) DEFAULT NULL,
  `referrer_url` varchar(500) DEFAULT NULL,
  `last_ip` varchar(40) DEFAULT NULL,
  `create_on` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4;

/*Data for the table `log_err` */

insert  into `log_err`(`id`,`user_id`,`short_message`,`full_message`,`page_url`,`referrer_url`,`last_ip`,`create_on`) values 
(7,6,'Column \'id\' in where clause is ambiguous','SELECT department.*, hospital.name AS hospital_name FROM department INNER JOIN hospital ON department.hospital_id = hospital.id WHERE id > 0 ORDER BY id DESC LIMIT 0,15','/admin/department/list','http://localhost:3000/admin/department',NULL,'2023-02-16 11:39:59'),
(8,6,'articleService is not defined','','/examine/create','http://localhost:3000/examine/create',NULL,'2023-02-20 13:41:33'),
(9,6,'Table \'tuvandinhduong.pr_history_article\' doesn\'t exist','INSERT INTO pr_history_article(cus_name,cus_phone,cus_email,cus_gender,cus_birthday,cus_address,diagnostic,cus_length,cus_cntc,cus_cnht,cus_bmi,clinical_examination,erythrocytes,cus_bc,cus_tc,cus_albumin,cus_nakcl,cus_astaltggt,cus_urecreatinin,cus_bilirubin,exa_note) VALUES (\'Nguyễn Quốc Đat\',\'\',\'\',\'1\',\'31-08-1990\',\'\',\'\',\'\',\'\',\'\',\'\',\'\',\'\',\'\',\'\',\'\',\'\',\'\',\'\',\'\',\'\')','/examine/create','http://localhost:3000/examine/create',NULL,'2023-02-20 13:41:33'),
(10,6,'Unknown column \'examine.department_id\' in \'on clause\'','SELECT COUNT(*) AS count FROM examine\n                                NNER JOIN department ON examine.department_id = department.id\n                                INNER JOIN hospital ON department.hospital_id = hospital.id ORDER BY examine.created_at DESC LIMIT 0,10','/examine',NULL,NULL,'2023-02-20 16:49:04'),
(11,6,'Unknown column \'examine.department_id\' in \'on clause\'','SELECT COUNT(*) AS count FROM examine\n                                NNER JOIN department ON examine.department_id = department.id\n                                INNER JOIN hospital ON department.hospital_id = hospital.id ORDER BY examine.created_at DESC LIMIT 0,10','/examine',NULL,NULL,'2023-02-20 16:49:23'),
(12,6,'Unknown column \'examine.department_id\' in \'on clause\'','SELECT COUNT(*) AS count FROM examine\n                                NNER JOIN department ON examine.department_id = department.id\n                                INNER JOIN hospital ON department.hospital_id = hospital.id ORDER BY examine.created_at DESC LIMIT 0,10','/examine','http://localhost:3000/',NULL,'2023-02-20 16:49:48'),
(13,6,'Unknown column \'examine.department_id\' in \'on clause\'','SELECT COUNT(*) AS count FROM examine\n                                NNER JOIN department ON examine.department_id = department.id\n                                INNER JOIN hospital ON department.hospital_id = hospital.id ORDER BY examine.created_at DESC LIMIT 0,10','/examine','http://localhost:3000/',NULL,'2023-02-20 16:53:28'),
(14,6,'Unknown column \'examine.department_id\' in \'on clause\'','SELECT COUNT(*) AS count FROM examine\n                                NNER JOIN department ON examine.department_id = department.id\n                                INNER JOIN hospital ON department.hospital_id = hospital.id ORDER BY examine.created_at DESC LIMIT 0,10','/examine','http://localhost:3000/',NULL,'2023-02-20 16:54:50'),
(15,6,'Unknown column \'examine.department_id\' in \'on clause\'','SELECT COUNT(*) AS count FROM examine\n                                NNER JOIN department ON examine.department_id = department.id\n                                INNER JOIN hospital ON department.hospital_id = hospital.id ORDER BY examine.created_at DESC LIMIT 0,10','/examine','http://localhost:3000/',NULL,'2023-02-20 16:56:50');

/*Table structure for table `log_mail` */

DROP TABLE IF EXISTS `log_mail`;

CREATE TABLE `log_mail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `result` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `param` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_send` tinyint(4) DEFAULT 1,
  `sent_tries` int(11) DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `log_mail` */

insert  into `log_mail`(`id`,`result`,`param`,`is_send`,`sent_tries`,`type`,`created_at`) values 
(1,'{\"success\":true,\"messageId\":\"<1bec51fb-3921-a255-6c95-ea03c8eb53b3@localhost>\",\"message\":\"Successful\"}','{\"email\":\"qdatvirgo@gmail.com\",\"link_active\":\"http://localhost:3000/user/activeaccount/e8e91b7cb05eafbb84a6afb28aacca726c418715\"}',1,0,'mail_signup','2023-02-15 14:25:22');

/*Table structure for table `medicine` */

DROP TABLE IF EXISTS `medicine`;

CREATE TABLE `medicine` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(1024) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `medicine` */

/*Table structure for table `menu` */

DROP TABLE IF EXISTS `menu`;

CREATE TABLE `menu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `menu` */

/*Table structure for table `menu_detail` */

DROP TABLE IF EXISTS `menu_detail`;

CREATE TABLE `menu_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `menu_id` int(11) NOT NULL,
  `menu_time_id` int(11) NOT NULL,
  `food_info_id` int(11) DEFAULT NULL,
  `food_weight` int(11) DEFAULT NULL,
  `dainty_name` varchar(255) DEFAULT NULL,
  `type` tinyint(4) DEFAULT 0 COMMENT '0 detail 1 dainty_name',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `menu_detail` */

/*Table structure for table `menu_time` */

DROP TABLE IF EXISTS `menu_time`;

CREATE TABLE `menu_time` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `time` varchar(255) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `menu_time` */

/*Table structure for table `nutrition_advice` */

DROP TABLE IF EXISTS `nutrition_advice`;

CREATE TABLE `nutrition_advice` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `glucid_limited_use` varchar(1024) DEFAULT NULL,
  `glucid_should_use` varchar(1024) DEFAULT NULL,
  `glucid_should_not_use` varchar(1024) DEFAULT NULL,
  `protein_limited_use` varchar(1024) DEFAULT NULL,
  `protein_should_use` varchar(1024) DEFAULT NULL,
  `protein_should_not_use` varchar(1024) DEFAULT NULL,
  `lipid_limited_use` varchar(1024) DEFAULT NULL,
  `lipid_should_use` varchar(1024) DEFAULT NULL,
  `lipid_should_not_use` varchar(1024) DEFAULT NULL,
  `vitamin_ck_limited_use` varchar(1024) DEFAULT NULL,
  `vitamin_ck_should_use` varchar(1024) DEFAULT NULL,
  `vitamin_ck_should_not_use` varchar(1024) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `nutrition_advice` */

/*Table structure for table `prescription` */

DROP TABLE IF EXISTS `prescription`;

CREATE TABLE `prescription` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `examine_id` bigint(20) NOT NULL,
  `medicine_id` bigint(20) NOT NULL,
  `quantity` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `prescription` */

/*Table structure for table `role` */

DROP TABLE IF EXISTS `role`;

CREATE TABLE `role` (
  `role_id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(60) NOT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;

/*Data for the table `role` */

insert  into `role`(`role_id`,`role_name`) values 
(1,'Administrator'),
(2,'Customer'),
(3,'System'),
(4,'Doctor'),
(5,'Channel Management');

/*Table structure for table `role_user` */

DROP TABLE IF EXISTS `role_user`;

CREATE TABLE `role_user` (
  `role_id` int(11) NOT NULL,
  `user_id` int(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `role_user` */

insert  into `role_user`(`role_id`,`user_id`) values 
(1,1),
(2,4),
(2,5),
(1,6);

/*Table structure for table `setting` */

DROP TABLE IF EXISTS `setting`;

CREATE TABLE `setting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `systemname` text NOT NULL,
  `body` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8;

/*Data for the table `setting` */

insert  into `setting`(`id`,`systemname`,`body`) values 
(1,'siteKey','6Lf_O8kiAAAAAPxCg5g-le5JS7sWfCtewMzRm-yr'),
(2,'secretKey','6Lf_O8kiAAAAABWCTZwT1Ms84nsq45TzJvPq5W5g'),
(37,'enableCaptcha','0');

/*Table structure for table `user` */

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) NOT NULL DEFAULT 0,
  `name` varchar(50) NOT NULL DEFAULT '',
  `full_name` varchar(250) NOT NULL,
  `password` text NOT NULL,
  `email` varchar(400) NOT NULL,
  `phone` varchar(45) DEFAULT NULL,
  `gender` tinyint(1) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `activePasswordToken` varchar(45) DEFAULT NULL,
  `resetPasswordToken` varchar(45) DEFAULT NULL,
  `resetPasswordExpires` timestamp NULL DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `last_ip` varchar(40) DEFAULT '127.0.0.1',
  `last_login` timestamp NULL DEFAULT current_timestamp(),
  `department_id` int(11) DEFAULT NULL,
  `create_on` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;

/*Data for the table `user` */

insert  into `user`(`id`,`user_id`,`name`,`full_name`,`password`,`email`,`phone`,`gender`,`birthday`,`address`,`activePasswordToken`,`resetPasswordToken`,`resetPasswordExpires`,`active`,`last_ip`,`last_login`,`department_id`,`create_on`) values 
(6,0,'qdatvirgo@gmail.com','','8f3633d9970f51a509728be61fb9ee213ea6999e0867c7b67a5ca9005d70d07072fbe003c2ad867483b75427a71542764a9d6a8f58accd6605bbc10cd9a74b93','qdatvirgo@gmail.com','9738781040',1,'1990-08-31','2641 Euclid Avenue',NULL,NULL,NULL,1,NULL,'2023-02-15 14:25:20',2,'2023-02-15 14:25:20'),
(11,0,'qdatvirgo@gmail.com','','8f3633d9970f51a509728be61fb9ee213ea6999e0867c7b67a5ca9005d70d07072fbe003c2ad867483b75427a71542764a9d6a8f58accd6605bbc10cd9a74b93','qdatvirgo1@gmail.com','9738781041',1,'1990-08-31','2641 Euclid Avenue',NULL,NULL,NULL,1,NULL,'2023-02-15 14:25:20',NULL,'2023-02-15 14:25:20');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
