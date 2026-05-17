-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-05-2026 a las 18:00:54
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `restaurante_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `cliente` varchar(120) NOT NULL,
  `plato` varchar(120) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `total` decimal(10,2) GENERATED ALWAYS AS (`cantidad` * `precio_unitario`) STORED,
  `estado` enum('pendiente','en_preparacion','listo','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
  `observacion` varchar(255) DEFAULT NULL,
  `creado_por` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `cliente`, `plato`, `cantidad`, `precio_unitario`, `estado`, `observacion`, `creado_por`, `fecha_creacion`, `actualizado_en`) VALUES
(1, 'Mesa 04 - Ana', 'Lomo saltado', 2, 28.90, 'pendiente', NULL, 1, '2026-05-16 00:10:53', '2026-05-16 00:10:53'),
(2, 'Mesa 07 - Carlos', 'Ají de gallina', 1, 24.50, 'en_preparacion', NULL, 1, '2026-05-16 00:10:53', '2026-05-16 00:10:53'),
(3, 'Delivery - Lucia', 'Arroz chaufa', 3, 22.00, 'entregado', NULL, 1, '2026-05-16 00:10:53', '2026-05-16 00:10:53'),
(4, 'Mesa 01 - Miguel', 'Ceviche clásico', 2, 35.00, 'listo', NULL, 1, '2026-05-16 00:10:53', '2026-05-16 00:11:57'),
(5, 'pedro', 'pato', 2, 25.00, 'pendiente', NULL, 1, '2026-05-16 00:35:49', '2026-05-16 00:35:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `token` text NOT NULL,
  `expira_en` datetime NOT NULL,
  `revocado` tinyint(1) NOT NULL DEFAULT 0,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `usuario_id`, `token`, `expira_en`, `revocado`, `creado_en`) VALUES
(1, 1, '$2b$10$Vvrp3tlrHovKMyQNjYhmbusb8WvItGw25kS/0ce4y6.O0Wa2dvFw.', '2026-05-22 18:51:27', 0, '2026-05-15 23:51:27'),
(2, 1, '$2b$10$AxTNms9EPy5r3RGi.dIcE.3AMFkCeJeoSYaw5yaPLfIYHjuPuV5DK', '2026-05-24 10:13:12', 0, '2026-05-17 15:13:12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`) VALUES
(1, 'administrador'),
(3, 'cocina'),
(2, 'mesero');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol_id` int(11) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `ultimo_acceso` datetime DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol_id`, `activo`, `ultimo_acceso`, `creado_en`) VALUES
(1, 'Administrador General', 'admin@restaurante.com', '$2b$12$teZUqX/.Adu22ZGQ16RL0ujGDtkOq3VtbcTJ7sJ0/ZadaxMWRatsi', 1, 1, '2026-05-17 10:13:12', '2026-05-15 23:47:14'),
(2, 'Juan Mesero', 'juan@restaurante.com', '$2b$12$teZUqX/.Adu22ZGQ16RL0ujGDtkOq3VtbcTJ7sJ0/ZadaxMWRatsi', 2, 1, NULL, '2026-05-15 23:47:14'),
(3, 'Pedro Cocina', 'pedro@restaurante.com', '$2b$12$teZUqX/.Adu22ZGQ16RL0ujGDtkOq3VtbcTJ7sJ0/ZadaxMWRatsi', 3, 1, NULL, '2026-05-15 23:47:14');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_pedidos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_pedidos` (
`id` int(11)
,`cliente` varchar(120)
,`plato` varchar(120)
,`cantidad` int(11)
,`precio_unitario` decimal(10,2)
,`total` decimal(10,2)
,`estado` enum('pendiente','en_preparacion','listo','entregado','cancelado')
,`observacion` varchar(255)
,`registrado_por` varchar(100)
,`rol` varchar(50)
,`fecha_creacion` timestamp
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_pedidos`
--
DROP TABLE IF EXISTS `vista_pedidos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_pedidos`  AS SELECT `p`.`id` AS `id`, `p`.`cliente` AS `cliente`, `p`.`plato` AS `plato`, `p`.`cantidad` AS `cantidad`, `p`.`precio_unitario` AS `precio_unitario`, `p`.`total` AS `total`, `p`.`estado` AS `estado`, `p`.`observacion` AS `observacion`, `u`.`nombre` AS `registrado_por`, `r`.`nombre` AS `rol`, `p`.`fecha_creacion` AS `fecha_creacion` FROM ((`pedidos` `p` join `usuarios` `u` on(`p`.`creado_por` = `u`.`id`)) join `roles` `r` on(`u`.`rol_id` = `r`.`id`)) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_creado_por` (`creado_por`);

--
-- Indices de la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_rt_usuario` (`usuario_id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_rol` (`rol_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `fk_creado_por` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_rt_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
