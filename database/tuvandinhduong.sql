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

/*Table structure for table `customer` */

DROP TABLE IF EXISTS `customer`;

CREATE TABLE `customer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `gender` tinyint(1) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `address` varchar(1024) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `create_on` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Data for the table `customer` */

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;

/*Data for the table `log_err` */

insert  into `log_err`(`id`,`user_id`,`short_message`,`full_message`,`page_url`,`referrer_url`,`last_ip`,`create_on`) values 
(7,6,'Column \'id\' in where clause is ambiguous','SELECT department.*, hospital.name AS hospital_name FROM department INNER JOIN hospital ON department.hospital_id = hospital.id WHERE id > 0 ORDER BY id DESC LIMIT 0,15','/admin/department/list','http://localhost:3000/admin/department',NULL,'2023-02-16 11:39:59');

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
