--
-- PostgreSQL database dump
--

-- Dumped from database version 13.1 (Debian 13.1-1.pgdg100+1)
-- Dumped by pg_dump version 13.3 (Ubuntu 13.3-1.pgdg20.04+1)

-- Started on 2021-08-20 10:13:03 CEST

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
-- TOC entry 211 (class 1259 OID 19780)
-- Name: tb_ass_dinoz_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_ass_dinoz_item (
    id integer NOT NULL,
    "dinozId" integer,
    "itemId" integer
);


ALTER TABLE public.tb_ass_dinoz_item OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 19778)
-- Name: tb_ass_dinoz_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_ass_dinoz_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tb_ass_dinoz_item_id_seq OWNER TO postgres;

--
-- TOC entry 3113 (class 0 OID 0)
-- Dependencies: 210
-- Name: tb_ass_dinoz_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_ass_dinoz_item_id_seq OWNED BY public.tb_ass_dinoz_item.id;


--
-- TOC entry 212 (class 1259 OID 19796)
-- Name: tb_ass_dinoz_skill; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_ass_dinoz_skill (
    "dinozId" integer NOT NULL,
    "skillId" integer NOT NULL
);


ALTER TABLE public.tb_ass_dinoz_skill OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 19816)
-- Name: tb_ass_dinoz_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_ass_dinoz_status (
    "dinozId" integer NOT NULL,
    "statusId" integer NOT NULL
);


ALTER TABLE public.tb_ass_dinoz_status OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 19836)
-- Name: tb_ass_player_reward; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_ass_player_reward (
    "playerId" integer NOT NULL,
    "rewardId" integer NOT NULL
);


ALTER TABLE public.tb_ass_player_reward OWNER TO postgres;

--
-- TOC entry 208 (class 1259 OID 19734)
-- Name: tb_dinoz; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.tb_dinoz OWNER TO postgres;

--
-- TOC entry 207 (class 1259 OID 19732)
-- Name: tb_dinoz_dinozId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."tb_dinoz_dinozId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."tb_dinoz_dinozId_seq" OWNER TO postgres;

--
-- TOC entry 3114 (class 0 OID 0)
-- Dependencies: 207
-- Name: tb_dinoz_dinozId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."tb_dinoz_dinozId_seq" OWNED BY public.tb_dinoz."dinozId";


--
-- TOC entry 201 (class 1259 OID 19696)
-- Name: tb_dinoz_race; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_dinoz_race (
    "raceId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "skillId" integer
);


ALTER TABLE public.tb_dinoz_race OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 19853)
-- Name: tb_dinoz_shop; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_dinoz_shop (
    id integer NOT NULL,
    "playerId" integer,
    "raceId" integer,
    display character varying(255) NOT NULL
);


ALTER TABLE public.tb_dinoz_shop OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 19851)
-- Name: tb_dinoz_shop_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_dinoz_shop_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tb_dinoz_shop_id_seq OWNER TO postgres;

--
-- TOC entry 3115 (class 0 OID 0)
-- Dependencies: 217
-- Name: tb_dinoz_shop_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_dinoz_shop_id_seq OWNED BY public.tb_dinoz_shop.id;


--
-- TOC entry 203 (class 1259 OID 19711)
-- Name: tb_element; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_element (
    "elementId" integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.tb_element OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 19831)
-- Name: tb_epic_reward; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_epic_reward (
    "rewardId" integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.tb_epic_reward OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 19874)
-- Name: tb_ingredient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_ingredient (
    "ingredientId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "ingredientGridTypeId" integer NOT NULL
);


ALTER TABLE public.tb_ingredient OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 19891)
-- Name: tb_ingredient_grid; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_ingredient_grid (
    "gridId" integer NOT NULL,
    "playerId" integer NOT NULL,
    "ingredientGridTypeId" integer NOT NULL,
    "placeId" integer NOT NULL,
    "ingredientGridId" integer
);


ALTER TABLE public.tb_ingredient_grid OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 19889)
-- Name: tb_ingredient_grid_gridId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."tb_ingredient_grid_gridId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."tb_ingredient_grid_gridId_seq" OWNER TO postgres;

