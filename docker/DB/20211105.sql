--
-- PostgreSQL database dump
--

-- Dumped from database version 13.1 (Debian 13.1-1.pgdg100+1)
-- Dumped by pg_dump version 13.3 (Ubuntu 13.3-1.pgdg20.04+1)

-- Started on 2021-11-05 21:12:37 CET

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 206 (class 1259 OID 19717)
-- Name: tb_ass_dinoz_item; Type: TABLE; Schema: public; Owner: etwin.dev.write
--

CREATE TABLE public.tb_ass_dinoz_item (
    id integer NOT NULL,
    "dinozId" integer,
    "itemId" integer NOT NULL
);


ALTER TABLE public.tb_ass_dinoz_item OWNER TO "etwin.dev.write";

--
-- TOC entry 205 (class 1259 OID 19715)
-- Name: tb_ass_dinoz_item_id_seq; Type: SEQUENCE; Schema: public; Owner: etwin.dev.write
--

CREATE SEQUENCE public.tb_ass_dinoz_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tb_ass_dinoz_item_id_seq OWNER TO "etwin.dev.write";

--
-- TOC entry 3032 (class 0 OID 0)
-- Dependencies: 205
-- Name: tb_ass_dinoz_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: etwin.dev.write
--

ALTER SEQUENCE public.tb_ass_dinoz_item_id_seq OWNED BY public.tb_ass_dinoz_item.id;


--
-- TOC entry 208 (class 1259 OID 19730)
-- Name: tb_ass_dinoz_skill; Type: TABLE; Schema: public; Owner: etwin.dev.write
--

CREATE TABLE public.tb_ass_dinoz_skill (
    id integer NOT NULL,
    "dinozId" integer,
    "skillId" integer NOT NULL,
    state boolean
);


ALTER TABLE public.tb_ass_dinoz_skill OWNER TO "etwin.dev.write";

--
-- TOC entry 207 (class 1259 OID 19728)
-- Name: tb_ass_dinoz_skill_id_seq; Type: SEQUENCE; Schema: public; Owner: etwin.dev.write
--

CREATE SEQUENCE public.tb_ass_dinoz_skill_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tb_ass_dinoz_skill_id_seq OWNER TO "etwin.dev.write";

--
-- TOC entry 3033 (class 0 OID 0)
-- Dependencies: 207
-- Name: tb_ass_dinoz_skill_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: etwin.dev.write
--

ALTER SEQUENCE public.tb_ass_dinoz_skill_id_seq OWNED BY public.tb_ass_dinoz_skill.id;


--
-- TOC entry 210 (class 1259 OID 19743)
-- Name: tb_ass_dinoz_status; Type: TABLE; Schema: public; Owner: etwin.dev.write
--

CREATE TABLE public.tb_ass_dinoz_status (
    id integer NOT NULL,
    "dinozId" integer,
    "statusId" integer
);


ALTER TABLE public.tb_ass_dinoz_status OWNER TO "etwin.dev.write";

--
-- TOC entry 209 (class 1259 OID 19741)
-- Name: tb_ass_dinoz_status_id_seq; Type: SEQUENCE; Schema: public; Owner: etwin.dev.write
--

CREATE SEQUENCE public.tb_ass_dinoz_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tb_ass_dinoz_status_id_seq OWNER TO "etwin.dev.write";

--
-- TOC entry 3034 (class 0 OID 0)
-- Dependencies: 209
-- Name: tb_ass_dinoz_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: etwin.dev.write
--

ALTER SEQUENCE public.tb_ass_dinoz_status_id_seq OWNED BY public.tb_ass_dinoz_status.id;


--
-- TOC entry 212 (class 1259 OID 19756)
-- Name: tb_ass_player_reward; Type: TABLE; Schema: public; Owner: etwin.dev.write
--

CREATE TABLE public.tb_ass_player_reward (
    id integer NOT NULL,
    "playerId" integer,
    "rewardId" integer
);


ALTER TABLE public.tb_ass_player_reward OWNER TO "etwin.dev.write";

--
-- TOC entry 211 (class 1259 OID 19754)
-- Name: tb_ass_player_reward_id_seq; Type: SEQUENCE; Schema: public; Owner: etwin.dev.write
--

