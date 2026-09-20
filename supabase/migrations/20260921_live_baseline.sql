--
-- PostgreSQL database dump
--

\restrict MwNrA60Y1LZJ6DrvnjdVfSNNRionepNM1N621Mka8LgMYRXZ5ylaUH14rSalvaO

-- Dumped from database version 17.11 (Debian 17.11-1.pgdg12+2)
-- Dumped by pg_dump version 17.11 (Debian 17.11-1.pgdg12+2)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: difficulty_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.difficulty_level AS ENUM (
    'easy',
    'medium',
    'hard'
);


--
-- Name: count_unique_visitors(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.count_unique_visitors() RETURNS bigint
    LANGUAGE sql STABLE
    AS $$
  SELECT COUNT(DISTINCT visitor_id) FROM site_visits;
$$;


--
-- Name: increment_view_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_view_count(row_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$ BEGIN UPDATE typing_test SET views = views + 1 WHERE id = row_id; END; $$;


--
-- Name: match_typing_test_embedding(public.vector, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.match_typing_test_embedding(query_embedding public.vector, match_language text DEFAULT NULL::text, match_limit integer DEFAULT 1) RETURNS TABLE(id uuid, similarity double precision)
    LANGUAGE sql STABLE
    AS $$ SELECT id, 1 - (content_embedding <=> query_embedding) AS similarity FROM typing_test WHERE content_embedding IS NOT NULL AND (match_language IS NULL OR language = match_language) ORDER BY content_embedding <=> query_embedding LIMIT match_limit; $$;


--
-- Name: update_modified_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievements (
    id integer NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    description text,
    icon text,
    xp_reward integer DEFAULT 50,
    category text DEFAULT 'speed'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.achievements_id_seq OWNED BY public.achievements.id;


--
-- Name: activity_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_log (
    id bigint NOT NULL,
    action text NOT NULL,
    entity text,
    actor_email text,
    ip text,
    status text DEFAULT 'success'::text NOT NULL,
    meta jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_log_id_seq OWNED BY public.activity_log.id;


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_settings (
    key text NOT NULL,
    value text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.badges (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    criteria text
);


--
-- Name: badges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.badges_id_seq OWNED BY public.badges.id;


--
-- Name: certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certificates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    wpm integer NOT NULL,
    accuracy real NOT NULL,
    errors integer DEFAULT 0,
    duration_seconds integer DEFAULT 60,
    test_title text DEFAULT 'Typing Speed Test'::text,
    is_valid boolean DEFAULT true,
    issued_at timestamp with time zone DEFAULT now(),
    user_id uuid
);


--
-- Name: exam_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exam_types (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: exam_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exam_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exam_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exam_types_id_seq OWNED BY public.exam_types.id;


--
-- Name: generation_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.generation_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    run_date date DEFAULT CURRENT_DATE NOT NULL,
    slot text NOT NULL,
    topic text,
    status text NOT NULL,
    test_id uuid,
    error text,
    attempt_count integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: referrals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referrals (
    id bigint NOT NULL,
    referrer_id uuid NOT NULL,
    referred_user_id uuid NOT NULL,
    code_used text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: referrals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.referrals ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.referrals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: site_visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_visits (
    id bigint NOT NULL,
    visitor_id uuid NOT NULL,
    path text,
    referrer text,
    user_agent text,
    ip_address text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: site_visits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.site_visits ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.site_visits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: test_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_sessions (
    id integer NOT NULL,
    user_id uuid,
    test_id integer,
    started_at timestamp with time zone DEFAULT now(),
    duration integer NOT NULL,
    gross_wpm integer,
    net_wpm integer,
    errors integer,
    accuracy real,
    mode text DEFAULT 'article'::text,
    cpm integer
);


--
-- Name: test_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.test_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: test_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.test_sessions_id_seq OWNED BY public.test_sessions.id;


--
-- Name: tests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tests (
    id integer NOT NULL,
    exam_type_id integer,
    title text NOT NULL,
    content text NOT NULL,
    duration integer NOT NULL,
    difficulty text,
    language text,
    created_by uuid
);


--
-- Name: tests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tests_id_seq OWNED BY public.tests.id;


--
-- Name: typing_test; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.typing_test (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    original_source text,
    content text NOT NULL,
    excerpt text,
    difficulty_level public.difficulty_level DEFAULT 'medium'::public.difficulty_level NOT NULL,
    word_count integer NOT NULL,
    estimated_read_time integer,
    typing_duration_options jsonb DEFAULT '["1min", "3min", "5min", "10min"]'::jsonb,
    category text,
    tags text[],
    featured_image text,
    seo_title text,
    seo_description text,
    keywords text[],
    is_featured boolean DEFAULT false,
    is_published boolean DEFAULT true,
    views integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    search_vector tsvector GENERATED ALWAYS AS (((setweight(to_tsvector('english'::regconfig, COALESCE(title, ''::text)), 'A'::"char") || setweight(to_tsvector('english'::regconfig, COALESCE(excerpt, ''::text)), 'B'::"char")) || setweight(to_tsvector('english'::regconfig, COALESCE(content, ''::text)), 'C'::"char"))) STORED,
    language text DEFAULT 'en'::text NOT NULL,
    keyboard_layout text,
    content_hash text,
    content_embedding public.vector(768),
    difficulty_breakdown jsonb,
    display_content text
);


--
-- Name: COLUMN typing_test.display_content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.typing_test.display_content IS 'Pre-conversion Unicode Devanagari text, only set for keyboard_layout=kruti_dev rows — content holds the raw keystroke sequence to type, this holds what it should look like once typed into a Kruti Dev font.';


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    user_id uuid NOT NULL,
    achievement_id integer NOT NULL,
    unlocked_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_badges (
    id integer NOT NULL,
    user_id uuid,
    badge_id integer,
    awarded_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_badges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_badges_id_seq OWNED BY public.user_badges.id;


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    username text,
    display_name text,
    avatar_url text,
    country text DEFAULT 'IN'::text,
    xp integer DEFAULT 0,
    level integer DEFAULT 1,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    last_test_date date,
    total_tests integer DEFAULT 0,
    best_wpm integer DEFAULT 0,
    avg_accuracy real DEFAULT 0,
    is_public boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    email text NOT NULL,
    name text,
    created_at timestamp with time zone DEFAULT now(),
    role text DEFAULT 'user'::text,
    is_banned boolean DEFAULT false NOT NULL,
    totp_secret text,
    totp_enabled boolean DEFAULT false NOT NULL,
    phone text,
    avatar_url text,
    referral_code text,
    referred_by uuid,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['user'::text, 'admin'::text])))
);


--
-- Name: achievements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements ALTER COLUMN id SET DEFAULT nextval('public.achievements_id_seq'::regclass);


--
-- Name: activity_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log ALTER COLUMN id SET DEFAULT nextval('public.activity_log_id_seq'::regclass);


--
-- Name: badges id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges ALTER COLUMN id SET DEFAULT nextval('public.badges_id_seq'::regclass);


--
-- Name: exam_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_types ALTER COLUMN id SET DEFAULT nextval('public.exam_types_id_seq'::regclass);


--
-- Name: test_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_sessions ALTER COLUMN id SET DEFAULT nextval('public.test_sessions_id_seq'::regclass);


--
-- Name: tests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests ALTER COLUMN id SET DEFAULT nextval('public.tests_id_seq'::regclass);


--
-- Name: user_badges id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges ALTER COLUMN id SET DEFAULT nextval('public.user_badges_id_seq'::regclass);


--
-- Name: achievements achievements_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_key_key UNIQUE (key);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: activity_log activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (key);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: exam_types exam_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_types
    ADD CONSTRAINT exam_types_pkey PRIMARY KEY (id);


--
-- Name: generation_log generation_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generation_log
    ADD CONSTRAINT generation_log_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_referred_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_user_id_key UNIQUE (referred_user_id);


--
-- Name: site_visits site_visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_visits
    ADD CONSTRAINT site_visits_pkey PRIMARY KEY (id);


--
-- Name: test_sessions test_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_sessions
    ADD CONSTRAINT test_sessions_pkey PRIMARY KEY (id);


--
-- Name: tests tests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (id);


--
-- Name: typing_test typing_test_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.typing_test
    ADD CONSTRAINT typing_test_pkey PRIMARY KEY (id);


--
-- Name: typing_test typing_test_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.typing_test
    ADD CONSTRAINT typing_test_slug_key UNIQUE (slug);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (user_id, achievement_id);


--
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_username_key UNIQUE (username);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_activity_log_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_log_created_at ON public.activity_log USING btree (created_at DESC);


--
-- Name: idx_generation_log_run_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generation_log_run_date ON public.generation_log USING btree (run_date DESC);


--
-- Name: idx_generation_log_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generation_log_status ON public.generation_log USING btree (status);


--
-- Name: idx_referrals_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_created ON public.referrals USING btree (created_at DESC);


--
-- Name: idx_referrals_referrer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_referrer ON public.referrals USING btree (referrer_id);


--
-- Name: idx_site_visits_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_site_visits_created ON public.site_visits USING btree (created_at DESC);


--
-- Name: idx_site_visits_visitor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_site_visits_visitor ON public.site_visits USING btree (visitor_id);


--
-- Name: idx_typing_test_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_typing_test_category ON public.typing_test USING btree (category);


--
-- Name: idx_typing_test_content_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_typing_test_content_hash ON public.typing_test USING btree (content_hash);


--
-- Name: idx_typing_test_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_typing_test_created_at ON public.typing_test USING btree (created_at DESC);


--
-- Name: idx_typing_test_difficulty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_typing_test_difficulty ON public.typing_test USING btree (difficulty_level);


--
-- Name: idx_typing_test_embedding; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_typing_test_embedding ON public.typing_test USING hnsw (content_embedding public.vector_cosine_ops);


--
-- Name: idx_typing_test_language; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_typing_test_language ON public.typing_test USING btree (language);


--
-- Name: idx_typing_test_layout; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_typing_test_layout ON public.typing_test USING btree (keyboard_layout);


--
-- Name: idx_typing_test_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_typing_test_search ON public.typing_test USING gin (search_vector);


--
-- Name: idx_typing_test_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_typing_test_slug ON public.typing_test USING btree (slug);


--
-- Name: idx_users_referral_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_users_referral_code ON public.users USING btree (referral_code) WHERE (referral_code IS NOT NULL);


--
-- Name: typing_test update_typing_test_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_typing_test_modtime BEFORE UPDATE ON public.typing_test FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: generation_log generation_log_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generation_log
    ADD CONSTRAINT generation_log_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.typing_test(id) ON DELETE SET NULL;


--
-- Name: test_sessions test_sessions_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_sessions
    ADD CONSTRAINT test_sessions_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id);


--
-- Name: test_sessions test_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_sessions
    ADD CONSTRAINT test_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: tests tests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: tests tests_exam_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_exam_type_id_fkey FOREIGN KEY (exam_type_id) REFERENCES public.exam_types(id);


--
-- Name: user_achievements user_achievements_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id);


--
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;


--
-- Name: user_badges user_badges_badge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id);


--
-- Name: user_badges user_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: activity_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

--
-- Name: app_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

--
-- Name: certificates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

--
-- Name: exam_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exam_types ENABLE ROW LEVEL SECURITY;

--
-- Name: generation_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.generation_log ENABLE ROW LEVEL SECURITY;

--
-- Name: referrals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

--
-- Name: site_visits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

--
-- Name: test_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: tests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

--
-- Name: typing_test; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.typing_test ENABLE ROW LEVEL SECURITY;

--
-- Name: user_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: user_badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict MwNrA60Y1LZJ6DrvnjdVfSNNRionepNM1N621Mka8LgMYRXZ5ylaUH14rSalvaO