--
-- TOC entry 3116 (class 0 OID 0)
-- Dependencies: 221
-- Name: tb_ingredient_grid_gridId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."tb_ingredient_grid_gridId_seq" OWNED BY public.tb_ingredient_grid."gridId";


--
-- TOC entry 219 (class 1259 OID 19869)
-- Name: tb_ingredient_grid_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_ingredient_grid_type (
    "ingredientGridTypeId" integer NOT NULL,
    length integer NOT NULL,
    width integer NOT NULL
);


ALTER TABLE public.tb_ingredient_grid_type OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 19773)
-- Name: tb_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_item (
    "itemId" integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.tb_item OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 19917)
-- Name: tb_item_own; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_item_own (
    id integer NOT NULL,
    "playerId" integer,
    "itemId" integer,
    quantity integer NOT NULL
);


ALTER TABLE public.tb_item_own OWNER TO postgres;

--
-- TOC entry 202 (class 1259 OID 19706)
-- Name: tb_mission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_mission (
    "missionId" integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.tb_mission OWNER TO postgres;

--
-- TOC entry 206 (class 1259 OID 19727)
-- Name: tb_place; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_place (
    "placeId" integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.tb_place OWNER TO postgres;

--
-- TOC entry 205 (class 1259 OID 19718)
-- Name: tb_player; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.tb_player OWNER TO postgres;

--
-- TOC entry 204 (class 1259 OID 19716)
-- Name: tb_player_playerId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."tb_player_playerId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."tb_player_playerId_seq" OWNER TO postgres;

--
-- TOC entry 3117 (class 0 OID 0)
-- Dependencies: 204
-- Name: tb_player_playerId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."tb_player_playerId_seq" OWNED BY public.tb_player."playerId";


--
-- TOC entry 200 (class 1259 OID 19688)
-- Name: tb_skill; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_skill (
    "skillId" integer NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL
);


ALTER TABLE public.tb_skill OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 19811)
-- Name: tb_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_status (
    "statusId" integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.tb_status OWNER TO postgres;

--
-- TOC entry 2888 (class 2604 OID 19783)
-- Name: tb_ass_dinoz_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_item ALTER COLUMN id SET DEFAULT nextval('public.tb_ass_dinoz_item_id_seq'::regclass);


--
-- TOC entry 2887 (class 2604 OID 19737)
-- Name: tb_dinoz dinozId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz ALTER COLUMN "dinozId" SET DEFAULT nextval('public."tb_dinoz_dinozId_seq"'::regclass);


--
-- TOC entry 2889 (class 2604 OID 19856)
-- Name: tb_dinoz_shop id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz_shop ALTER COLUMN id SET DEFAULT nextval('public.tb_dinoz_shop_id_seq'::regclass);


--
-- TOC entry 2890 (class 2604 OID 19894)
-- Name: tb_ingredient_grid gridId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient_grid ALTER COLUMN "gridId" SET DEFAULT nextval('public."tb_ingredient_grid_gridId_seq"'::regclass);


--
-- TOC entry 2886 (class 2604 OID 19721)
-- Name: tb_player playerId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_player ALTER COLUMN "playerId" SET DEFAULT nextval('public."tb_player_playerId_seq"'::regclass);


--
-- TOC entry 3095 (class 0 OID 19780)
-- Dependencies: 211
-- Data for Name: tb_ass_dinoz_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_ass_dinoz_item (id, "dinozId", "itemId") FROM stdin;
\.


--
-- TOC entry 3096 (class 0 OID 19796)
-- Dependencies: 212
-- Data for Name: tb_ass_dinoz_skill; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_ass_dinoz_skill ("dinozId", "skillId") FROM stdin;
\.


--
-- TOC entry 3098 (class 0 OID 19816)
-- Dependencies: 214
-- Data for Name: tb_ass_dinoz_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_ass_dinoz_status ("dinozId", "statusId") FROM stdin;
\.


--
-- TOC entry 3100 (class 0 OID 19836)
-- Dependencies: 216
-- Data for Name: tb_ass_player_reward; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_ass_player_reward ("playerId", "rewardId") FROM stdin;
\.


--
-- TOC entry 3092 (class 0 OID 19734)
-- Dependencies: 208
-- Data for Name: tb_dinoz; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_dinoz ("dinozId", following, name, "isFrozen", "raceId", level, "missionId", "nextUpElementId", "nextUpAltElementId", "playerId", "placeId", "canChangeName", display, life, "maxLife", experience, "canGather", "nbrUpFire", "nbrUpWood", "nbrUpWater", "nbrUpLight", "nbrUpAir", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3085 (class 0 OID 19696)
-- Dependencies: 201
-- Data for Name: tb_dinoz_race; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_dinoz_race ("raceId", name, "skillId") FROM stdin;
1	winks	\N
2	sirain	\N
3	castivore	\N
4	nuagoz	\N
5	gorilloz	\N
6	wanwan	\N
7	pigmou	\N
8	planaille	\N
9	moueffe	\N
10	rocky	\N
11	hippoclamp	\N
12	pteroz	\N
13	mahamuti	\N
14	quetzu	\N
15	feross	\N
16	santaz	\N
17	smog	\N
18	soufflet	\N
19	toufufu	\N
20	triceragnon	\N
21	kabuki	\N
\.


--
-- TOC entry 3102 (class 0 OID 19853)
-- Dependencies: 218
-- Data for Name: tb_dinoz_shop; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_dinoz_shop (id, "playerId", "raceId", display) FROM stdin;
\.


--
-- TOC entry 3087 (class 0 OID 19711)
-- Dependencies: 203
-- Data for Name: tb_element; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_element ("elementId", name) FROM stdin;
1	fire
2	wood
3	water
4	light
5	air
\.


--
-- TOC entry 3099 (class 0 OID 19831)
-- Dependencies: 215
-- Data for Name: tb_epic_reward; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_epic_reward ("rewardId", name) FROM stdin;
1	tropheeRocky
2	tropheeHippoclamp
3	tropheePteroz
4	tropheeQuetzu
\.


--
-- TOC entry 3104 (class 0 OID 19874)
-- Dependencies: 220
-- Data for Name: tb_ingredient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_ingredient ("ingredientId", name, "ingredientGridTypeId") FROM stdin;
\.


--
-- TOC entry 3106 (class 0 OID 19891)
-- Dependencies: 222
-- Data for Name: tb_ingredient_grid; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_ingredient_grid ("gridId", "playerId", "ingredientGridTypeId", "placeId", "ingredientGridId") FROM stdin;
\.


--
-- TOC entry 3103 (class 0 OID 19869)
-- Dependencies: 219
-- Data for Name: tb_ingredient_grid_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_ingredient_grid_type ("ingredientGridTypeId", length, width) FROM stdin;
\.


--
-- TOC entry 3093 (class 0 OID 19773)
-- Dependencies: 209
-- Data for Name: tb_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_item ("itemId", name) FROM stdin;
1	obj_irma
2	obj_angel
3	obj_surviv
\.


--
-- TOC entry 3107 (class 0 OID 19917)
-- Dependencies: 223
-- Data for Name: tb_item_own; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_item_own (id, "playerId", "itemId", quantity) FROM stdin;
\.


--
-- TOC entry 3086 (class 0 OID 19706)
-- Dependencies: 202
-- Data for Name: tb_mission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_mission ("missionId", name) FROM stdin;
\.


--
-- TOC entry 3090 (class 0 OID 19727)
-- Dependencies: 206
-- Data for Name: tb_place; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_place ("placeId", name) FROM stdin;
1	dinoville
2	universite
\.


--
-- TOC entry 3089 (class 0 OID 19718)
-- Dependencies: 205
-- Data for Name: tb_player; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_player ("playerId", name, "eternalTwinId", money, "quetzuBought", leader, engineer, cooker, "shopKeeper", merchant, priest, teacher, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3084 (class 0 OID 19688)
-- Dependencies: 200
-- Data for Name: tb_skill; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_skill ("skillId", name, type) FROM stdin;
1	chargeCornue	E
\.


--
-- TOC entry 3097 (class 0 OID 19811)
-- Dependencies: 213
-- Data for Name: tb_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_status ("statusId", name) FROM stdin;
1	matesc
2	bouee
3	cuzmal
4	cup4
5	demon
6	lantrn
7	medal4
8	nenuph
9	pelle
10	rasca
11	palmes
12	amulst
13	astone
14	basalt
15	wpure
16	bckpck
17	brkpel
18	ccard
19	conts1
20	conts2
21	conts3
22	corail
23	cup1
24	cup2
25	cup3
26	fcharm
27	gant
28	gshop
29	ice
30	lvlup1
31	lvlup2
32	lvlup3
33	marais
34	maudit
35	mcapt
36	medal1
37	medal2
38	medal3
39	morsso
40	newski
41	pelle2
42	potion
43	reinca
44	renais
45	skull
46	sylkey
47	totem
48	vkill
49	wcharm
\.


--
-- TOC entry 3118 (class 0 OID 0)
-- Dependencies: 210
-- Name: tb_ass_dinoz_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_ass_dinoz_item_id_seq', 1, false);


--
-- TOC entry 3119 (class 0 OID 0)
-- Dependencies: 207
-- Name: tb_dinoz_dinozId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."tb_dinoz_dinozId_seq"', 1, false);


--
-- TOC entry 3120 (class 0 OID 0)
-- Dependencies: 217
-- Name: tb_dinoz_shop_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_dinoz_shop_id_seq', 1, false);


--
-- TOC entry 3121 (class 0 OID 0)
-- Dependencies: 221
-- Name: tb_ingredient_grid_gridId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."tb_ingredient_grid_gridId_seq"', 1, false);


--
-- TOC entry 3122 (class 0 OID 0)
-- Dependencies: 204
-- Name: tb_player_playerId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."tb_player_playerId_seq"', 1, false);


--
-- TOC entry 2908 (class 2606 OID 19785)
-- Name: tb_ass_dinoz_item tb_ass_dinoz_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_item
    ADD CONSTRAINT tb_ass_dinoz_item_pkey PRIMARY KEY (id);


--
-- TOC entry 2910 (class 2606 OID 19800)
-- Name: tb_ass_dinoz_skill tb_ass_dinoz_skill_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_skill
    ADD CONSTRAINT tb_ass_dinoz_skill_pkey PRIMARY KEY ("dinozId", "skillId");


--
-- TOC entry 2914 (class 2606 OID 19820)
-- Name: tb_ass_dinoz_status tb_ass_dinoz_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_status
    ADD CONSTRAINT tb_ass_dinoz_status_pkey PRIMARY KEY ("dinozId", "statusId");


--
-- TOC entry 2918 (class 2606 OID 19840)
-- Name: tb_ass_player_reward tb_ass_player_reward_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_player_reward
    ADD CONSTRAINT tb_ass_player_reward_pkey PRIMARY KEY ("playerId", "rewardId");


--
-- TOC entry 2904 (class 2606 OID 19742)
-- Name: tb_dinoz tb_dinoz_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT tb_dinoz_pkey PRIMARY KEY ("dinozId");


--
-- TOC entry 2894 (class 2606 OID 19700)
-- Name: tb_dinoz_race tb_dinoz_race_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz_race
    ADD CONSTRAINT tb_dinoz_race_pkey PRIMARY KEY ("raceId");


--
-- TOC entry 2920 (class 2606 OID 19858)
-- Name: tb_dinoz_shop tb_dinoz_shop_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz_shop
    ADD CONSTRAINT tb_dinoz_shop_pkey PRIMARY KEY (id);


--
-- TOC entry 2898 (class 2606 OID 19715)
-- Name: tb_element tb_element_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_element
    ADD CONSTRAINT tb_element_pkey PRIMARY KEY ("elementId");


--
-- TOC entry 2916 (class 2606 OID 19835)
-- Name: tb_epic_reward tb_epic_reward_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_epic_reward
    ADD CONSTRAINT tb_epic_reward_pkey PRIMARY KEY ("rewardId");


--
-- TOC entry 2926 (class 2606 OID 19896)
-- Name: tb_ingredient_grid tb_ingredient_grid_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient_grid
    ADD CONSTRAINT tb_ingredient_grid_pkey PRIMARY KEY ("gridId");


--
-- TOC entry 2922 (class 2606 OID 19873)
-- Name: tb_ingredient_grid_type tb_ingredient_grid_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient_grid_type
    ADD CONSTRAINT tb_ingredient_grid_type_pkey PRIMARY KEY ("ingredientGridTypeId");


--
-- TOC entry 2924 (class 2606 OID 19878)
-- Name: tb_ingredient tb_ingredient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient
    ADD CONSTRAINT tb_ingredient_pkey PRIMARY KEY ("ingredientId");


--
-- TOC entry 2928 (class 2606 OID 19921)
-- Name: tb_item_own tb_item_own_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_item_own
    ADD CONSTRAINT tb_item_own_pkey PRIMARY KEY (id);


--
-- TOC entry 2906 (class 2606 OID 19777)
-- Name: tb_item tb_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_item
    ADD CONSTRAINT tb_item_pkey PRIMARY KEY ("itemId");


--
-- TOC entry 2896 (class 2606 OID 19710)
-- Name: tb_mission tb_mission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_mission
    ADD CONSTRAINT tb_mission_pkey PRIMARY KEY ("missionId");


--
-- TOC entry 2902 (class 2606 OID 19731)
-- Name: tb_place tb_place_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_place
    ADD CONSTRAINT tb_place_pkey PRIMARY KEY ("placeId");


--
-- TOC entry 2900 (class 2606 OID 19726)
-- Name: tb_player tb_player_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_player
    ADD CONSTRAINT tb_player_pkey PRIMARY KEY ("playerId");


--
-- TOC entry 2892 (class 2606 OID 19695)
-- Name: tb_skill tb_skill_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_skill
    ADD CONSTRAINT tb_skill_pkey PRIMARY KEY ("skillId");


--
-- TOC entry 2912 (class 2606 OID 19815)
-- Name: tb_status tb_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_status
    ADD CONSTRAINT tb_status_pkey PRIMARY KEY ("statusId");


--
-- TOC entry 2936 (class 2606 OID 19786)
-- Name: tb_ass_dinoz_item tb_ass_dinoz_item_dinozId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_item
    ADD CONSTRAINT "tb_ass_dinoz_item_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES public.tb_dinoz("dinozId") ON UPDATE CASCADE;


--
-- TOC entry 2937 (class 2606 OID 19791)
-- Name: tb_ass_dinoz_item tb_ass_dinoz_item_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_item
    ADD CONSTRAINT "tb_ass_dinoz_item_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public.tb_item("itemId") ON UPDATE CASCADE;


--
-- TOC entry 2938 (class 2606 OID 19801)
-- Name: tb_ass_dinoz_skill tb_ass_dinoz_skill_dinozId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_skill
    ADD CONSTRAINT "tb_ass_dinoz_skill_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES public.tb_dinoz("dinozId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2939 (class 2606 OID 19806)
-- Name: tb_ass_dinoz_skill tb_ass_dinoz_skill_skillId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_skill
    ADD CONSTRAINT "tb_ass_dinoz_skill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES public.tb_skill("skillId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2940 (class 2606 OID 19821)
-- Name: tb_ass_dinoz_status tb_ass_dinoz_status_dinozId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_status
    ADD CONSTRAINT "tb_ass_dinoz_status_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES public.tb_dinoz("dinozId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2941 (class 2606 OID 19826)
-- Name: tb_ass_dinoz_status tb_ass_dinoz_status_statusId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_status
    ADD CONSTRAINT "tb_ass_dinoz_status_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES public.tb_status("statusId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2942 (class 2606 OID 19841)
-- Name: tb_ass_player_reward tb_ass_player_reward_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_player_reward
    ADD CONSTRAINT "tb_ass_player_reward_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.tb_player("playerId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2943 (class 2606 OID 19846)
-- Name: tb_ass_player_reward tb_ass_player_reward_rewardId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_player_reward
    ADD CONSTRAINT "tb_ass_player_reward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES public.tb_epic_reward("rewardId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2931 (class 2606 OID 19748)
-- Name: tb_dinoz tb_dinoz_missionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT "tb_dinoz_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES public.tb_mission("missionId") ON UPDATE CASCADE;


--
-- TOC entry 2933 (class 2606 OID 19758)
-- Name: tb_dinoz tb_dinoz_nextUpAltElementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT "tb_dinoz_nextUpAltElementId_fkey" FOREIGN KEY ("nextUpAltElementId") REFERENCES public.tb_element("elementId") ON UPDATE CASCADE;


--
-- TOC entry 2932 (class 2606 OID 19753)
-- Name: tb_dinoz tb_dinoz_nextUpElementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT "tb_dinoz_nextUpElementId_fkey" FOREIGN KEY ("nextUpElementId") REFERENCES public.tb_element("elementId") ON UPDATE CASCADE;


--
-- TOC entry 2935 (class 2606 OID 19768)
-- Name: tb_dinoz tb_dinoz_placeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT "tb_dinoz_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES public.tb_place("placeId") ON UPDATE CASCADE;


--
-- TOC entry 2934 (class 2606 OID 19763)
-- Name: tb_dinoz tb_dinoz_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT "tb_dinoz_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.tb_player("playerId") ON UPDATE CASCADE;


--
-- TOC entry 2930 (class 2606 OID 19743)
-- Name: tb_dinoz tb_dinoz_raceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT "tb_dinoz_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES public.tb_dinoz_race("raceId") ON UPDATE CASCADE;


--
-- TOC entry 2929 (class 2606 OID 19701)
-- Name: tb_dinoz_race tb_dinoz_race_skillId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz_race
    ADD CONSTRAINT "tb_dinoz_race_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES public.tb_skill("skillId") ON UPDATE CASCADE;


--
-- TOC entry 2944 (class 2606 OID 19859)
-- Name: tb_dinoz_shop tb_dinoz_shop_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz_shop
    ADD CONSTRAINT "tb_dinoz_shop_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.tb_player("playerId") ON UPDATE CASCADE;


--
-- TOC entry 2945 (class 2606 OID 19864)
-- Name: tb_dinoz_shop tb_dinoz_shop_raceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz_shop
    ADD CONSTRAINT "tb_dinoz_shop_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES public.tb_dinoz_race("raceId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2951 (class 2606 OID 19912)
-- Name: tb_ingredient_grid tb_ingredient_grid_ingredientGridId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient_grid
    ADD CONSTRAINT "tb_ingredient_grid_ingredientGridId_fkey" FOREIGN KEY ("ingredientGridId") REFERENCES public.tb_ingredient_grid_type("ingredientGridTypeId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 2949 (class 2606 OID 19902)
-- Name: tb_ingredient_grid tb_ingredient_grid_ingredientGridTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient_grid
    ADD CONSTRAINT "tb_ingredient_grid_ingredientGridTypeId_fkey" FOREIGN KEY ("ingredientGridTypeId") REFERENCES public.tb_ingredient_grid_type("ingredientGridTypeId") ON UPDATE CASCADE;


--
-- TOC entry 2950 (class 2606 OID 19907)
-- Name: tb_ingredient_grid tb_ingredient_grid_placeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient_grid
    ADD CONSTRAINT "tb_ingredient_grid_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES public.tb_place("placeId") ON UPDATE CASCADE;


--
-- TOC entry 2948 (class 2606 OID 19897)
-- Name: tb_ingredient_grid tb_ingredient_grid_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient_grid
    ADD CONSTRAINT "tb_ingredient_grid_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.tb_player("playerId") ON UPDATE CASCADE;


--
-- TOC entry 2947 (class 2606 OID 19884)
-- Name: tb_ingredient tb_ingredient_ingredientGridTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient
    ADD CONSTRAINT "tb_ingredient_ingredientGridTypeId_fkey" FOREIGN KEY ("ingredientGridTypeId") REFERENCES public.tb_ingredient_grid_type("ingredientGridTypeId") ON UPDATE CASCADE;


--
-- TOC entry 2946 (class 2606 OID 19879)
-- Name: tb_ingredient tb_ingredient_ingredientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient
    ADD CONSTRAINT "tb_ingredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES public.tb_ingredient_grid_type("ingredientGridTypeId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2953 (class 2606 OID 19927)
-- Name: tb_item_own tb_item_own_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_item_own
    ADD CONSTRAINT "tb_item_own_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public.tb_item("itemId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2952 (class 2606 OID 19922)
-- Name: tb_item_own tb_item_own_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_item_own
    ADD CONSTRAINT "tb_item_own_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.tb_player("playerId") ON UPDATE CASCADE;


-- Completed on 2021-08-20 10:13:03 CEST

--
-- PostgreSQL database dump complete
--

