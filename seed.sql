--
-- PostgreSQL database dump
--

\restrict dHrT8IfwcM9THk9hXNOBJxSHjcFTgr0CEG3fYoCOO2roI82v7ruyre6NoHs7a9Q

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: cursos; Type: TABLE DATA; Schema: app; Owner: postgres
--

INSERT INTO app.cursos VALUES ('cb8b1e71-fb09-4ff8-8c50-e811df1c0a08', 'Análise e Desenvolvimento de Sistemas', 'ADS', true, '2026-06-22 15:10:54.898921-03', '2026-06-22 15:10:54.898921-03');


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: app; Owner: postgres
--



--
-- Data for Name: empresas; Type: TABLE DATA; Schema: app; Owner: postgres
--



--
-- Data for Name: perfis; Type: TABLE DATA; Schema: app; Owner: postgres
--

INSERT INTO app.perfis VALUES ('SOLICITANTE', 'Usuário comum / aluno', 'Cria registros e visualiza apenas informações relacionadas às próprias solicitações.');
INSERT INTO app.perfis VALUES ('ANALISTA', 'Orientador / atendente / analista', 'Visualiza registros sob sua responsabilidade, responde, altera status e acompanha o processo.');
INSERT INTO app.perfis VALUES ('COORDENADOR', 'Coordenação / gestor', 'Valida registros, acompanha relatórios, gerencia categorias e ações restritas do curso.');
INSERT INTO app.perfis VALUES ('ADMINISTRADOR', 'Administrador', 'Gerencia usuários, permissões, categorias, relatórios, logs e ações administrativas restritas.');


--
-- Data for Name: supervisores_empresa; Type: TABLE DATA; Schema: app; Owner: postgres
--



--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: app; Owner: postgres
--

INSERT INTO app.usuarios VALUES ('b8f55650-71f4-485f-863d-92aad9f4cdac', 'Administrador', 'admin@estagios.local', '$2a$12$BdGe29dIpuQ2NxsvkbMf/e5bYv2Po3HXdZD4sFBTc6OvnN2o6wV1q', 'ADMINISTRADOR', NULL, NULL, NULL, true, NULL, '2026-06-22 15:35:46.711013-03', '2026-06-22 15:35:46.711013-03', NULL);


--
-- Data for Name: registros; Type: TABLE DATA; Schema: app; Owner: postgres
--



--
-- Data for Name: acompanhamentos; Type: TABLE DATA; Schema: app; Owner: postgres
--



--
-- Data for Name: entregas; Type: TABLE DATA; Schema: app; Owner: postgres
--



--
-- Data for Name: anexos; Type: TABLE DATA; Schema: app; Owner: postgres
--



--
-- Data for Name: auditoria_logs; Type: TABLE DATA; Schema: app; Owner: postgres
--

INSERT INTO app.auditoria_logs VALUES (1, NULL, 'INSERT', 'app.usuarios', 'b8f55650-71f4-485f-863d-92aad9f4cdac', NULL, '{"id": "b8f55650-71f4-485f-863d-92aad9f4cdac", "ra": null, "nome": "Administrador", "ativo": true, "email": "admin@estagios.local", "perfil": "ADMINISTRADOR", "curso_id": null, "telefone": null, "created_at": "2026-06-22T15:35:46.711013-03:00", "deleted_at": null, "updated_at": "2026-06-22T15:35:46.711013-03:00", "ultimo_login_em": null}', NULL, NULL, '2026-06-22 15:35:46.711013-03');


--
-- Data for Name: incidentes_seguranca; Type: TABLE DATA; Schema: app; Owner: postgres
--



--
-- Data for Name: permissoes; Type: TABLE DATA; Schema: app; Owner: postgres
--

