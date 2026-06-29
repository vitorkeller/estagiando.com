--
-- PostgreSQL database dump
--

\restrict mQBeDaCjjhN7huSKfP7zZc0fWmYhjfTI3nJ77WdGzdb7XxcGdMtEYWXlgsDnV9B

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
-- Name: app; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA app;


ALTER SCHEMA app OWNER TO postgres;

--
-- Name: status_registro; Type: TYPE; Schema: app; Owner: postgres
--

CREATE TYPE app.status_registro AS ENUM (
    'RASCUNHO',
    'ENVIADO',
    'EM_ANALISE',
    'AJUSTES_SOLICITADOS',
    'EM_ACOMPANHAMENTO',
    'CONCLUIDO',
    'VALIDADO',
    'REPROVADO',
    'CANCELADO'
);


ALTER TYPE app.status_registro OWNER TO postgres;

--
-- Name: tipo_documento; Type: TYPE; Schema: app; Owner: postgres
--

CREATE TYPE app.tipo_documento AS ENUM (
    'CONTRATO',
    'PLANO_ATIVIDADES',
    'TERMO_COMPROMISSO',
    'RELATORIO',
    'DECLARACAO',
    'OUTRO'
);


ALTER TYPE app.tipo_documento OWNER TO postgres;

--
-- Name: tipo_item; Type: TYPE; Schema: app; Owner: postgres
--

CREATE TYPE app.tipo_item AS ENUM (
    'ESTAGIO',
    'PROJETO'
);


ALTER TYPE app.tipo_item OWNER TO postgres;

--
-- Name: tipo_perfil; Type: TYPE; Schema: app; Owner: postgres
--

CREATE TYPE app.tipo_perfil AS ENUM (
    'SOLICITANTE',
    'ANALISTA',
    'COORDENADOR',
    'ADMINISTRADOR'
);


ALTER TYPE app.tipo_perfil OWNER TO postgres;

--
-- Name: admin_atualizar_usuario(uuid, app.tipo_perfil, uuid, boolean); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.admin_atualizar_usuario(p_usuario_id uuid, p_perfil app.tipo_perfil, p_curso_id uuid, p_ativo boolean) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'app', 'public', 'pg_temp'
    AS $$
BEGIN
  IF NOT app.is_admin() THEN
    RAISE EXCEPTION 'Apenas administrador pode alterar perfil, curso ou status de usuários.';
  END IF;

  UPDATE app.usuarios
  SET perfil = p_perfil,
      curso_id = p_curso_id,
      ativo = p_ativo,
      updated_at = now()
  WHERE id = p_usuario_id;
END;
$$;


ALTER FUNCTION app.admin_atualizar_usuario(p_usuario_id uuid, p_perfil app.tipo_perfil, p_curso_id uuid, p_ativo boolean) OWNER TO postgres;

