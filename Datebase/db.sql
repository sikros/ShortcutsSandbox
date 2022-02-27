SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `shortcuts` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `shortcuts`;

DROP TABLE IF EXISTS `banner`;
CREATE TABLE `banner` (
  `id` int(16) NOT NULL,
  `name` varchar(50) NOT NULL,
  `sid` int(16) NOT NULL,
  `image` varchar(100) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `config`;
CREATE TABLE `config` (
  `category` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `data`;
CREATE TABLE `data` (
  `sid` int(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `intro` varchar(500) NOT NULL,
  `url` varchar(100) NOT NULL,
  `author` varchar(100) NOT NULL,
  `color` varchar(10) NOT NULL,
  `category` varchar(100) NOT NULL,
  `homepage` varchar(100) NOT NULL,
  `recommend` tinyint(1) NOT NULL DEFAULT '0',
  `block` tinyint(1) NOT NULL DEFAULT '0',
  `new` tinyint(1) NOT NULL,
  `userid` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `uid` varchar(30) NOT NULL,
  `isadmin` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


ALTER TABLE `banner`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `data`
  ADD PRIMARY KEY (`sid`);

ALTER TABLE `user`
  ADD PRIMARY KEY (`uid`);


ALTER TABLE `banner`
  MODIFY `id` int(16) NOT NULL AUTO_INCREMENT;

ALTER TABLE `data`
  MODIFY `sid` int(10) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;