INSERT INTO app.permissoes VALUES ('23762846-2968-4ca7-bb05-13e431556685', 'registros', 'criar_proprio', 'Criar estágios ou projetos próprios.');
INSERT INTO app.permissoes VALUES ('89491f21-9929-4d9a-af3b-f68488ed2f4d', 'registros', 'ver_proprio', 'Visualizar os próprios registros.');
INSERT INTO app.permissoes VALUES ('23b14383-ce6f-433a-8248-c779d163ca52', 'registros', 'editar_proprio', 'Editar registros próprios em rascunho ou com ajustes solicitados.');
INSERT INTO app.permissoes VALUES ('5e1fce45-b51c-4aa0-b379-510e9667d661', 'registros', 'ver_atribuidos', 'Visualizar registros atribuídos ao orientador.');
INSERT INTO app.permissoes VALUES ('fa8a1958-4f15-4a4b-bea1-163831d97051', 'registros', 'acompanhar', 'Registrar pareceres de acompanhamento.');
INSERT INTO app.permissoes VALUES ('cd0feae7-2530-45d5-9a83-17a07ab24320', 'registros', 'validar', 'Validar, reprovar ou devolver registros para ajustes.');
INSERT INTO app.permissoes VALUES ('d504ab75-07e2-474c-a2d4-1d94ca67f31d', 'usuarios', 'gerenciar', 'Gerenciar usuários e perfis.');
INSERT INTO app.permissoes VALUES ('24ae89f5-b2c6-4138-b667-5f9814841e18', 'categorias', 'gerenciar', 'Gerenciar categorias de estágios e projetos.');
INSERT INTO app.permissoes VALUES ('edc8f4fe-b437-4aad-93cf-52f08f6e6138', 'logs', 'visualizar', 'Visualizar logs de auditoria.');
INSERT INTO app.permissoes VALUES ('2d9a10e7-2680-475d-a799-2066fcaadbc1', 'incidentes', 'gerenciar', 'Gerenciar incidentes de segurança.');


--
-- Data for Name: perfil_permissoes; Type: TABLE DATA; Schema: app; Owner: postgres
--

INSERT INTO app.perfil_permissoes VALUES ('SOLICITANTE', '23762846-2968-4ca7-bb05-13e431556685');
INSERT INTO app.perfil_permissoes VALUES ('SOLICITANTE', '23b14383-ce6f-433a-8248-c779d163ca52');
INSERT INTO app.perfil_permissoes VALUES ('SOLICITANTE', '89491f21-9929-4d9a-af3b-f68488ed2f4d');
INSERT INTO app.perfil_permissoes VALUES ('ANALISTA', 'fa8a1958-4f15-4a4b-bea1-163831d97051');
INSERT INTO app.perfil_permissoes VALUES ('ANALISTA', '5e1fce45-b51c-4aa0-b379-510e9667d661');
INSERT INTO app.perfil_permissoes VALUES ('COORDENADOR', 'cd0feae7-2530-45d5-9a83-17a07ab24320');
INSERT INTO app.perfil_permissoes VALUES ('COORDENADOR', '24ae89f5-b2c6-4138-b667-5f9814841e18');
INSERT INTO app.perfil_permissoes VALUES ('COORDENADOR', '2d9a10e7-2680-475d-a799-2066fcaadbc1');
INSERT INTO app.perfil_permissoes VALUES ('ADMINISTRADOR', '23762846-2968-4ca7-bb05-13e431556685');
INSERT INTO app.perfil_permissoes VALUES ('ADMINISTRADOR', '89491f21-9929-4d9a-af3b-f68488ed2f4d');
INSERT INTO app.perfil_permissoes VALUES ('ADMINISTRADOR', '23b14383-ce6f-433a-8248-c779d163ca52');
INSERT INTO app.perfil_permissoes VALUES ('ADMINISTRADOR', '5e1fce45-b51c-4aa0-b379-510e9667d661');
INSERT INTO app.perfil_permissoes VALUES ('ADMINISTRADOR', 'fa8a1958-4f15-4a4b-bea1-163831d97051');
INSERT INTO app.perfil_permissoes VALUES ('ADMINISTRADOR', 'cd0feae7-2530-45d5-9a83-17a07ab24320');
INSERT INTO app.perfil_permissoes VALUES ('ADMINISTRADOR', 'd504ab75-07e2-474c-a2d4-1d94ca67f31d');
INSERT INTO app.perfil_permissoes VALUES ('ADMINISTRADOR', '24ae89f5-b2c6-4138-b667-5f9814841e18');
INSERT INTO app.perfil_permissoes VALUES ('ADMINISTRADOR', 'edc8f4fe-b437-4aad-93cf-52f08f6e6138');
INSERT INTO app.perfil_permissoes VALUES ('ADMINISTRADOR', '2d9a10e7-2680-475d-a799-2066fcaadbc1');


--
-- Data for Name: validacoes; Type: TABLE DATA; Schema: app; Owner: postgres
--



--
-- Name: auditoria_logs_id_seq; Type: SEQUENCE SET; Schema: app; Owner: postgres
--

SELECT pg_catalog.setval('app.auditoria_logs_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

\unrestrict dHrT8IfwcM9THk9hXNOBJxSHjcFTgr0CEG3fYoCOO2roI82v7ruyre6NoHs7a9Q

