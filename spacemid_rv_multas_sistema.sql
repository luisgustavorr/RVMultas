-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 23/05/2024 às 09:28
-- Versão do servidor: 10.6.17-MariaDB-cll-lve
-- Versão do PHP: 8.1.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `spacemid_rv_multas_sistema`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_clientes`
--

CREATE TABLE `tb_clientes` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `tel` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `cnh` varchar(255) NOT NULL,
  `data_cadastro` date NOT NULL,
  `processos_id` int(11) NOT NULL,
  `vencimento_cnh` date NOT NULL,
  `cpf` varchar(255) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Despejando dados para a tabela `tb_clientes`
--

INSERT INTO `tb_clientes` (`id`, `nome`, `tel`, `email`, `cnh`, `data_cadastro`, `processos_id`, `vencimento_cnh`, `cpf`) VALUES
(16, 'Duda', '(37) 9 8410-3402', 'luisgustavo20061@gmail.com', '123123123-12', '2024-05-03', 0, '2003-02-03', '12.312.321/3123-12'),
(15, 'Luis Editada', '(37) 9 8410-3402', 'luisgustavo20061@gmail.com', '322222212-33', '2024-05-03', 0, '2027-03-10', '154.837.906-93');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_contratos`
--

CREATE TABLE `tb_contratos` (
  `id` int(11) NOT NULL,
  `text` longtext NOT NULL,
  `nome` varchar(255) NOT NULL,
  `data_criacao` date NOT NULL,
  `usuario_id` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Despejando dados para a tabela `tb_contratos`
--

INSERT INTO `tb_contratos` (`id`, `text`, `nome`, `data_criacao`, `usuario_id`) VALUES
(19, '<p class=\"ql-align-center\"><span class=\"ql-size-large\">Contrato De Teste</span></p><p class=\"ql-align-center\">Data : {Data Atual}</p><p>Cliente : {Nome do Cliente}</p><p>Documento : {Documento Cliente}</p>', 'Contrato de Teste', '2024-05-03', 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_contratos_relacionados`
--

CREATE TABLE `tb_contratos_relacionados` (
  `id` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_contrato` int(11) NOT NULL,
  `data_emissao` date NOT NULL,
  `data_assinatura` date NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Despejando dados para a tabela `tb_contratos_relacionados`
--

INSERT INTO `tb_contratos_relacionados` (`id`, `id_cliente`, `id_contrato`, `data_emissao`, `data_assinatura`) VALUES
(12, 15, 19, '2024-05-03', '0000-00-00'),
(11, 16, 19, '2024-05-03', '0000-00-00'),
(10, 15, 19, '2024-05-03', '0000-00-00');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_imagens_clientes`
--

CREATE TABLE `tb_imagens_clientes` (
  `id` int(11) NOT NULL,
  `path` varchar(255) NOT NULL,
  `cliente_id` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Despejando dados para a tabela `tb_imagens_clientes`
--

INSERT INTO `tb_imagens_clientes` (`id`, `path`, `cliente_id`) VALUES
(62, 'IDENTIDADE EXEMPLO.webp', 16),
(61, 'IDENTIDADE EXEMPLO.webp', 15);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_imagens_processos`
--

CREATE TABLE `tb_imagens_processos` (
  `id` int(11) NOT NULL,
  `path` varchar(255) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `row` varchar(255) NOT NULL,
  `id_processo` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Despejando dados para a tabela `tb_imagens_processos`
--

INSERT INTO `tb_imagens_processos` (`id`, `path`, `cliente_id`, `row`, `id_processo`) VALUES
(191, 'CRLV EXEMPLO.jpeg', 15, 'crlv_files', 50),
(193, 'NOTIFICACAO TESTE.jpg', 15, 'notificacao_atuacao', 48),
(188, 'NOTIFICACAO TESTE.jpg', 15, 'notificacao_atuacao', 49),
(189, 'NOTIFICACAO TESTE.jpg', 15, 'notificacao_atuacao', 50),
(190, 'CRLV EXEMPLO.jpeg', 15, 'crlv_files', 49),
(192, 'CRLV EXEMPLO.jpeg', 15, 'crlv_files', 48);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_notificacoes`
--

CREATE TABLE `tb_notificacoes` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `mensagem` text NOT NULL,
  `permissao_alvo` int(11) NOT NULL,
  `id_criador` int(11) NOT NULL DEFAULT 0,
  `id_processo` int(11) NOT NULL DEFAULT 0,
  `id_contrato` int(11) NOT NULL DEFAULT 0,
  `data_criacao` datetime NOT NULL,
  `vista` tinyint(1) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Despejando dados para a tabela `tb_notificacoes`
--

INSERT INTO `tb_notificacoes` (`id`, `titulo`, `mensagem`, `permissao_alvo`, `id_criador`, `id_processo`, `id_contrato`, `data_criacao`, `vista`) VALUES
(3, 'Solicitação de Process', 'O cliente <a href=\"https://wa.me/37984103402?text=Ol%C3%A1+Luis Editada%2C+vi+que+solicitou+um+processo%2C+poderia+me+dar+mais+informa%C3%A7%C3%B5es+sobre+a+situa%C3%A7%C3%A3o%3F\">Luis Editada</a> está solicitando um processo, clique no nome nessa notificação para entrar em contato com ele para mais detalhes.', 2, 15, 0, 0, '2024-05-22 19:52:31', 0);

--
-- Acionadores `tb_notificacoes`
--
DELIMITER $$
CREATE TRIGGER `after_tb_notificacoes` AFTER UPDATE ON `tb_notificacoes` FOR EACH ROW BEGIN
  INSERT INTO tb_notificacoes_log (notificacao_id) VALUES (NEW.id);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_notificacoes_log`
--

CREATE TABLE `tb_notificacoes_log` (
  `id` int(11) NOT NULL,
  `notificacao_id` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Despejando dados para a tabela `tb_notificacoes_log`
--

INSERT INTO `tb_notificacoes_log` (`id`, `notificacao_id`) VALUES
(1, 3),
(2, 3),
(3, 3),
(4, 3);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_processos`
--

CREATE TABLE `tb_processos` (
  `id` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `nome_processo` varchar(255) NOT NULL,
  `placa_carro` varchar(255) NOT NULL,
  `atualizacao` datetime NOT NULL,
  `criacao` datetime NOT NULL,
  `funcionario_id` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Despejando dados para a tabela `tb_processos`
--

INSERT INTO `tb_processos` (`id`, `status`, `nome_processo`, `placa_carro`, `atualizacao`, `criacao`, `funcionario_id`) VALUES
(50, 12, 'Multa Velocidade Luís', 'HAR-8838', '2024-05-03 00:00:00', '2024-05-03 15:10:37', 2),
(49, 12, 'Multa Velocidade Luís', 'HAR-8838', '2024-05-03 00:00:00', '2024-05-03 15:10:35', 3),
(48, 11, 'Multa Alcool', 'test', '2024-05-03 15:11:15', '2024-05-03 15:10:32', 2),
(51, 12, 'teste', 'pxz-7185', '2024-05-21 19:02:46', '2024-05-21 19:02:46', 2);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_processos_relacionados`
--

CREATE TABLE `tb_processos_relacionados` (
  `id` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_processo` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Despejando dados para a tabela `tb_processos_relacionados`
--

INSERT INTO `tb_processos_relacionados` (`id`, `id_cliente`, `id_processo`) VALUES
(50, 15, 51),
(49, 15, 50),
(48, 15, 49),
(47, 15, 48);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_status`
--

CREATE TABLE `tb_status` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `mensagem` longtext NOT NULL,
  `cor` varchar(255) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Despejando dados para a tabela `tb_status`
--

INSERT INTO `tb_status` (`id`, `nome`, `mensagem`, `cor`) VALUES
(11, 'Pendente', 'Olá  {Nome_do_Cliente} seu processo : {Processo} Está com status :  {Status} ', '#f89145'),
(12, 'Concluida', 'Teste', '#1ce321');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_usuarios`
--

CREATE TABLE `tb_usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `ultimo_acesso` datetime NOT NULL,
  `email_recuperacao` varchar(255) NOT NULL,
  `privilegio` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Despejando dados para a tabela `tb_usuarios`
--

INSERT INTO `tb_usuarios` (`id`, `nome`, `senha`, `ultimo_acesso`, `email_recuperacao`, `privilegio`) VALUES
(1, '3', '2', '0000-00-00 00:00:00', '2', 3),
(2, 'Usuário Teste', 'galo1313', '2024-05-22 09:25:13', 'luisgustavo20061@gmail.com', 3),
(3, 'luis', 'galo123', '2024-05-23 08:47:49', 'luisgustavo20061@gmail.com', 3);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `tb_clientes`
--
ALTER TABLE `tb_clientes`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tb_contratos`
--
ALTER TABLE `tb_contratos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tb_contratos_relacionados`
--
ALTER TABLE `tb_contratos_relacionados`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tb_imagens_clientes`
--
ALTER TABLE `tb_imagens_clientes`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tb_imagens_processos`
--
ALTER TABLE `tb_imagens_processos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tb_notificacoes`
--
ALTER TABLE `tb_notificacoes`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tb_notificacoes_log`
--
ALTER TABLE `tb_notificacoes_log`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tb_processos`
--
ALTER TABLE `tb_processos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tb_processos_relacionados`
--
ALTER TABLE `tb_processos_relacionados`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tb_status`
--
ALTER TABLE `tb_status`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tb_usuarios`
--
ALTER TABLE `tb_usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `tb_clientes`
--
ALTER TABLE `tb_clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de tabela `tb_contratos`
--
ALTER TABLE `tb_contratos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de tabela `tb_contratos_relacionados`
--
ALTER TABLE `tb_contratos_relacionados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `tb_imagens_clientes`
--
ALTER TABLE `tb_imagens_clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT de tabela `tb_imagens_processos`
--
ALTER TABLE `tb_imagens_processos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=194;

--
-- AUTO_INCREMENT de tabela `tb_notificacoes`
--
ALTER TABLE `tb_notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `tb_notificacoes_log`
--
ALTER TABLE `tb_notificacoes_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `tb_processos`
--
ALTER TABLE `tb_processos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT de tabela `tb_processos_relacionados`
--
ALTER TABLE `tb_processos_relacionados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de tabela `tb_status`
--
ALTER TABLE `tb_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `tb_usuarios`
--
ALTER TABLE `tb_usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
