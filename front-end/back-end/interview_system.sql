-- phpMyAdmin SQL Dump
-- version 4.7.9
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 11, 2019 at 05:40 AM
-- Server version: 5.7.21
-- PHP Version: 5.6.35

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `interview_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
CREATE TABLE IF NOT EXISTS `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL,
  `updated_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `course_status`
--

DROP TABLE IF EXISTS `course_status`;
CREATE TABLE IF NOT EXISTS `course_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `round_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `assign_per` int(3) NOT NULL,
  `mail_sent` tinyint(1) NOT NULL DEFAULT '0',
  `mail_to` varchar(255) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` tinyint(1) DEFAULT NULL,
  `created_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` tinyint(1) DEFAULT NULL,
  `updated_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `round_id` (`round_id`,`course_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `interview_info`
--

DROP TABLE IF EXISTS `interview_info`;
CREATE TABLE IF NOT EXISTS `interview_info` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `round_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `slot_id` int(11) NOT NULL,
  `arrivalTime` time DEFAULT NULL,
  `decision` tinyint(1) DEFAULT '0',
  `comment` varchar(500) DEFAULT NULL,
  `reference` tinyint(1) DEFAULT '0',
  `field1` varchar(255) DEFAULT NULL,
  `field2` varchar(255) DEFAULT NULL,
  `field3` varchar(255) DEFAULT NULL,
  `mail_sent` tinyint(1) NOT NULL DEFAULT '0',
  `sms_sent` tinyint(1) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` int(11) NOT NULL DEFAULT '0',
  `created_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL DEFAULT '0',
  `updated_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `result`
--

DROP TABLE IF EXISTS `result`;
CREATE TABLE IF NOT EXISTS `result` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `level` varchar(255) NOT NULL,
  `grade` varchar(255) NOT NULL,
  `year` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` tinyint(1) NOT NULL,
  `created_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` tinyint(11) NOT NULL,
  `updated_dt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `rounds`
--

DROP TABLE IF EXISTS `rounds`;
CREATE TABLE IF NOT EXISTS `rounds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `schedule_dt` date NOT NULL,
  `course_id` text NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL,
  `updated_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `slots`
--

DROP TABLE IF EXISTS `slots`;
CREATE TABLE IF NOT EXISTS `slots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `round_id` int(11) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `count` int(11) NOT NULL DEFAULT '4',
  `assigned` int(11) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL,
  `updated_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
CREATE TABLE IF NOT EXISTS `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` varchar(255) DEFAULT NULL,
  `slots_id` varchar(255) DEFAULT NULL,
  `firstchoice` int(11) DEFAULT NULL,
  `secondchoice` tinyint(1) DEFAULT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `mother_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mobile` varchar(21) DEFAULT NULL,
  `home_tel_number` varchar(21) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `age` int(3) DEFAULT NULL,
  `gender` tinyint(1) DEFAULT NULL,
  `home_address` text,
  `postcode` varchar(255) DEFAULT NULL,
  `guardin_name` varchar(255) DEFAULT NULL,
  `guardin_number` varchar(255) DEFAULT NULL,
  `pps_number` varchar(10) DEFAULT NULL,
  `student_status` tinyint(1) DEFAULT NULL,
  `highest_award` int(1) DEFAULT NULL,
  `student_info` varchar(255) DEFAULT NULL,
  `nationality_status` tinyint(1) DEFAULT NULL,
  `nationality_info` varchar(255) DEFAULT NULL,
  `hse_medical_status` tinyint(1) DEFAULT NULL,
  `school_name` varchar(255) DEFAULT NULL,
  `school_number` varchar(10) DEFAULT NULL,
  `school_leaving_year` int(4) DEFAULT NULL,
  `school_address` text,
  `leaving_certificate_school_name` text,
  `leaving_certificate_school_number` text,
  `leaving_certificate_school_year` text,
  `leaving_certificate_school_address` text,
  `leaving_certificate_work_experience` text,
  `mode_status` tinyint(1) DEFAULT NULL,
  `mode_info` varchar(255) DEFAULT NULL,
  `result_status` varchar(255) DEFAULT NULL,
  `other_certificate` text,
  `other_examination` varchar(255) DEFAULT NULL,
  `work_experience` text,
  `disability_condition` text,
  `disability_support` text,
  `disability_info` text,
  `course_reference` varchar(255) DEFAULT NULL,
  `first_ref_name` varchar(255) DEFAULT NULL,
  `first_ref_number` varchar(21) DEFAULT NULL,
  `second_ref_name` varchar(255) DEFAULT NULL,
  `second_ref_number` varchar(21) DEFAULT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `signature` tinyint(1) DEFAULT NULL,
  `written_reference_status` tinyint(1) DEFAULT NULL,
  `cdetb_confirmation` tinyint(1) DEFAULT NULL,
  `subscriber_status` tinyint(1) DEFAULT '0',
  `mail_sent` tinyint(1) NOT NULL DEFAULT '0',
  `sms_sent` tinyint(1) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` int(11) DEFAULT NULL,
  `created_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_by` int(11) DEFAULT NULL,
  `update_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` tinyint(1) NOT NULL DEFAULT '1',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL,
  `updated_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `role`, `status`, `is_deleted`, `created_dt`, `created_by`, `updated_dt`, `updated_by`) VALUES
(1, 'apply@libertiescollege.ie', '78489a0891eb0999c6efce1f96b17dce', 1, 1, 0, '2018-10-12 11:23:44', 1, '2018-10-10 11:23:44', 1);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
