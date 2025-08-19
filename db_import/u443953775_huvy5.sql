-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 19, 2025 at 01:58 PM
-- Server version: 10.11.10-MariaDB-log
-- PHP Version: 7.2.34

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `naramakna_clean`
--

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`ID`, `user_login`, `user_pass`, `user_nicename`, `user_email`, `user_url`, `user_registered`, `user_activation_key`, `user_status`, `display_name`, `user_role`, `email_verified`, `last_login`, `failed_login_attempts`, `locked_until`, `profile_image`, `bio`) VALUES
(1, 'tansbana@gmail.com', '$wp$2y$10$oAeHH3An.29Nu7yJyP4LAeLdfI0z1l2oxZY9tg3/rCvScfRZA7nvq', 'tansbanagmail-com', 'tansbana@gmail.com', 'http://naramakna.id', '2025-07-04 04:11:32', '', 'active', 'nm', 'user', 0, NULL, 0, NULL, NULL, NULL),
(3, 'B.G. Parameswara', '$wp$2y$10$ZSRWr.SrQjFLyUxqPkokfumXSyDUn.UWlcPJQke/oexa4KUwMNd6W', 'b-g-parameswara', 'naramaknaskt@gmail.com', '', '2025-07-05 15:34:40', '', 'active', 'B.G. Parameswara', 'user', 0, NULL, 0, NULL, NULL, NULL),
(4, 'Yosal Iriantara', '$wp$2y$10$Psr57SymKKDvaUZ/sSRky.WBEh2PSPxLgKRj9rEQBWZX8gJ/pcYMK', 'yosal-iriantara', 'Yosal.iriantara@gmail.com', '', '2025-07-05 15:40:28', '1751730028:$generic$iyOmkNbd14Xy9eGpEWOMAudpM8xi4FQ8sL_9qyvq', 'active', 'Yosal Iriantara', 'user', 0, NULL, 0, NULL, NULL, NULL),
(5, 'Khaerunnisa', '$wp$2y$10$5u6TVPtIJ4Hn7cwTEkROh.Op3MeFv/yZ3HFFk/4gvgAgGuqyARZXG', 'khaerunnisa', 'apcomsolution@gmail.com', '', '2025-07-05 15:45:32', '', 'active', 'Khaerunnisa', 'user', 0, NULL, 0, NULL, NULL, NULL),
(6, 'Waska Warta', '$wp$2y$10$polCpLXvzDvFV0YU3Dkop.yDmzV5yusbuC7mke53cihej8bYhh.ki', 'waska-warta', 'waskawarta@uninus.ac.id', '', '2025-07-06 06:47:47', '', 'active', 'Waska Warta', 'user', 0, NULL, 0, NULL, NULL, NULL),
(7, 'Tansah Rahmatullah', '$wp$2y$10$rXAqQBjmsExZ085BnBWp0utb50RvhsowzAIn3kcs9Vr2VZtzC3qom', 'tansah-rahmatullah', 'tansah_rahmatullah@uninus.ac.id', '', '2025-07-07 12:19:05', '1751890745:$generic$GICbccP8Ls12z64LKj14Cimh8hnlf4TAjNRkOJo3', 'active', 'Tansah Rahmatullah', 'user', 0, NULL, 0, NULL, NULL, NULL),
(8, 'Aas Fauziah', '$wp$2y$10$jMALON9Jn3SZmQo3ZqJmSu3hkjQehnAmUkXnk4MRL2eRdTnh9GWGi', 'aas-fauziah', 'nengaasnurfr24@gmail.com', '', '2025-07-13 03:28:01', '', 'active', 'Aas Fauziah', 'user', 0, NULL, 0, NULL, NULL, NULL);
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