CREATE SEQUENCE public.tb_ass_player_reward_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tb_ass_player_reward_id_seq OWNER TO "etwin.dev.write";

--
-- TOC entry 3035 (class 0 OID 0)
-- Dependencies: 211
-- Name: tb_ass_player_reward_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: etwin.dev.write
--

ALTER SEQUENCE public.tb_ass_player_reward_id_seq OWNED BY public.tb_ass_player_reward.id;


--
-- TOC entry 204 (class 1259 OID 19701)
-- Name: tb_dinoz; Type: TABLE; Schema: public; Owner: etwin.dev.write
--

CREATE TABLE public.tb_dinoz (
    "dinozId" integer NOT NULL,
    following integer,
    name character varying(255) NOT NULL,
    "isFrozen" boolean NOT NULL,
    "raceId" integer NOT NULL,
    level integer NOT NULL,
    "missionId" integer,
    "nextUpElementId" integer,
    "nextUpAltElementId" integer,
    "playerId" integer NOT NULL,
    "placeId" integer NOT NULL,
    "canChangeName" boolean NOT NULL,
    display character varying(255) NOT NULL,
    life integer NOT NULL,
    "maxLife" integer NOT NULL,
    experience integer NOT NULL,
    "canGather" boolean NOT NULL,
    "nbrUpFire" integer NOT NULL,
    "nbrUpWood" integer NOT NULL,
    "nbrUpWater" integer NOT NULL,
    "nbrUpLight" integer NOT NULL,
    "nbrUpAir" integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public.tb_dinoz OWNER TO "etwin.dev.write";

--
-- TOC entry 203 (class 1259 OID 19699)
-- Name: tb_dinoz_dinozId_seq; Type: SEQUENCE; Schema: public; Owner: etwin.dev.write
--

CREATE SEQUENCE public."tb_dinoz_dinozId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."tb_dinoz_dinozId_seq" OWNER TO "etwin.dev.write";

--
-- TOC entry 3036 (class 0 OID 0)
-- Dependencies: 203
-- Name: tb_dinoz_dinozId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: etwin.dev.write
--

ALTER SEQUENCE public."tb_dinoz_dinozId_seq" OWNED BY public.tb_dinoz."dinozId";


--
-- TOC entry 214 (class 1259 OID 19769)
-- Name: tb_dinoz_shop; Type: TABLE; Schema: public; Owner: etwin.dev.write
--

CREATE TABLE public.tb_dinoz_shop (
    id integer NOT NULL,
    "playerId" integer,
    "raceId" integer NOT NULL,
    display character varying(255) NOT NULL
);


ALTER TABLE public.tb_dinoz_shop OWNER TO "etwin.dev.write";

--
-- TOC entry 213 (class 1259 OID 19767)
-- Name: tb_dinoz_shop_id_seq; Type: SEQUENCE; Schema: public; Owner: etwin.dev.write
--

CREATE SEQUENCE public.tb_dinoz_shop_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tb_dinoz_shop_id_seq OWNER TO "etwin.dev.write";

--
-- TOC entry 3037 (class 0 OID 0)
-- Dependencies: 213
-- Name: tb_dinoz_shop_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: etwin.dev.write
--

ALTER SEQUENCE public.tb_dinoz_shop_id_seq OWNED BY public.tb_dinoz_shop.id;


--
-- TOC entry 200 (class 1259 OID 16423)
-- Name: tb_epic_reward; Type: TABLE; Schema: public; Owner: etwin.dev.write
--

CREATE TABLE public.tb_epic_reward (
    "rewardId" integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.tb_epic_reward OWNER TO "etwin.dev.write";

--
-- TOC entry 215 (class 1259 OID 19780)
-- Name: tb_item_own; Type: TABLE; Schema: public; Owner: etwin.dev.write
--

CREATE TABLE public.tb_item_own (
    id integer NOT NULL,
    "playerId" integer,
    "itemId" integer NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public.tb_item_own OWNER TO "etwin.dev.write";

--
-- TOC entry 202 (class 1259 OID 19690)
-- Name: tb_player; Type: TABLE; Schema: public; Owner: etwin.dev.write
--

CREATE TABLE public.tb_player (
    "playerId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "eternalTwinId" character varying(255) NOT NULL,
    money integer NOT NULL,
    "quetzuBought" integer NOT NULL,
    leader boolean NOT NULL,
    engineer boolean NOT NULL,
    cooker boolean NOT NULL,
    "shopKeeper" boolean NOT NULL,
    merchant boolean NOT NULL,
    priest boolean NOT NULL,
    teacher boolean NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public.tb_player OWNER TO "etwin.dev.write";

--
-- TOC entry 201 (class 1259 OID 19688)
-- Name: tb_player_playerId_seq; Type: SEQUENCE; Schema: public; Owner: etwin.dev.write
--

CREATE SEQUENCE public."tb_player_playerId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."tb_player_playerId_seq" OWNER TO "etwin.dev.write";

--
-- TOC entry 3038 (class 0 OID 0)
-- Dependencies: 201
-- Name: tb_player_playerId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: etwin.dev.write
--

ALTER SEQUENCE public."tb_player_playerId_seq" OWNED BY public.tb_player."playerId";


--
-- TOC entry 2851 (class 2604 OID 19720)
-- Name: tb_ass_dinoz_item id; Type: DEFAULT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_ass_dinoz_item ALTER COLUMN id SET DEFAULT nextval('public.tb_ass_dinoz_item_id_seq'::regclass);


--
-- TOC entry 2852 (class 2604 OID 19733)
-- Name: tb_ass_dinoz_skill id; Type: DEFAULT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_ass_dinoz_skill ALTER COLUMN id SET DEFAULT nextval('public.tb_ass_dinoz_skill_id_seq'::regclass);


--
-- TOC entry 2853 (class 2604 OID 19746)
-- Name: tb_ass_dinoz_status id; Type: DEFAULT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_ass_dinoz_status ALTER COLUMN id SET DEFAULT nextval('public.tb_ass_dinoz_status_id_seq'::regclass);


--
-- TOC entry 2854 (class 2604 OID 19759)
-- Name: tb_ass_player_reward id; Type: DEFAULT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_ass_player_reward ALTER COLUMN id SET DEFAULT nextval('public.tb_ass_player_reward_id_seq'::regclass);


--
-- TOC entry 2850 (class 2604 OID 19704)
-- Name: tb_dinoz dinozId; Type: DEFAULT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_dinoz ALTER COLUMN "dinozId" SET DEFAULT nextval('public."tb_dinoz_dinozId_seq"'::regclass);


--
-- TOC entry 2855 (class 2604 OID 19772)
-- Name: tb_dinoz_shop id; Type: DEFAULT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_dinoz_shop ALTER COLUMN id SET DEFAULT nextval('public.tb_dinoz_shop_id_seq'::regclass);


--
-- TOC entry 2849 (class 2604 OID 19693)
-- Name: tb_player playerId; Type: DEFAULT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_player ALTER COLUMN "playerId" SET DEFAULT nextval('public."tb_player_playerId_seq"'::regclass);


--
-- TOC entry 3017 (class 0 OID 19717)
-- Dependencies: 206
-- Data for Name: tb_ass_dinoz_item; Type: TABLE DATA; Schema: public; Owner: etwin.dev.write
--

COPY public.tb_ass_dinoz_item (id, "dinozId", "itemId") FROM stdin;
\.


--
-- TOC entry 3019 (class 0 OID 19730)
-- Dependencies: 208
-- Data for Name: tb_ass_dinoz_skill; Type: TABLE DATA; Schema: public; Owner: etwin.dev.write
--

COPY public.tb_ass_dinoz_skill (id, "dinozId", "skillId", state) FROM stdin;
\.


--
-- TOC entry 3021 (class 0 OID 19743)
-- Dependencies: 210
-- Data for Name: tb_ass_dinoz_status; Type: TABLE DATA; Schema: public; Owner: etwin.dev.write
--

COPY public.tb_ass_dinoz_status (id, "dinozId", "statusId") FROM stdin;
\.


--
-- TOC entry 3023 (class 0 OID 19756)
-- Dependencies: 212
-- Data for Name: tb_ass_player_reward; Type: TABLE DATA; Schema: public; Owner: etwin.dev.write
--

COPY public.tb_ass_player_reward (id, "playerId", "rewardId") FROM stdin;
\.


--
-- TOC entry 3015 (class 0 OID 19701)
-- Dependencies: 204
-- Data for Name: tb_dinoz; Type: TABLE DATA; Schema: public; Owner: etwin.dev.write
--

COPY public.tb_dinoz ("dinozId", following, name, "isFrozen", "raceId", level, "missionId", "nextUpElementId", "nextUpAltElementId", "playerId", "placeId", "canChangeName", display, life, "maxLife", experience, "canGather", "nbrUpFire", "nbrUpWood", "nbrUpWater", "nbrUpLight", "nbrUpAir", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3025 (class 0 OID 19769)
-- Dependencies: 214
-- Data for Name: tb_dinoz_shop; Type: TABLE DATA; Schema: public; Owner: etwin.dev.write
--

COPY public.tb_dinoz_shop (id, "playerId", "raceId", display) FROM stdin;
\.


--
-- TOC entry 3011 (class 0 OID 16423)
-- Dependencies: 200
-- Data for Name: tb_epic_reward; Type: TABLE DATA; Schema: public; Owner: etwin.dev.write
--

COPY public.tb_epic_reward ("rewardId", name) FROM stdin;
1	tropheeRocky
2	tropheeHippoclamp
3	tropheePteroz
4	tropheeQuetzu
\.


--
-- TOC entry 3026 (class 0 OID 19780)
-- Dependencies: 215
-- Data for Name: tb_item_own; Type: TABLE DATA; Schema: public; Owner: etwin.dev.write
--

COPY public.tb_item_own (id, "playerId", "itemId", quantity) FROM stdin;
\.


--
-- TOC entry 3013 (class 0 OID 19690)
-- Dependencies: 202
-- Data for Name: tb_player; Type: TABLE DATA; Schema: public; Owner: etwin.dev.write
--

COPY public.tb_player ("playerId", name, "eternalTwinId", money, "quetzuBought", leader, engineer, cooker, "shopKeeper", merchant, priest, teacher, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3039 (class 0 OID 0)
-- Dependencies: 205
-- Name: tb_ass_dinoz_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: etwin.dev.write
--

SELECT pg_catalog.setval('public.tb_ass_dinoz_item_id_seq', 1, false);


--
-- TOC entry 3040 (class 0 OID 0)
-- Dependencies: 207
-- Name: tb_ass_dinoz_skill_id_seq; Type: SEQUENCE SET; Schema: public; Owner: etwin.dev.write
--

SELECT pg_catalog.setval('public.tb_ass_dinoz_skill_id_seq', 1, false);


--
-- TOC entry 3041 (class 0 OID 0)
-- Dependencies: 209
-- Name: tb_ass_dinoz_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: etwin.dev.write
--

SELECT pg_catalog.setval('public.tb_ass_dinoz_status_id_seq', 1, false);


--
-- TOC entry 3042 (class 0 OID 0)
-- Dependencies: 211
-- Name: tb_ass_player_reward_id_seq; Type: SEQUENCE SET; Schema: public; Owner: etwin.dev.write
--

SELECT pg_catalog.setval('public.tb_ass_player_reward_id_seq', 1, false);


--
-- TOC entry 3043 (class 0 OID 0)
-- Dependencies: 203
-- Name: tb_dinoz_dinozId_seq; Type: SEQUENCE SET; Schema: public; Owner: etwin.dev.write
--

SELECT pg_catalog.setval('public."tb_dinoz_dinozId_seq"', 1, false);


--
-- TOC entry 3044 (class 0 OID 0)
-- Dependencies: 213
-- Name: tb_dinoz_shop_id_seq; Type: SEQUENCE SET; Schema: public; Owner: etwin.dev.write
--

SELECT pg_catalog.setval('public.tb_dinoz_shop_id_seq', 1, false);


--
-- TOC entry 3045 (class 0 OID 0)
-- Dependencies: 201
-- Name: tb_player_playerId_seq; Type: SEQUENCE SET; Schema: public; Owner: etwin.dev.write
--

SELECT pg_catalog.setval('public."tb_player_playerId_seq"', 1, false);


--
-- TOC entry 2863 (class 2606 OID 19722)
-- Name: tb_ass_dinoz_item tb_ass_dinoz_item_pkey; Type: CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_ass_dinoz_item
    ADD CONSTRAINT tb_ass_dinoz_item_pkey PRIMARY KEY (id);


--
-- TOC entry 2865 (class 2606 OID 19735)
-- Name: tb_ass_dinoz_skill tb_ass_dinoz_skill_pkey; Type: CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_ass_dinoz_skill
    ADD CONSTRAINT tb_ass_dinoz_skill_pkey PRIMARY KEY (id);


--
-- TOC entry 2867 (class 2606 OID 19748)
-- Name: tb_ass_dinoz_status tb_ass_dinoz_status_pkey; Type: CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_ass_dinoz_status
    ADD CONSTRAINT tb_ass_dinoz_status_pkey PRIMARY KEY (id);


--
-- TOC entry 2869 (class 2606 OID 19761)
-- Name: tb_ass_player_reward tb_ass_player_reward_pkey; Type: CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_ass_player_reward
    ADD CONSTRAINT tb_ass_player_reward_pkey PRIMARY KEY (id);


--
-- TOC entry 2861 (class 2606 OID 19709)
-- Name: tb_dinoz tb_dinoz_pkey; Type: CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT tb_dinoz_pkey PRIMARY KEY ("dinozId");


--
-- TOC entry 2871 (class 2606 OID 19774)
-- Name: tb_dinoz_shop tb_dinoz_shop_pkey; Type: CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_dinoz_shop
    ADD CONSTRAINT tb_dinoz_shop_pkey PRIMARY KEY (id);


--
-- TOC entry 2857 (class 2606 OID 16488)
-- Name: tb_epic_reward tb_epic_reward_pkey; Type: CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_epic_reward
    ADD CONSTRAINT tb_epic_reward_pkey PRIMARY KEY ("rewardId");


--
-- TOC entry 2873 (class 2606 OID 19784)
-- Name: tb_item_own tb_item_own_pkey; Type: CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_item_own
    ADD CONSTRAINT tb_item_own_pkey PRIMARY KEY (id);


--
-- TOC entry 2859 (class 2606 OID 19698)
-- Name: tb_player tb_player_pkey; Type: CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_player
    ADD CONSTRAINT tb_player_pkey PRIMARY KEY ("playerId");


--
-- TOC entry 2875 (class 2606 OID 19723)
-- Name: tb_ass_dinoz_item tb_ass_dinoz_item_dinozId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_ass_dinoz_item
    ADD CONSTRAINT "tb_ass_dinoz_item_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES public.tb_dinoz("dinozId") ON UPDATE CASCADE;


--
-- TOC entry 2876 (class 2606 OID 19736)
-- Name: tb_ass_dinoz_skill tb_ass_dinoz_skill_dinozId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_ass_dinoz_skill
    ADD CONSTRAINT "tb_ass_dinoz_skill_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES public.tb_dinoz("dinozId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2877 (class 2606 OID 19749)
-- Name: tb_ass_dinoz_status tb_ass_dinoz_status_dinozId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_ass_dinoz_status
    ADD CONSTRAINT "tb_ass_dinoz_status_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES public.tb_dinoz("dinozId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2878 (class 2606 OID 19762)
-- Name: tb_ass_player_reward tb_ass_player_reward_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_ass_player_reward
    ADD CONSTRAINT "tb_ass_player_reward_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.tb_player("playerId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2874 (class 2606 OID 19710)
-- Name: tb_dinoz tb_dinoz_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT "tb_dinoz_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.tb_player("playerId") ON UPDATE CASCADE;


--
-- TOC entry 2879 (class 2606 OID 19775)
-- Name: tb_dinoz_shop tb_dinoz_shop_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_dinoz_shop
    ADD CONSTRAINT "tb_dinoz_shop_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.tb_player("playerId") ON UPDATE CASCADE;


--
-- TOC entry 2880 (class 2606 OID 19785)
-- Name: tb_item_own tb_item_own_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: etwin.dev.write
--

ALTER TABLE ONLY public.tb_item_own
    ADD CONSTRAINT "tb_item_own_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.tb_player("playerId") ON UPDATE CASCADE;


-- Completed on 2021-11-05 21:12:39 CET

--
-- PostgreSQL database dump complete
--

