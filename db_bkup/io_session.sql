-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 28-04-2021 a las 22:55:12
-- Versión del servidor: 10.3.27-MariaDB-0+deb10u1
-- Versión de PHP: 7.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `wppsender`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `io_session`
--

CREATE TABLE `io_session` (
  `id` bigint(11) NOT NULL COMMENT 'CLAVE PRIMARIA',
  `activo` tinyint(1) NOT NULL COMMENT 'ESTADO ACTIVO',
  `session_data` text COLLATE utf8_bin NOT NULL COMMENT 'SESSION JSON',
  `numero` varchar(13) COLLATE utf8_bin NOT NULL COMMENT 'NÚMERO DE WHATSAPP',
  `descripcion` text COLLATE utf8_bin NOT NULL COMMENT 'DESCRIPCION ',
  `fecha` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'FECHA ALTA'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `io_session`
--
ALTER TABLE `io_session`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `io_session`
--
ALTER TABLE `io_session`
  MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT COMMENT 'CLAVE PRIMARIA';
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
