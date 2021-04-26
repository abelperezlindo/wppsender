-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 26-04-2021 a las 01:07:07
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
-- Estructura de tabla para la tabla `io_turno_mensaje`
--

CREATE TABLE `io_turno_mensaje` (
  `id` bigint(11) NOT NULL COMMENT 'CLAVE PRIMARIA',
  `destino` varchar(255) COLLATE utf8_bin DEFAULT NULL COMMENT 'DESTINO DEL MENSAJE',
  `mensaje` text COLLATE utf8_bin DEFAULT NULL COMMENT 'TEXTO DEL MENSAJE',
  `enviado` tinyint(1) DEFAULT NULL COMMENT 'MENSAJE FUE ENVIADO',
  `anulado` tinyint(1) DEFAULT NULL COMMENT 'SI FUE ANULADO',
  `fecha_enviado` datetime DEFAULT NULL COMMENT 'FECHA DE ENVIADO',
  `fecha_anulado` datetime DEFAULT NULL COMMENT 'FECHA EN LA QUE SE ANULÓ',
  `respuesta` text COLLATE utf8_bin DEFAULT NULL COMMENT 'RESPUESTA DESDE EL DESTINO',
  `sender` varchar(255) COLLATE utf8_bin DEFAULT NULL COMMENT 'SENDER DEL MENSAJE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='BANDEJA DE MENSAJES A ENVIAR';

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `io_turno_mensaje`
--
ALTER TABLE `io_turno_mensaje`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `io_turno_mensaje`
--
ALTER TABLE `io_turno_mensaje`
  MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT COMMENT 'CLAVE PRIMARIA';
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