--
-- Name: alterar_minha_senha(text, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.alterar_minha_senha(p_senha_atual text, p_nova_senha text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'app', 'public', 'pg_temp'
    AS $$
DECLARE
  v_usuario app.usuarios%ROWTYPE;
BEGIN
  SELECT *
  INTO v_usuario
  FROM app.usuarios
  WHERE id = app.current_user_id()
    AND ativo = true
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  IF v_usuario.senha_hash <> crypt(p_senha_atual, v_usuario.senha_hash) THEN
    RAISE EXCEPTION 'Senha atual inválida.';
  END IF;

  IF NOT app.senha_forte(p_nova_senha) THEN
    RAISE EXCEPTION 'A nova senha não atende aos critérios mínimos.';
  END IF;

  UPDATE app.usuarios
  SET senha_hash = crypt(p_nova_senha, gen_salt('bf', 12)),
      updated_at = now()
  WHERE id = v_usuario.id;
END;
$$;


ALTER FUNCTION app.alterar_minha_senha(p_senha_atual text, p_nova_senha text) OWNER TO postgres;

--
-- Name: auditar_linha(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.auditar_linha() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'app', 'public', 'pg_temp'
    AS $$
DECLARE
  v_old jsonb;
  v_new jsonb;
  v_registro_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
    v_new := NULL;
    v_registro_id := OLD.id;
  ELSE
    v_old := CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END;
    v_new := to_jsonb(NEW);
    v_registro_id := NEW.id;
  END IF;

  -- Não registrar hash de senha nos logs.
  IF TG_TABLE_NAME = 'usuarios' THEN
    v_old := v_old - 'senha_hash';
    v_new := v_new - 'senha_hash';
  END IF;

  INSERT INTO app.auditoria_logs (
    usuario_id,
    acao,
    tabela,
    registro_id,
    dados_anteriores,
    dados_novos,
    ip,
    user_agent
  )
  VALUES (
    app.current_user_id(),
    TG_OP,
    TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
    v_registro_id,
    v_old,
    v_new,
    app.current_request_ip(),
    app.current_user_agent()
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION app.auditar_linha() OWNER TO postgres;

--
-- Name: autenticar(public.citext, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.autenticar(p_email public.citext, p_senha text) RETURNS TABLE(usuario_id uuid, nome text, email public.citext, perfil app.tipo_perfil, curso_id uuid)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'app', 'public', 'pg_temp'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.nome,
    u.email,
    u.perfil,
    u.curso_id
  FROM app.usuarios u
  WHERE u.email = p_email
    AND u.ativo = true
    AND u.deleted_at IS NULL
    AND u.senha_hash = crypt(p_senha, u.senha_hash);
END;
$$;


ALTER FUNCTION app.autenticar(p_email public.citext, p_senha text) OWNER TO postgres;

--
-- Name: criar_usuario(text, public.citext, text, app.tipo_perfil, uuid, text, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.criar_usuario(p_nome text, p_email public.citext, p_senha text, p_perfil app.tipo_perfil DEFAULT 'SOLICITANTE'::app.tipo_perfil, p_curso_id uuid DEFAULT NULL::uuid, p_ra text DEFAULT NULL::text, p_telefone text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'app', 'public', 'pg_temp'
    AS $$
DECLARE
  v_id uuid;
  v_perfil_atual app.tipo_perfil;
BEGIN
  v_perfil_atual := app.current_perfil();

  IF NOT app.senha_forte(p_senha) THEN
    RAISE EXCEPTION 'A senha deve ter pelo menos 10 caracteres, letra maiúscula, letra minúscula, número e símbolo.';
  END IF;

  -- Sem login, só permite auto cadastro como solicitante.
  -- Usuários privilegiados só podem ser criados por administrador.
  IF p_perfil <> 'SOLICITANTE' AND v_perfil_atual <> 'ADMINISTRADOR' THEN
    RAISE EXCEPTION 'Apenas administrador pode criar usuários privilegiados.';
  END IF;

  INSERT INTO app.usuarios (
    nome,
    email,
    senha_hash,
    perfil,
    curso_id,
    ra,
    telefone
  )
  VALUES (
    trim(p_nome),
    p_email,
    crypt(p_senha, gen_salt('bf', 12)),
    p_perfil,
    p_curso_id,
    p_ra,
    p_telefone
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;


ALTER FUNCTION app.criar_usuario(p_nome text, p_email public.citext, p_senha text, p_perfil app.tipo_perfil, p_curso_id uuid, p_ra text, p_telefone text) OWNER TO postgres;

--
-- Name: current_curso_id(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.current_curso_id() RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'app', 'public', 'pg_temp'
    AS $$
  SELECT u.curso_id
  FROM app.usuarios u
  WHERE u.id = app.current_user_id()
    AND u.ativo = true
    AND u.deleted_at IS NULL;
$$;


ALTER FUNCTION app.current_curso_id() OWNER TO postgres;

--
-- Name: current_perfil(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.current_perfil() RETURNS app.tipo_perfil
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'app', 'public', 'pg_temp'
    AS $$
  SELECT u.perfil
  FROM app.usuarios u
  WHERE u.id = app.current_user_id()
    AND u.ativo = true
    AND u.deleted_at IS NULL;
$$;


ALTER FUNCTION app.current_perfil() OWNER TO postgres;

--
-- Name: current_request_ip(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.current_request_ip() RETURNS inet
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
  v_ip text;
BEGIN
  v_ip := current_setting('app.request_ip', true);

  IF v_ip IS NULL OR v_ip = '' THEN
    RETURN NULL;
  END IF;

  RETURN v_ip::inet;

EXCEPTION WHEN invalid_text_representation THEN
  RETURN NULL;
END;
$$;


ALTER FUNCTION app.current_request_ip() OWNER TO postgres;

--
-- Name: current_user_agent(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.current_user_agent() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT NULLIF(current_setting('app.user_agent', true), '');
$$;


ALTER FUNCTION app.current_user_agent() OWNER TO postgres;

--
-- Name: current_user_id(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.current_user_id() RETURNS uuid
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
  v_user_id text;
BEGIN
  v_user_id := current_setting('app.current_user_id', true);

  IF v_user_id IS NULL OR v_user_id = '' THEN
    RETURN NULL;
  END IF;

  RETURN v_user_id::uuid;

EXCEPTION WHEN invalid_text_representation THEN
  RETURN NULL;
END;
$$;


ALTER FUNCTION app.current_user_id() OWNER TO postgres;

--
-- Name: is_admin(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.is_admin() RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT app.current_perfil() = 'ADMINISTRADOR';
$$;


ALTER FUNCTION app.is_admin() OWNER TO postgres;

--
-- Name: is_coordenador_do_curso(uuid); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.is_coordenador_do_curso(p_curso_id uuid) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT
    app.current_perfil() = 'ADMINISTRADOR'
    OR (
      app.current_perfil() = 'COORDENADOR'
      AND app.current_curso_id() = p_curso_id
    );
$$;


ALTER FUNCTION app.is_coordenador_do_curso(p_curso_id uuid) OWNER TO postgres;

--
-- Name: pode_ver_registro(uuid); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.pode_ver_registro(p_registro_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'app', 'public', 'pg_temp'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM app.registros r
    WHERE r.id = p_registro_id
      AND (
        app.is_admin()
        OR r.aluno_id = app.current_user_id()
        OR r.orientador_id = app.current_user_id()
        OR app.is_coordenador_do_curso(r.curso_id)
      )
  );
$$;


ALTER FUNCTION app.pode_ver_registro(p_registro_id uuid) OWNER TO postgres;

--
-- Name: senha_forte(text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.senha_forte(p_senha text) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $$
  SELECT
    p_senha IS NOT NULL
    AND length(p_senha) >= 10
    AND p_senha ~ '[A-Z]'
    AND p_senha ~ '[a-z]'
    AND p_senha ~ '[0-9]'
    AND p_senha ~ '[^A-Za-z0-9]';
$$;


ALTER FUNCTION app.senha_forte(p_senha text) OWNER TO postgres;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION app.set_updated_at() OWNER TO postgres;

--
-- Name: validar_regras_registro(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.validar_regras_registro() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_user uuid;
  v_perfil app.tipo_perfil;
BEGIN
  v_user := app.current_user_id();
  v_perfil := app.current_perfil();

  IF v_user IS NULL OR v_perfil IS NULL THEN
    RAISE EXCEPTION 'Sessão não autenticada.';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF v_perfil = 'SOLICITANTE' THEN
      IF NEW.aluno_id <> v_user THEN
        RAISE EXCEPTION 'Aluno só pode criar registros para si mesmo.';
      END IF;

      IF NEW.status NOT IN ('RASCUNHO', 'ENVIADO') THEN
        RAISE EXCEPTION 'Aluno só pode criar registro como rascunho ou enviado.';
      END IF;
    END IF;

    IF v_perfil = 'ANALISTA' THEN
      RAISE EXCEPTION 'Orientador não cria registro em nome do aluno.';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF v_perfil = 'ADMINISTRADOR' THEN
      -- Administrador pode realizar manutenção.
      NULL;

    ELSIF v_perfil = 'SOLICITANTE' THEN
      IF OLD.aluno_id <> v_user THEN
        RAISE EXCEPTION 'Aluno só pode alterar o próprio registro.';
      END IF;

      IF OLD.status NOT IN ('RASCUNHO', 'AJUSTES_SOLICITADOS') THEN
        RAISE EXCEPTION 'Aluno só pode editar registros em rascunho ou com ajustes solicitados.';
      END IF;

      IF NEW.status NOT IN ('RASCUNHO', 'ENVIADO') THEN
        RAISE EXCEPTION 'Aluno só pode manter rascunho ou enviar para análise.';
      END IF;

      IF NEW.aluno_id IS DISTINCT FROM OLD.aluno_id
         OR NEW.curso_id IS DISTINCT FROM OLD.curso_id
         OR NEW.validado_por IS DISTINCT FROM OLD.validado_por
         OR NEW.validado_em IS DISTINCT FROM OLD.validado_em THEN
        RAISE EXCEPTION 'Aluno não pode alterar campos administrativos.';
      END IF;

    ELSIF v_perfil = 'ANALISTA' THEN
      IF OLD.orientador_id <> v_user THEN
        RAISE EXCEPTION 'Orientador só pode alterar registros sob sua responsabilidade.';
      END IF;

      IF NEW.status NOT IN (
        'EM_ANALISE',
        'AJUSTES_SOLICITADOS',
        'EM_ACOMPANHAMENTO',
        'CONCLUIDO'
      ) THEN
        RAISE EXCEPTION 'Status não permitido para orientador.';
      END IF;

      IF NEW.aluno_id IS DISTINCT FROM OLD.aluno_id
         OR NEW.curso_id IS DISTINCT FROM OLD.curso_id
         OR NEW.orientador_id IS DISTINCT FROM OLD.orientador_id THEN
        RAISE EXCEPTION 'Orientador não pode alterar aluno, curso ou responsável.';
      END IF;

    ELSIF v_perfil = 'COORDENADOR' THEN
      IF NOT app.is_coordenador_do_curso(OLD.curso_id) THEN
        RAISE EXCEPTION 'Coordenador só pode alterar registros do próprio curso.';
      END IF;

      IF NEW.status NOT IN (
        'EM_ANALISE',
        'AJUSTES_SOLICITADOS',
        'VALIDADO',
        'REPROVADO',
        'CANCELADO'
      ) THEN
        RAISE EXCEPTION 'Status não permitido para coordenação.';
      END IF;

    ELSE
      RAISE EXCEPTION 'Perfil não autorizado.';
    END IF;
  END IF;

  IF NEW.status = 'ENVIADO' AND NEW.enviado_em IS NULL THEN
    NEW.enviado_em := now();
  END IF;

  IF NEW.status = 'VALIDADO' THEN
    NEW.validado_em := COALESCE(NEW.validado_em, now());
    NEW.validado_por := COALESCE(NEW.validado_por, v_user);
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION app.validar_regras_registro() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: acompanhamentos; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.acompanhamentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    registro_id uuid NOT NULL,
    autor_id uuid DEFAULT app.current_user_id() NOT NULL,
    parecer text NOT NULL,
    status_sugerido app.status_registro,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.acompanhamentos OWNER TO postgres;

--
-- Name: anexos; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.anexos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    registro_id uuid NOT NULL,
    entrega_id uuid,
    enviado_por uuid DEFAULT app.current_user_id() NOT NULL,
    nome_arquivo text NOT NULL,
    mime_type text NOT NULL,
    tamanho_bytes bigint NOT NULL,
    storage_key text NOT NULL,
    sha256 text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT anexos_sha256_chk CHECK ((sha256 ~ '^[a-f0-9]{64}$'::text)),
    CONSTRAINT anexos_tamanho_chk CHECK ((tamanho_bytes > 0))
);


ALTER TABLE app.anexos OWNER TO postgres;

--
-- Name: auditoria_logs; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.auditoria_logs (
    id bigint NOT NULL,
    usuario_id uuid,
    acao text NOT NULL,
    tabela text NOT NULL,
    registro_id uuid,
    dados_anteriores jsonb,
    dados_novos jsonb,
    ip inet,
    user_agent text,
    criado_em timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.auditoria_logs OWNER TO postgres;

--
-- Name: auditoria_logs_id_seq; Type: SEQUENCE; Schema: app; Owner: postgres
--

CREATE SEQUENCE app.auditoria_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.auditoria_logs_id_seq OWNER TO postgres;

--
-- Name: auditoria_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: postgres
--

ALTER SEQUENCE app.auditoria_logs_id_seq OWNED BY app.auditoria_logs.id;


--
-- Name: categorias; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.categorias (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    curso_id uuid,
    tipo app.tipo_item NOT NULL,
    nome text NOT NULL,
    descricao text,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.categorias OWNER TO postgres;

--
-- Name: cursos; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.cursos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    codigo text NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.cursos OWNER TO postgres;

--
-- Name: empresas; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.empresas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    razao_social text NOT NULL,
    nome_fantasia text,
    cnpj text,
    email_contato public.citext,
    telefone text,
    endereco text,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.empresas OWNER TO postgres;

--
-- Name: entregas; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.entregas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    registro_id uuid NOT NULL,
    aluno_id uuid DEFAULT app.current_user_id() NOT NULL,
    tipo_documento app.tipo_documento NOT NULL,
    titulo text NOT NULL,
    conteudo text,
    versao integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.entregas OWNER TO postgres;

--
-- Name: incidentes_seguranca; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.incidentes_seguranca (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reportado_por uuid DEFAULT app.current_user_id(),
    severidade text NOT NULL,
    descricao text NOT NULL,
    impacto_estimado text,
    acao_contencao text,
    acao_correcao text,
    acao_recuperacao text,
    status text DEFAULT 'ABERTO'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    encerrado_em timestamp with time zone,
    CONSTRAINT incidentes_severidade_chk CHECK ((severidade = ANY (ARRAY['BAIXA'::text, 'MEDIA'::text, 'ALTA'::text, 'CRITICA'::text]))),
    CONSTRAINT incidentes_status_chk CHECK ((status = ANY (ARRAY['ABERTO'::text, 'EM_TRATAMENTO'::text, 'ENCERRADO'::text])))
);


ALTER TABLE app.incidentes_seguranca OWNER TO postgres;

--
-- Name: perfil_permissoes; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.perfil_permissoes (
    perfil app.tipo_perfil NOT NULL,
    permissao_id uuid NOT NULL
);


ALTER TABLE app.perfil_permissoes OWNER TO postgres;

--
-- Name: perfis; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.perfis (
    codigo app.tipo_perfil NOT NULL,
    nome text NOT NULL,
    responsabilidade text NOT NULL
);


ALTER TABLE app.perfis OWNER TO postgres;

--
-- Name: permissoes; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.permissoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recurso text NOT NULL,
    acao text NOT NULL,
    descricao text NOT NULL
);


ALTER TABLE app.permissoes OWNER TO postgres;

--
-- Name: registros; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.registros (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tipo app.tipo_item NOT NULL,
    categoria_id uuid,
    aluno_id uuid NOT NULL,
    curso_id uuid NOT NULL,
    orientador_id uuid,
    empresa_id uuid,
    supervisor_id uuid,
    titulo text NOT NULL,
    descricao text,
    data_inicio date,
    data_fim date,
    carga_horaria integer,
    repo_url text,
    status app.status_registro DEFAULT 'RASCUNHO'::app.status_registro NOT NULL,
    enviado_em timestamp with time zone,
    validado_em timestamp with time zone,
    validado_por uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT registros_carga_chk CHECK (((carga_horaria IS NULL) OR (carga_horaria > 0))),
    CONSTRAINT registros_estagio_empresa_chk CHECK (((tipo <> 'ESTAGIO'::app.tipo_item) OR (status = 'RASCUNHO'::app.status_registro) OR (empresa_id IS NOT NULL))),
    CONSTRAINT registros_periodo_chk CHECK (((data_fim IS NULL) OR (data_inicio IS NULL) OR (data_fim >= data_inicio)))
);


ALTER TABLE app.registros OWNER TO postgres;

--
-- Name: supervisores_empresa; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.supervisores_empresa (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    nome text NOT NULL,
    email public.citext,
    telefone text,
    cargo text,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.supervisores_empresa OWNER TO postgres;

--
-- Name: usuarios; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.usuarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    email public.citext NOT NULL,
    senha_hash text NOT NULL,
    perfil app.tipo_perfil NOT NULL,
    curso_id uuid,
    ra text,
    telefone text,
    ativo boolean DEFAULT true NOT NULL,
    ultimo_login_em timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT usuarios_email_valido_chk CHECK ((POSITION(('@'::text) IN ((email)::text)) > 1)),
    CONSTRAINT usuarios_senha_hash_chk CHECK ((senha_hash ~ '^\$2[aby]\$[0-9]{2}\$'::text))
);


ALTER TABLE app.usuarios OWNER TO postgres;

--
-- Name: validacoes; Type: TABLE; Schema: app; Owner: postgres
--

CREATE TABLE app.validacoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    registro_id uuid NOT NULL,
    coordenador_id uuid DEFAULT app.current_user_id() NOT NULL,
    status app.status_registro NOT NULL,
    parecer text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT validacoes_status_chk CHECK ((status = ANY (ARRAY['VALIDADO'::app.status_registro, 'REPROVADO'::app.status_registro, 'AJUSTES_SOLICITADOS'::app.status_registro])))
);


ALTER TABLE app.validacoes OWNER TO postgres;

--
-- Name: auditoria_logs id; Type: DEFAULT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.auditoria_logs ALTER COLUMN id SET DEFAULT nextval('app.auditoria_logs_id_seq'::regclass);


--
-- Name: acompanhamentos acompanhamentos_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.acompanhamentos
    ADD CONSTRAINT acompanhamentos_pkey PRIMARY KEY (id);


--
-- Name: anexos anexos_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.anexos
    ADD CONSTRAINT anexos_pkey PRIMARY KEY (id);


--
-- Name: anexos anexos_storage_key_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.anexos
    ADD CONSTRAINT anexos_storage_key_key UNIQUE (storage_key);


--
-- Name: auditoria_logs auditoria_logs_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.auditoria_logs
    ADD CONSTRAINT auditoria_logs_pkey PRIMARY KEY (id);


--
-- Name: categorias categorias_curso_id_tipo_nome_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.categorias
    ADD CONSTRAINT categorias_curso_id_tipo_nome_key UNIQUE (curso_id, tipo, nome);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- Name: cursos cursos_codigo_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.cursos
    ADD CONSTRAINT cursos_codigo_key UNIQUE (codigo);


--
-- Name: cursos cursos_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.cursos
    ADD CONSTRAINT cursos_pkey PRIMARY KEY (id);


--
-- Name: empresas empresas_cnpj_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.empresas
    ADD CONSTRAINT empresas_cnpj_key UNIQUE (cnpj);


--
-- Name: empresas empresas_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.empresas
    ADD CONSTRAINT empresas_pkey PRIMARY KEY (id);


--
-- Name: entregas entregas_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.entregas
    ADD CONSTRAINT entregas_pkey PRIMARY KEY (id);


--
-- Name: entregas entregas_registro_id_tipo_documento_versao_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.entregas
    ADD CONSTRAINT entregas_registro_id_tipo_documento_versao_key UNIQUE (registro_id, tipo_documento, versao);


--
-- Name: incidentes_seguranca incidentes_seguranca_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.incidentes_seguranca
    ADD CONSTRAINT incidentes_seguranca_pkey PRIMARY KEY (id);


--
-- Name: perfil_permissoes perfil_permissoes_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.perfil_permissoes
    ADD CONSTRAINT perfil_permissoes_pkey PRIMARY KEY (perfil, permissao_id);


--
-- Name: perfis perfis_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.perfis
    ADD CONSTRAINT perfis_pkey PRIMARY KEY (codigo);


--
-- Name: permissoes permissoes_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.permissoes
    ADD CONSTRAINT permissoes_pkey PRIMARY KEY (id);


--
-- Name: permissoes permissoes_recurso_acao_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.permissoes
    ADD CONSTRAINT permissoes_recurso_acao_key UNIQUE (recurso, acao);


--
-- Name: registros registros_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.registros
    ADD CONSTRAINT registros_pkey PRIMARY KEY (id);


--
-- Name: supervisores_empresa supervisores_empresa_empresa_id_email_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.supervisores_empresa
    ADD CONSTRAINT supervisores_empresa_empresa_id_email_key UNIQUE (empresa_id, email);


--
-- Name: supervisores_empresa supervisores_empresa_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.supervisores_empresa
    ADD CONSTRAINT supervisores_empresa_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_ra_key; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.usuarios
    ADD CONSTRAINT usuarios_ra_key UNIQUE (ra);


--
-- Name: validacoes validacoes_pkey; Type: CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.validacoes
    ADD CONSTRAINT validacoes_pkey PRIMARY KEY (id);


--
-- Name: idx_acompanhamentos_registro; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_acompanhamentos_registro ON app.acompanhamentos USING btree (registro_id);


--
-- Name: idx_anexos_registro; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_anexos_registro ON app.anexos USING btree (registro_id);


--
-- Name: idx_auditoria_tabela_registro; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_auditoria_tabela_registro ON app.auditoria_logs USING btree (tabela, registro_id);


--
-- Name: idx_auditoria_usuario; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_auditoria_usuario ON app.auditoria_logs USING btree (usuario_id);


--
-- Name: idx_entregas_registro; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_entregas_registro ON app.entregas USING btree (registro_id);


--
-- Name: idx_registros_aluno; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_registros_aluno ON app.registros USING btree (aluno_id);


--
-- Name: idx_registros_curso; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_registros_curso ON app.registros USING btree (curso_id);


--
-- Name: idx_registros_orientador; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_registros_orientador ON app.registros USING btree (orientador_id);


--
-- Name: idx_registros_status; Type: INDEX; Schema: app; Owner: postgres
--

CREATE INDEX idx_registros_status ON app.registros USING btree (status);


--
-- Name: acompanhamentos auditoria_acompanhamentos; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER auditoria_acompanhamentos AFTER INSERT OR DELETE OR UPDATE ON app.acompanhamentos FOR EACH ROW EXECUTE FUNCTION app.auditar_linha();


--
-- Name: anexos auditoria_anexos; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER auditoria_anexos AFTER INSERT OR DELETE OR UPDATE ON app.anexos FOR EACH ROW EXECUTE FUNCTION app.auditar_linha();


--
-- Name: categorias auditoria_categorias; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER auditoria_categorias AFTER INSERT OR DELETE OR UPDATE ON app.categorias FOR EACH ROW EXECUTE FUNCTION app.auditar_linha();


--
-- Name: cursos auditoria_cursos; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER auditoria_cursos AFTER INSERT OR DELETE OR UPDATE ON app.cursos FOR EACH ROW EXECUTE FUNCTION app.auditar_linha();


--
-- Name: empresas auditoria_empresas; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER auditoria_empresas AFTER INSERT OR DELETE OR UPDATE ON app.empresas FOR EACH ROW EXECUTE FUNCTION app.auditar_linha();


--
-- Name: entregas auditoria_entregas; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER auditoria_entregas AFTER INSERT OR DELETE OR UPDATE ON app.entregas FOR EACH ROW EXECUTE FUNCTION app.auditar_linha();


--
-- Name: incidentes_seguranca auditoria_incidentes; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER auditoria_incidentes AFTER INSERT OR DELETE OR UPDATE ON app.incidentes_seguranca FOR EACH ROW EXECUTE FUNCTION app.auditar_linha();


--
-- Name: registros auditoria_registros; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER auditoria_registros AFTER INSERT OR DELETE OR UPDATE ON app.registros FOR EACH ROW EXECUTE FUNCTION app.auditar_linha();


--
-- Name: supervisores_empresa auditoria_supervisores; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER auditoria_supervisores AFTER INSERT OR DELETE OR UPDATE ON app.supervisores_empresa FOR EACH ROW EXECUTE FUNCTION app.auditar_linha();


--
-- Name: usuarios auditoria_usuarios; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER auditoria_usuarios AFTER INSERT OR DELETE OR UPDATE ON app.usuarios FOR EACH ROW EXECUTE FUNCTION app.auditar_linha();


--
-- Name: validacoes auditoria_validacoes; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER auditoria_validacoes AFTER INSERT OR DELETE OR UPDATE ON app.validacoes FOR EACH ROW EXECUTE FUNCTION app.auditar_linha();


--
-- Name: categorias categorias_set_updated_at; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER categorias_set_updated_at BEFORE UPDATE ON app.categorias FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: cursos cursos_set_updated_at; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER cursos_set_updated_at BEFORE UPDATE ON app.cursos FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: empresas empresas_set_updated_at; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER empresas_set_updated_at BEFORE UPDATE ON app.empresas FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: entregas entregas_set_updated_at; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER entregas_set_updated_at BEFORE UPDATE ON app.entregas FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: incidentes_seguranca incidentes_set_updated_at; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER incidentes_set_updated_at BEFORE UPDATE ON app.incidentes_seguranca FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: registros registros_set_updated_at; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER registros_set_updated_at BEFORE UPDATE ON app.registros FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: registros registros_validar_regras; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER registros_validar_regras BEFORE INSERT OR UPDATE ON app.registros FOR EACH ROW EXECUTE FUNCTION app.validar_regras_registro();


--
-- Name: supervisores_empresa supervisores_set_updated_at; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER supervisores_set_updated_at BEFORE UPDATE ON app.supervisores_empresa FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: usuarios usuarios_set_updated_at; Type: TRIGGER; Schema: app; Owner: postgres
--

CREATE TRIGGER usuarios_set_updated_at BEFORE UPDATE ON app.usuarios FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: acompanhamentos acompanhamentos_autor_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.acompanhamentos
    ADD CONSTRAINT acompanhamentos_autor_id_fkey FOREIGN KEY (autor_id) REFERENCES app.usuarios(id);


--
-- Name: acompanhamentos acompanhamentos_registro_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.acompanhamentos
    ADD CONSTRAINT acompanhamentos_registro_id_fkey FOREIGN KEY (registro_id) REFERENCES app.registros(id) ON DELETE CASCADE;


--
-- Name: anexos anexos_entrega_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.anexos
    ADD CONSTRAINT anexos_entrega_id_fkey FOREIGN KEY (entrega_id) REFERENCES app.entregas(id) ON DELETE CASCADE;


--
-- Name: anexos anexos_enviado_por_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.anexos
    ADD CONSTRAINT anexos_enviado_por_fkey FOREIGN KEY (enviado_por) REFERENCES app.usuarios(id);


--
-- Name: anexos anexos_registro_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.anexos
    ADD CONSTRAINT anexos_registro_id_fkey FOREIGN KEY (registro_id) REFERENCES app.registros(id) ON DELETE CASCADE;


--
-- Name: categorias categorias_curso_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.categorias
    ADD CONSTRAINT categorias_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES app.cursos(id);


--
-- Name: entregas entregas_aluno_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.entregas
    ADD CONSTRAINT entregas_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES app.usuarios(id);


--
-- Name: entregas entregas_registro_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.entregas
    ADD CONSTRAINT entregas_registro_id_fkey FOREIGN KEY (registro_id) REFERENCES app.registros(id) ON DELETE CASCADE;


--
-- Name: incidentes_seguranca incidentes_seguranca_reportado_por_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.incidentes_seguranca
    ADD CONSTRAINT incidentes_seguranca_reportado_por_fkey FOREIGN KEY (reportado_por) REFERENCES app.usuarios(id);


--
-- Name: perfil_permissoes perfil_permissoes_perfil_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.perfil_permissoes
    ADD CONSTRAINT perfil_permissoes_perfil_fkey FOREIGN KEY (perfil) REFERENCES app.perfis(codigo) ON DELETE CASCADE;


--
-- Name: perfil_permissoes perfil_permissoes_permissao_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.perfil_permissoes
    ADD CONSTRAINT perfil_permissoes_permissao_id_fkey FOREIGN KEY (permissao_id) REFERENCES app.permissoes(id) ON DELETE CASCADE;


--
-- Name: registros registros_aluno_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.registros
    ADD CONSTRAINT registros_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES app.usuarios(id);


--
-- Name: registros registros_categoria_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.registros
    ADD CONSTRAINT registros_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES app.categorias(id);


--
-- Name: registros registros_curso_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.registros
    ADD CONSTRAINT registros_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES app.cursos(id);


--
-- Name: registros registros_empresa_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.registros
    ADD CONSTRAINT registros_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES app.empresas(id);


--
-- Name: registros registros_orientador_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.registros
    ADD CONSTRAINT registros_orientador_id_fkey FOREIGN KEY (orientador_id) REFERENCES app.usuarios(id);


--
-- Name: registros registros_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.registros
    ADD CONSTRAINT registros_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES app.supervisores_empresa(id);


--
-- Name: registros registros_validado_por_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.registros
    ADD CONSTRAINT registros_validado_por_fkey FOREIGN KEY (validado_por) REFERENCES app.usuarios(id);


--
-- Name: supervisores_empresa supervisores_empresa_empresa_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.supervisores_empresa
    ADD CONSTRAINT supervisores_empresa_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES app.empresas(id) ON DELETE CASCADE;


--
-- Name: usuarios usuarios_curso_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.usuarios
    ADD CONSTRAINT usuarios_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES app.cursos(id);


--
-- Name: usuarios usuarios_perfil_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.usuarios
    ADD CONSTRAINT usuarios_perfil_fkey FOREIGN KEY (perfil) REFERENCES app.perfis(codigo);


--
-- Name: validacoes validacoes_coordenador_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.validacoes
    ADD CONSTRAINT validacoes_coordenador_id_fkey FOREIGN KEY (coordenador_id) REFERENCES app.usuarios(id);


--
-- Name: validacoes validacoes_registro_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: postgres
--

ALTER TABLE ONLY app.validacoes
    ADD CONSTRAINT validacoes_registro_id_fkey FOREIGN KEY (registro_id) REFERENCES app.registros(id) ON DELETE CASCADE;


--
-- Name: acompanhamentos; Type: ROW SECURITY; Schema: app; Owner: postgres
--

ALTER TABLE app.acompanhamentos ENABLE ROW LEVEL SECURITY;

--
-- Name: acompanhamentos acompanhamentos_delete_admin; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY acompanhamentos_delete_admin ON app.acompanhamentos FOR DELETE USING (app.is_admin());


--
-- Name: acompanhamentos acompanhamentos_insert; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY acompanhamentos_insert ON app.acompanhamentos FOR INSERT WITH CHECK (((autor_id = app.current_user_id()) AND app.pode_ver_registro(registro_id)));


--
-- Name: acompanhamentos acompanhamentos_select; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY acompanhamentos_select ON app.acompanhamentos FOR SELECT USING (app.pode_ver_registro(registro_id));


--
-- Name: acompanhamentos acompanhamentos_update_admin; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY acompanhamentos_update_admin ON app.acompanhamentos FOR UPDATE USING (app.is_admin()) WITH CHECK (app.is_admin());


--
-- Name: anexos; Type: ROW SECURITY; Schema: app; Owner: postgres
--

ALTER TABLE app.anexos ENABLE ROW LEVEL SECURITY;

--
-- Name: anexos anexos_delete; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY anexos_delete ON app.anexos FOR DELETE USING ((app.is_admin() OR (enviado_por = app.current_user_id())));


--
-- Name: anexos anexos_insert; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY anexos_insert ON app.anexos FOR INSERT WITH CHECK (((enviado_por = app.current_user_id()) AND app.pode_ver_registro(registro_id)));


--
-- Name: anexos anexos_select; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY anexos_select ON app.anexos FOR SELECT USING (app.pode_ver_registro(registro_id));


--
-- Name: auditoria_logs; Type: ROW SECURITY; Schema: app; Owner: postgres
--

ALTER TABLE app.auditoria_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: auditoria_logs auditoria_select_admin; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY auditoria_select_admin ON app.auditoria_logs FOR SELECT USING (app.is_admin());


--
-- Name: categorias; Type: ROW SECURITY; Schema: app; Owner: postgres
--

ALTER TABLE app.categorias ENABLE ROW LEVEL SECURITY;

--
-- Name: categorias categorias_insert; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY categorias_insert ON app.categorias FOR INSERT WITH CHECK ((app.is_admin() OR ((app.current_perfil() = 'COORDENADOR'::app.tipo_perfil) AND ((curso_id IS NULL) OR (curso_id = app.current_curso_id())))));


--
-- Name: categorias categorias_select; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY categorias_select ON app.categorias FOR SELECT USING ((app.current_user_id() IS NOT NULL));


--
-- Name: categorias categorias_update; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY categorias_update ON app.categorias FOR UPDATE USING ((app.is_admin() OR ((app.current_perfil() = 'COORDENADOR'::app.tipo_perfil) AND ((curso_id IS NULL) OR (curso_id = app.current_curso_id()))))) WITH CHECK ((app.is_admin() OR ((app.current_perfil() = 'COORDENADOR'::app.tipo_perfil) AND ((curso_id IS NULL) OR (curso_id = app.current_curso_id())))));


--
-- Name: cursos; Type: ROW SECURITY; Schema: app; Owner: postgres
--

ALTER TABLE app.cursos ENABLE ROW LEVEL SECURITY;

--
-- Name: cursos cursos_admin_all; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY cursos_admin_all ON app.cursos USING (app.is_admin()) WITH CHECK (app.is_admin());


--
-- Name: cursos cursos_select; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY cursos_select ON app.cursos FOR SELECT USING ((app.current_user_id() IS NOT NULL));


--
-- Name: empresas; Type: ROW SECURITY; Schema: app; Owner: postgres
--

ALTER TABLE app.empresas ENABLE ROW LEVEL SECURITY;

--
-- Name: empresas empresas_delete_admin; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY empresas_delete_admin ON app.empresas FOR DELETE USING (app.is_admin());


--
-- Name: empresas empresas_insert; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY empresas_insert ON app.empresas FOR INSERT WITH CHECK ((app.current_user_id() IS NOT NULL));


--
-- Name: empresas empresas_select; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY empresas_select ON app.empresas FOR SELECT USING ((app.current_user_id() IS NOT NULL));


--
-- Name: empresas empresas_update; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY empresas_update ON app.empresas FOR UPDATE USING ((app.current_perfil() = ANY (ARRAY['ANALISTA'::app.tipo_perfil, 'COORDENADOR'::app.tipo_perfil, 'ADMINISTRADOR'::app.tipo_perfil]))) WITH CHECK ((app.current_perfil() = ANY (ARRAY['ANALISTA'::app.tipo_perfil, 'COORDENADOR'::app.tipo_perfil, 'ADMINISTRADOR'::app.tipo_perfil])));


--
-- Name: entregas; Type: ROW SECURITY; Schema: app; Owner: postgres
--

ALTER TABLE app.entregas ENABLE ROW LEVEL SECURITY;

--
-- Name: entregas entregas_delete; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY entregas_delete ON app.entregas FOR DELETE USING ((app.is_admin() OR (aluno_id = app.current_user_id())));


--
-- Name: entregas entregas_insert; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY entregas_insert ON app.entregas FOR INSERT WITH CHECK (((aluno_id = app.current_user_id()) AND app.pode_ver_registro(registro_id)));


--
-- Name: entregas entregas_select; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY entregas_select ON app.entregas FOR SELECT USING (app.pode_ver_registro(registro_id));


--
-- Name: entregas entregas_update; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY entregas_update ON app.entregas FOR UPDATE USING ((app.is_admin() OR (aluno_id = app.current_user_id()))) WITH CHECK ((app.is_admin() OR (aluno_id = app.current_user_id())));


--
-- Name: incidentes_seguranca incidentes_insert; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY incidentes_insert ON app.incidentes_seguranca FOR INSERT WITH CHECK (((reportado_por = app.current_user_id()) OR app.is_admin()));


--
-- Name: incidentes_seguranca; Type: ROW SECURITY; Schema: app; Owner: postgres
--

ALTER TABLE app.incidentes_seguranca ENABLE ROW LEVEL SECURITY;

--
-- Name: incidentes_seguranca incidentes_select; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY incidentes_select ON app.incidentes_seguranca FOR SELECT USING ((app.is_admin() OR (app.current_perfil() = 'COORDENADOR'::app.tipo_perfil) OR (reportado_por = app.current_user_id())));


--
-- Name: incidentes_seguranca incidentes_update; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY incidentes_update ON app.incidentes_seguranca FOR UPDATE USING ((app.is_admin() OR (app.current_perfil() = 'COORDENADOR'::app.tipo_perfil))) WITH CHECK ((app.is_admin() OR (app.current_perfil() = 'COORDENADOR'::app.tipo_perfil)));


--
-- Name: perfil_permissoes; Type: ROW SECURITY; Schema: app; Owner: postgres
--

ALTER TABLE app.perfil_permissoes ENABLE ROW LEVEL SECURITY;

--
-- Name: perfil_permissoes perfil_permissoes_select; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY perfil_permissoes_select ON app.perfil_permissoes FOR SELECT USING ((app.current_user_id() IS NOT NULL));


--
-- Name: perfis; Type: ROW SECURITY; Schema: app; Owner: postgres
--

ALTER TABLE app.perfis ENABLE ROW LEVEL SECURITY;

--
-- Name: perfis perfis_select; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY perfis_select ON app.perfis FOR SELECT USING ((app.current_user_id() IS NOT NULL));


--
-- Name: permissoes; Type: ROW SECURITY; Schema: app; Owner: postgres
--

ALTER TABLE app.permissoes ENABLE ROW LEVEL SECURITY;

--
-- Name: permissoes permissoes_select; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY permissoes_select ON app.permissoes FOR SELECT USING ((app.current_user_id() IS NOT NULL));


--
-- Name: registros; Type: ROW SECURITY; Schema: app; Owner: postgres
--

ALTER TABLE app.registros ENABLE ROW LEVEL SECURITY;

--
-- Name: registros registros_delete_admin; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY registros_delete_admin ON app.registros FOR DELETE USING (app.is_admin());


--
-- Name: registros registros_insert; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY registros_insert ON app.registros FOR INSERT WITH CHECK ((app.is_admin() OR app.is_coordenador_do_curso(curso_id) OR ((app.current_perfil() = 'SOLICITANTE'::app.tipo_perfil) AND (aluno_id = app.current_user_id()) AND (status = ANY (ARRAY['RASCUNHO'::app.status_registro, 'ENVIADO'::app.status_registro])))));


--
-- Name: registros registros_select; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY registros_select ON app.registros FOR SELECT USING ((app.is_admin() OR (aluno_id = app.current_user_id()) OR (orientador_id = app.current_user_id()) OR app.is_coordenador_do_curso(curso_id)));


--
-- Name: registros registros_update; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY registros_update ON app.registros FOR UPDATE USING ((app.is_admin() OR (aluno_id = app.current_user_id()) OR (orientador_id = app.current_user_id()) OR app.is_coordenador_do_curso(curso_id))) WITH CHECK ((app.is_admin() OR (aluno_id = app.current_user_id()) OR (orientador_id = app.current_user_id()) OR app.is_coordenador_do_curso(curso_id)));


--
-- Name: supervisores_empresa supervisores_delete_admin; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY supervisores_delete_admin ON app.supervisores_empresa FOR DELETE USING (app.is_admin());


--
-- Name: supervisores_empresa; Type: ROW SECURITY; Schema: app; Owner: postgres
--

ALTER TABLE app.supervisores_empresa ENABLE ROW LEVEL SECURITY;

--
-- Name: supervisores_empresa supervisores_insert; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY supervisores_insert ON app.supervisores_empresa FOR INSERT WITH CHECK ((app.current_user_id() IS NOT NULL));


--
-- Name: supervisores_empresa supervisores_select; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY supervisores_select ON app.supervisores_empresa FOR SELECT USING ((app.current_user_id() IS NOT NULL));


--
-- Name: supervisores_empresa supervisores_update; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY supervisores_update ON app.supervisores_empresa FOR UPDATE USING ((app.current_perfil() = ANY (ARRAY['ANALISTA'::app.tipo_perfil, 'COORDENADOR'::app.tipo_perfil, 'ADMINISTRADOR'::app.tipo_perfil]))) WITH CHECK ((app.current_perfil() = ANY (ARRAY['ANALISTA'::app.tipo_perfil, 'COORDENADOR'::app.tipo_perfil, 'ADMINISTRADOR'::app.tipo_perfil])));


--
-- Name: usuarios; Type: ROW SECURITY; Schema: app; Owner: postgres
--

ALTER TABLE app.usuarios ENABLE ROW LEVEL SECURITY;

--
-- Name: usuarios usuarios_select; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY usuarios_select ON app.usuarios FOR SELECT USING ((app.is_admin() OR (id = app.current_user_id()) OR ((app.current_perfil() = ANY (ARRAY['ANALISTA'::app.tipo_perfil, 'COORDENADOR'::app.tipo_perfil])) AND (curso_id = app.current_curso_id()))));


--
-- Name: usuarios usuarios_update_self; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY usuarios_update_self ON app.usuarios FOR UPDATE USING ((app.is_admin() OR (id = app.current_user_id()))) WITH CHECK ((app.is_admin() OR (id = app.current_user_id())));


--
-- Name: validacoes; Type: ROW SECURITY; Schema: app; Owner: postgres
--

ALTER TABLE app.validacoes ENABLE ROW LEVEL SECURITY;

--
-- Name: validacoes validacoes_insert; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY validacoes_insert ON app.validacoes FOR INSERT WITH CHECK (((coordenador_id = app.current_user_id()) AND (EXISTS ( SELECT 1
   FROM app.registros r
  WHERE ((r.id = validacoes.registro_id) AND app.is_coordenador_do_curso(r.curso_id))))));


--
-- Name: validacoes validacoes_select; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY validacoes_select ON app.validacoes FOR SELECT USING (app.pode_ver_registro(registro_id));


--
-- Name: validacoes validacoes_update_admin; Type: POLICY; Schema: app; Owner: postgres
--

CREATE POLICY validacoes_update_admin ON app.validacoes FOR UPDATE USING (app.is_admin()) WITH CHECK (app.is_admin());


--
-- Name: SCHEMA app; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA app TO estagios_app;


--
-- Name: TYPE status_registro; Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON TYPE app.status_registro TO estagios_app;


--
-- Name: TYPE tipo_documento; Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON TYPE app.tipo_documento TO estagios_app;


--
-- Name: TYPE tipo_item; Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON TYPE app.tipo_item TO estagios_app;


--
-- Name: TYPE tipo_perfil; Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON TYPE app.tipo_perfil TO estagios_app;


--
-- Name: FUNCTION admin_atualizar_usuario(p_usuario_id uuid, p_perfil app.tipo_perfil, p_curso_id uuid, p_ativo boolean); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.admin_atualizar_usuario(p_usuario_id uuid, p_perfil app.tipo_perfil, p_curso_id uuid, p_ativo boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION app.admin_atualizar_usuario(p_usuario_id uuid, p_perfil app.tipo_perfil, p_curso_id uuid, p_ativo boolean) TO estagios_app;


--
-- Name: FUNCTION alterar_minha_senha(p_senha_atual text, p_nova_senha text); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.alterar_minha_senha(p_senha_atual text, p_nova_senha text) FROM PUBLIC;
GRANT ALL ON FUNCTION app.alterar_minha_senha(p_senha_atual text, p_nova_senha text) TO estagios_app;


--
-- Name: FUNCTION auditar_linha(); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.auditar_linha() FROM PUBLIC;
GRANT ALL ON FUNCTION app.auditar_linha() TO estagios_app;


--
-- Name: FUNCTION autenticar(p_email public.citext, p_senha text); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.autenticar(p_email public.citext, p_senha text) FROM PUBLIC;
GRANT ALL ON FUNCTION app.autenticar(p_email public.citext, p_senha text) TO estagios_app;


--
-- Name: FUNCTION criar_usuario(p_nome text, p_email public.citext, p_senha text, p_perfil app.tipo_perfil, p_curso_id uuid, p_ra text, p_telefone text); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.criar_usuario(p_nome text, p_email public.citext, p_senha text, p_perfil app.tipo_perfil, p_curso_id uuid, p_ra text, p_telefone text) FROM PUBLIC;
GRANT ALL ON FUNCTION app.criar_usuario(p_nome text, p_email public.citext, p_senha text, p_perfil app.tipo_perfil, p_curso_id uuid, p_ra text, p_telefone text) TO estagios_app;


--
-- Name: FUNCTION current_curso_id(); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.current_curso_id() FROM PUBLIC;
GRANT ALL ON FUNCTION app.current_curso_id() TO estagios_app;


--
-- Name: FUNCTION current_perfil(); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.current_perfil() FROM PUBLIC;
GRANT ALL ON FUNCTION app.current_perfil() TO estagios_app;


--
-- Name: FUNCTION current_request_ip(); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.current_request_ip() FROM PUBLIC;
GRANT ALL ON FUNCTION app.current_request_ip() TO estagios_app;


--
-- Name: FUNCTION current_user_agent(); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.current_user_agent() FROM PUBLIC;
GRANT ALL ON FUNCTION app.current_user_agent() TO estagios_app;


--
-- Name: FUNCTION current_user_id(); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.current_user_id() FROM PUBLIC;
GRANT ALL ON FUNCTION app.current_user_id() TO estagios_app;


--
-- Name: FUNCTION is_admin(); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.is_admin() FROM PUBLIC;
GRANT ALL ON FUNCTION app.is_admin() TO estagios_app;


--
-- Name: FUNCTION is_coordenador_do_curso(p_curso_id uuid); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.is_coordenador_do_curso(p_curso_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION app.is_coordenador_do_curso(p_curso_id uuid) TO estagios_app;


--
-- Name: FUNCTION pode_ver_registro(p_registro_id uuid); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.pode_ver_registro(p_registro_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION app.pode_ver_registro(p_registro_id uuid) TO estagios_app;


--
-- Name: FUNCTION senha_forte(p_senha text); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.senha_forte(p_senha text) FROM PUBLIC;
GRANT ALL ON FUNCTION app.senha_forte(p_senha text) TO estagios_app;


--
-- Name: FUNCTION set_updated_at(); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.set_updated_at() FROM PUBLIC;
GRANT ALL ON FUNCTION app.set_updated_at() TO estagios_app;


--
-- Name: FUNCTION validar_regras_registro(); Type: ACL; Schema: app; Owner: postgres
--

REVOKE ALL ON FUNCTION app.validar_regras_registro() FROM PUBLIC;
GRANT ALL ON FUNCTION app.validar_regras_registro() TO estagios_app;


--
-- Name: TABLE acompanhamentos; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE app.acompanhamentos TO estagios_app;


--
-- Name: TABLE anexos; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE app.anexos TO estagios_app;


--
-- Name: TABLE auditoria_logs; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT ON TABLE app.auditoria_logs TO estagios_app;


--
-- Name: SEQUENCE auditoria_logs_id_seq; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE app.auditoria_logs_id_seq TO estagios_app;


--
-- Name: TABLE categorias; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT ON TABLE app.categorias TO estagios_app;


--
-- Name: TABLE cursos; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT ON TABLE app.cursos TO estagios_app;


--
-- Name: TABLE empresas; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE app.empresas TO estagios_app;


--
-- Name: TABLE entregas; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE app.entregas TO estagios_app;


--
-- Name: TABLE incidentes_seguranca; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE app.incidentes_seguranca TO estagios_app;


--
-- Name: TABLE perfil_permissoes; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT ON TABLE app.perfil_permissoes TO estagios_app;


--
-- Name: TABLE perfis; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT ON TABLE app.perfis TO estagios_app;


--
-- Name: TABLE permissoes; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT ON TABLE app.permissoes TO estagios_app;


--
-- Name: TABLE registros; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE app.registros TO estagios_app;


--
-- Name: TABLE supervisores_empresa; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE app.supervisores_empresa TO estagios_app;


--
-- Name: COLUMN usuarios.id; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT(id) ON TABLE app.usuarios TO estagios_app;


--
-- Name: COLUMN usuarios.nome; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT(nome),UPDATE(nome) ON TABLE app.usuarios TO estagios_app;


--
-- Name: COLUMN usuarios.email; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT(email) ON TABLE app.usuarios TO estagios_app;


--
-- Name: COLUMN usuarios.perfil; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT(perfil) ON TABLE app.usuarios TO estagios_app;


--
-- Name: COLUMN usuarios.curso_id; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT(curso_id) ON TABLE app.usuarios TO estagios_app;


--
-- Name: COLUMN usuarios.ra; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT(ra) ON TABLE app.usuarios TO estagios_app;


--
-- Name: COLUMN usuarios.telefone; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT(telefone),UPDATE(telefone) ON TABLE app.usuarios TO estagios_app;


--
-- Name: COLUMN usuarios.ativo; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT(ativo) ON TABLE app.usuarios TO estagios_app;


--
-- Name: COLUMN usuarios.ultimo_login_em; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT(ultimo_login_em) ON TABLE app.usuarios TO estagios_app;


--
-- Name: COLUMN usuarios.created_at; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT(created_at) ON TABLE app.usuarios TO estagios_app;


--
-- Name: COLUMN usuarios.updated_at; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT(updated_at),UPDATE(updated_at) ON TABLE app.usuarios TO estagios_app;


--
-- Name: COLUMN usuarios.deleted_at; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT(deleted_at) ON TABLE app.usuarios TO estagios_app;


--
-- Name: TABLE validacoes; Type: ACL; Schema: app; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE app.validacoes TO estagios_app;


--
-- PostgreSQL database dump complete
--

\unrestrict mQBeDaCjjhN7huSKfP7zZc0fWmYhjfTI3nJ77WdGzdb7XxcGdMtEYWXlgsDnV9B

