-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Servidor: db
-- Tiempo de generación: 05-05-2021 a las 15:16:55
-- Versión del servidor: 10.2.34-MariaDB-1:10.2.34+maria~bionic-log
-- Versión de PHP: 7.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `io_variables`
--

CREATE TABLE `io_variables` (
  `nombre` varchar(255) NOT NULL COMMENT 'Nombre de variable',
  `valor` varchar(255) NOT NULL COMMENT 'valor de variable',
  `actualizacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Fecha ultima actualizacion'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `io_variables`
--

INSERT INTO `io_variables` (`nombre`, `valor`, `actualizacion`) VALUES
('var_cron_status', 'fdd', '2021-05-05 13:22:43'),
('var_last_qr', '{\"qr\":\"1@t/eGP9cWcfSEKiniHZ/c1sopuP+HiAjkkFU4F0KupScOwhs0jEPEtNoHX+VT/gqPxna/TbXuWBx7Eg==,gYQhZV+7RomqCUKthIwDzDawWX5orpBvi/WZLrJggVU=,IJxP5snq7QiivJjFI6IosQ==\"}', '2021-05-05 15:11:04');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `io_variables`
--
ALTER TABLE `io_variables`
  ADD PRIMARY KEY (`nombre`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
