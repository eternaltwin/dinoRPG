--
-- PostgreSQL database dump
--

-- Dumped from database version 12.7 (Ubuntu 12.7-1.pgdg20.04+1)
-- Dumped by pg_dump version 12.7 (Ubuntu 12.7-1.pgdg20.04+1)

-- Started on 2021-06-30 20:43:19 CEST

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
-- TOC entry 202 (class 1259 OID 53829)
-- Name: tb_ass_dinoz_object; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_ass_dinoz_object (
    id integer NOT NULL,
    "dinozId" integer,
    "objectId" integer
);


ALTER TABLE public.tb_ass_dinoz_object OWNER TO postgres;

--
-- TOC entry 203 (class 1259 OID 53832)
-- Name: tb_ass_dinoz_object_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_ass_dinoz_object_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tb_ass_dinoz_object_id_seq OWNER TO postgres;

--
-- TOC entry 3172 (class 0 OID 0)
-- Dependencies: 203
-- Name: tb_ass_dinoz_object_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_ass_dinoz_object_id_seq OWNED BY public.tb_ass_dinoz_object.id;


--
-- TOC entry 204 (class 1259 OID 53834)
-- Name: tb_ass_dinoz_skill; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_ass_dinoz_skill (
    "dinozId" integer NOT NULL,
    "skillId" integer NOT NULL
);


ALTER TABLE public.tb_ass_dinoz_skill OWNER TO postgres;

--
-- TOC entry 205 (class 1259 OID 53837)
-- Name: tb_ass_dinoz_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_ass_dinoz_status (
    "dinozId" integer NOT NULL,
    "statusId" integer NOT NULL
);


ALTER TABLE public.tb_ass_dinoz_status OWNER TO postgres;

--
-- TOC entry 207 (class 1259 OID 53843)
-- Name: tb_ass_player_object; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_ass_player_object (
    id integer NOT NULL,
    "playerId" integer,
    "objectId" integer,
    quantity integer NOT NULL
);


ALTER TABLE public.tb_ass_player_object OWNER TO postgres;

--
-- TOC entry 206 (class 1259 OID 53840)
-- Name: tb_ass_player_reward; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_ass_player_reward (
    "playerId" integer NOT NULL,
    "rewardId" integer NOT NULL
);


ALTER TABLE public.tb_ass_player_reward OWNER TO postgres;

--
-- TOC entry 208 (class 1259 OID 53846)
-- Name: tb_dinoz; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_dinoz (
    "dinozId" integer NOT NULL,
    following integer,
    name character varying(255) NOT NULL,
    "isFrozen" boolean NOT NULL,
    "raceId" integer NOT NULL,
    "levelId" integer NOT NULL,
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
-- TOC entry 209 (class 1259 OID 53852)
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
-- TOC entry 3173 (class 0 OID 0)
-- Dependencies: 209
-- Name: tb_dinoz_dinozId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."tb_dinoz_dinozId_seq" OWNED BY public.tb_dinoz."dinozId";


--
-- TOC entry 210 (class 1259 OID 53854)
-- Name: tb_dinoz_race; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_dinoz_race (
    "raceId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "nbrFireCase" integer NOT NULL,
    "nbrWoodCase" integer NOT NULL,
    "nbrWaterCase" integer NOT NULL,
    "nbrLightCase" integer NOT NULL,
    "nbrAirCase" integer NOT NULL,
    price integer,
    "swfLetter" character varying(255),
    "skillId" integer
);


ALTER TABLE public.tb_dinoz_race OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 53860)
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
-- TOC entry 212 (class 1259 OID 53863)
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
-- TOC entry 3174 (class 0 OID 0)
-- Dependencies: 212
-- Name: tb_dinoz_shop_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_dinoz_shop_id_seq OWNED BY public.tb_dinoz_shop.id;


--
-- TOC entry 213 (class 1259 OID 53865)
-- Name: tb_element; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_element (
    "elementId" integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.tb_element OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 53868)
-- Name: tb_epic_reward; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_epic_reward (
    "rewardId" integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.tb_epic_reward OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 53871)
-- Name: tb_ingredient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_ingredient (
    "ingredientId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "ingredientGridTypeId" integer NOT NULL
);


ALTER TABLE public.tb_ingredient OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 53874)
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
-- TOC entry 217 (class 1259 OID 53877)
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
-- TOC entry 3175 (class 0 OID 0)
-- Dependencies: 217
-- Name: tb_ingredient_grid_gridId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."tb_ingredient_grid_gridId_seq" OWNED BY public.tb_ingredient_grid."gridId";


--
-- TOC entry 218 (class 1259 OID 53879)
-- Name: tb_ingredient_grid_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_ingredient_grid_type (
    "ingredientGridTypeId" integer NOT NULL,
    length integer NOT NULL,
    width integer NOT NULL
);


ALTER TABLE public.tb_ingredient_grid_type OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 53882)
-- Name: tb_level; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_level (
    "levelId" integer NOT NULL,
    level integer NOT NULL,
    experience integer NOT NULL
);


ALTER TABLE public.tb_level OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 53885)
-- Name: tb_map; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_map (
    "mapId" integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.tb_map OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 53888)
-- Name: tb_mission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_mission (
    "missionId" integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.tb_mission OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 53891)
-- Name: tb_object; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_object (
    "objectId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "canBeUsedNow" boolean NOT NULL,
    "canBeEquiped" boolean NOT NULL,
    price integer NOT NULL,
    "maxQuantity" integer
);


ALTER TABLE public.tb_object OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 53894)
-- Name: tb_place; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_place (
    "placeId" integer NOT NULL,
    name character varying(255) NOT NULL,
    "mapId" integer
);


ALTER TABLE public.tb_place OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 53897)
-- Name: tb_place_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_place_access (
    id integer NOT NULL,
    "placeId" integer NOT NULL,
    "canGoTo" integer NOT NULL
);


ALTER TABLE public.tb_place_access OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 53900)
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
-- TOC entry 226 (class 1259 OID 53906)
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
-- TOC entry 3176 (class 0 OID 0)
-- Dependencies: 226
-- Name: tb_player_playerId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."tb_player_playerId_seq" OWNED BY public.tb_player."playerId";


--
-- TOC entry 227 (class 1259 OID 53908)
-- Name: tb_skill; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_skill (
    "skillId" integer NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL
);


ALTER TABLE public.tb_skill OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 53914)
-- Name: tb_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_status (
    "statusId" integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.tb_status OWNER TO postgres;

--
-- TOC entry 2936 (class 2604 OID 53917)
-- Name: tb_ass_dinoz_object id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_object ALTER COLUMN id SET DEFAULT nextval('public.tb_ass_dinoz_object_id_seq'::regclass);


--
-- TOC entry 2937 (class 2604 OID 53918)
-- Name: tb_dinoz dinozId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz ALTER COLUMN "dinozId" SET DEFAULT nextval('public."tb_dinoz_dinozId_seq"'::regclass);


--
-- TOC entry 2938 (class 2604 OID 53919)
-- Name: tb_dinoz_shop id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz_shop ALTER COLUMN id SET DEFAULT nextval('public.tb_dinoz_shop_id_seq'::regclass);


--
-- TOC entry 2939 (class 2604 OID 53920)
-- Name: tb_ingredient_grid gridId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient_grid ALTER COLUMN "gridId" SET DEFAULT nextval('public."tb_ingredient_grid_gridId_seq"'::regclass);


--
-- TOC entry 2940 (class 2604 OID 53921)
-- Name: tb_player playerId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_player ALTER COLUMN "playerId" SET DEFAULT nextval('public."tb_player_playerId_seq"'::regclass);


--
-- TOC entry 3140 (class 0 OID 53829)
-- Dependencies: 202
-- Data for Name: tb_ass_dinoz_object; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_ass_dinoz_object (id, "dinozId", "objectId") FROM stdin;
1	11	1
2	11	2
3	11	3
\.


--
-- TOC entry 3142 (class 0 OID 53834)
-- Dependencies: 204
-- Data for Name: tb_ass_dinoz_skill; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_ass_dinoz_skill ("dinozId", "skillId") FROM stdin;
\.


--
-- TOC entry 3143 (class 0 OID 53837)
-- Dependencies: 205
-- Data for Name: tb_ass_dinoz_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_ass_dinoz_status ("dinozId", "statusId") FROM stdin;
11	1
11	2
11	3
11	4
11	5
11	6
11	7
11	8
11	9
11	10
11	11
11	12
\.


--
-- TOC entry 3145 (class 0 OID 53843)
-- Dependencies: 207
-- Data for Name: tb_ass_player_object; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_ass_player_object (id, "playerId", "objectId", quantity) FROM stdin;
1	1	1	2
3	1	3	8
2	1	2	5
4	2	1	4
\.


--
-- TOC entry 3144 (class 0 OID 53840)
-- Dependencies: 206
-- Data for Name: tb_ass_player_reward; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_ass_player_reward ("playerId", "rewardId") FROM stdin;
\.


--
-- TOC entry 3146 (class 0 OID 53846)
-- Dependencies: 208
-- Data for Name: tb_dinoz; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_dinoz ("dinozId", following, name, "isFrozen", "raceId", "levelId", "missionId", "nextUpElementId", "nextUpAltElementId", "playerId", "placeId", "canChangeName", display, life, "maxLife", experience, "canGather", "nbrUpFire", "nbrUpWood", "nbrUpWater", "nbrUpLight", "nbrUpAir", "createdAt", "updatedAt") FROM stdin;
1	\N	Castou	f	3	1	\N	\N	\N	1	1	f	40xXifPZu2EGJ000	100	100	0	f	0	1	0	0	1	2021-05-08 11:19:40.315+02	2021-05-08 11:32:39.106+02
2	\N	Napou	f	2	1	\N	\N	\N	1	1	f	80J9OgwulgitL000	100	100	0	f	0	0	2	0	0	2021-05-08 11:33:07.704+02	2021-05-08 11:33:14.386+02
3	\N	Napou	f	2	1	\N	\N	\N	2	1	f	80RyqYPK9xInm000	100	100	0	f	0	0	2	0	0	2021-05-09 15:38:26.659+02	2021-05-09 15:38:32.542+02
4	\N	Flammèche	f	7	1	\N	\N	\N	2	1	f	10LMOP3UzMP5d000	100	100	0	f	2	0	0	0	0	2021-05-09 15:43:13.991+02	2021-05-09 15:43:19.996+02
5	\N	Lapinou	f	2	1	\N	\N	\N	3	1	f	801klNOD1zQ7h000	100	100	0	f	0	0	2	0	0	2021-05-22 11:04:11.97+02	2021-05-22 11:04:22.336+02
6	\N	Nunu	f	4	1	\N	\N	\N	5	1	f	70A8xkQuV3CGm000	100	100	0	f	0	0	0	1	1	2021-06-12 19:10:28.846+02	2021-06-12 19:10:34.356+02
7	\N	Miaou	f	6	1	\N	\N	\N	8	1	f	B0J6ADN4RHdXr000	100	100	0	f	0	1	0	1	0	2021-06-14 20:46:18.32+02	2021-06-14 20:46:22.937+02
8	\N	Pigou	f	7	1	\N	\N	\N	8	1	f	10weRQ7aXGZ5A000	100	100	0	f	2	0	0	0	0	2021-06-14 20:58:50.963+02	2021-06-14 20:58:57.821+02
9	\N	MiouMiou	f	6	1	\N	\N	\N	9	1	f	B0LslBH4kkKgf000	100	100	0	f	0	1	0	1	0	2021-06-20 14:02:40.032+02	2021-06-20 14:03:20.259+02
10	\N	Balou	f	5	1	\N	\N	\N	9	1	f	A0Ymv3LmrpX39000	100	100	0	f	0	2	0	0	0	2021-06-20 15:17:22.283+02	2021-06-20 15:17:30.235+02
11	\N	Cyclope	f	4	1	\N	\N	\N	10	1	f	70sW7rKGckhHR000	100	100	0	f	0	0	0	1	1	2021-06-20 15:20:28.16+02	2021-06-20 15:20:36.303+02
12	\N	Miou	f	6	1	\N	\N	\N	10	1	f	B0nblKgQoLfip000	100	100	0	f	0	1	0	1	0	2021-06-27 14:20:51.921+02	2021-06-27 14:20:58.673+02
\.


--
-- TOC entry 3148 (class 0 OID 53854)
-- Dependencies: 210
-- Data for Name: tb_dinoz_race; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_dinoz_race ("raceId", name, "nbrFireCase", "nbrWoodCase", "nbrWaterCase", "nbrLightCase", "nbrAirCase", price, "swfLetter", "skillId") FROM stdin;
1	winks	0	0	1	1	0	20000	2	\N
2	sirain	0	0	2	0	0	16000	8	\N
3	castivore	0	1	0	0	1	16000	4	\N
4	nuagoz	0	0	0	1	1	16000	7	\N
5	gorilloz	0	2	0	0	0	16000	A	\N
6	wanwan	0	1	0	1	0	19000	B	\N
7	pigmou	2	0	0	0	0	20000	1	\N
8	planaille	0	0	0	2	0	16000	3	\N
9	moueffe	2	0	0	0	0	16000	0	\N
10	rocky	0	0	0	1	0	18000	5	\N
11	hippoclamp	1	1	1	1	1	28000	9	\N
12	pteroz	0	0	0	0	3	22000	6	\N
13	mahamuti	10	10	10	10	10	10	a	\N
14	quetzu	10	10	10	10	10	10	a	\N
15	feross	10	10	10	10	10	10	a	\N
16	santaz	10	10	10	10	10	10	a	\N
17	smog	10	10	10	10	10	10	a	\N
18	soufflet	10	10	10	10	10	10	a	\N
19	toufufu	10	10	10	10	10	10	a	\N
20	triceragnon	10	10	10	10	10	10	a	\N
21	kabuki	10	10	10	10	10	10	a	\N
\.


--
-- TOC entry 3149 (class 0 OID 53860)
-- Dependencies: 211
-- Data for Name: tb_dinoz_shop; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_dinoz_shop (id, "playerId", "raceId", display) FROM stdin;
17	2	8	308bj16Pz2G0t000
18	2	7	10eiX65tZUnKb000
19	2	9	00i0XkMSVMQaO000
20	2	2	80ZsvrnPNBqKr000
53	10	8	30wKPtreWiX6V000
54	10	6	B0Dy1XoHrfN4a000
55	10	5	A0uFFHl4EbcI6000
56	10	7	10qZSAlFw2OEg000
\.


--
-- TOC entry 3151 (class 0 OID 53865)
-- Dependencies: 213
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
-- TOC entry 3152 (class 0 OID 53868)
-- Dependencies: 214
-- Data for Name: tb_epic_reward; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_epic_reward ("rewardId", name) FROM stdin;
1	tropheeRocky
2	tropheeHippoclamp
3	tropheePteroz
4	tropheeQuetzu
\.


--
-- TOC entry 3153 (class 0 OID 53871)
-- Dependencies: 215
-- Data for Name: tb_ingredient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_ingredient ("ingredientId", name, "ingredientGridTypeId") FROM stdin;
\.


--
-- TOC entry 3154 (class 0 OID 53874)
-- Dependencies: 216
-- Data for Name: tb_ingredient_grid; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_ingredient_grid ("gridId", "playerId", "ingredientGridTypeId", "placeId", "ingredientGridId") FROM stdin;
\.


--
-- TOC entry 3156 (class 0 OID 53879)
-- Dependencies: 218
-- Data for Name: tb_ingredient_grid_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_ingredient_grid_type ("ingredientGridTypeId", length, width) FROM stdin;
\.


--
-- TOC entry 3157 (class 0 OID 53882)
-- Dependencies: 219
-- Data for Name: tb_level; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_level ("levelId", level, experience) FROM stdin;
1	1	100
2	2	150
\.


--
-- TOC entry 3158 (class 0 OID 53885)
-- Dependencies: 220
-- Data for Name: tb_map; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_map ("mapId", name) FROM stdin;
1	dinoland
\.


--
-- TOC entry 3159 (class 0 OID 53888)
-- Dependencies: 221
-- Data for Name: tb_mission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_mission ("missionId", name) FROM stdin;
1	poissonFrais
2	chienPerdu
\.


--
-- TOC entry 3160 (class 0 OID 53891)
-- Dependencies: 222
-- Data for Name: tb_object; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_object ("objectId", name, "canBeUsedNow", "canBeEquiped", price, "maxQuantity") FROM stdin;
1	obj_irma	t	f	900	50
2	obj_angel	t	f	2000	30
3	obj_surviv	t	t	8000	20
\.


--
-- TOC entry 3161 (class 0 OID 53894)
-- Dependencies: 223
-- Data for Name: tb_place; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_place ("placeId", name, "mapId") FROM stdin;
1	dinoville	1
2	universite	1
\.


--
-- TOC entry 3162 (class 0 OID 53897)
-- Dependencies: 224
-- Data for Name: tb_place_access; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_place_access (id, "placeId", "canGoTo") FROM stdin;
\.


--
-- TOC entry 3163 (class 0 OID 53900)
-- Dependencies: 225
-- Data for Name: tb_player; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_player ("playerId", name, "eternalTwinId", money, "quetzuBought", leader, engineer, cooker, "shopKeeper", merchant, priest, teacher, "createdAt", "updatedAt") FROM stdin;
1	Jolujolu	3c67088b-6fc4-4ddd-90bc-485ee6b0ad20	168000	0	f	f	f	f	f	f	f	2021-05-08 11:06:29.572+02	2021-05-08 11:33:07.687+02
2	Jolujolu	57bc25a2-f14c-4233-873e-36bf3261662f	164000	0	f	f	f	f	f	f	f	2021-05-09 15:38:15.078+02	2021-05-09 15:43:13.964+02
3	Jolujolu	3fa16d41-ff98-4da8-91c2-4859da3fad5d	184000	0	f	f	f	f	f	f	f	2021-05-22 11:03:58.477+02	2021-05-22 11:04:11.936+02
4	Jolujolu	38641868-d96d-42a9-b5cd-7fad9b81b04d	200000	0	f	f	f	f	f	f	f	2021-05-23 17:47:13.269+02	2021-05-23 17:47:13.269+02
5	Jolujolu3	f5bcffd4-4f99-46ed-9a02-a80552e94356	184000	0	f	f	f	f	f	f	f	2021-06-12 19:03:06.053+02	2021-06-12 19:10:28.814+02
6	Jolujolu	3c99538b-6f72-418b-a742-7eae3bc49950	200000	0	f	f	f	f	f	f	f	2021-06-12 21:09:25.38+02	2021-06-12 21:09:25.38+02
7	Jolujolu	6bf8300a-1a48-41f5-98bb-d5477d272cdb	200000	0	f	f	f	f	f	f	f	2021-06-13 14:41:50.286+02	2021-06-13 14:41:50.286+02
8	Jolujolu	32fa7345-3f9a-4f47-8557-4caafe6ea806	161000	0	f	f	f	f	f	f	f	2021-06-14 20:23:21.556+02	2021-06-14 20:58:50.933+02
9	Jolujolu	3d371d4c-7c08-44e1-8116-bbe765705a44	165000	0	f	f	f	f	f	f	f	2021-06-20 14:02:18.972+02	2021-06-20 15:17:22.237+02
10	Jolujolu	540608af-7f2f-4878-957b-51a642e8dc41	165000	0	f	f	f	f	f	f	f	2021-06-20 15:18:27.144+02	2021-06-27 14:20:51.893+02
\.


--
-- TOC entry 3165 (class 0 OID 53908)
-- Dependencies: 227
-- Data for Name: tb_skill; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_skill ("skillId", name, type) FROM stdin;
1	focus	E
2	colere	E
3	griffesEnflammees	P
4	rock	C
5	chargeCornue	E
6	coque	E
\.


--
-- TOC entry 3166 (class 0 OID 53914)
-- Dependencies: 228
-- Data for Name: tb_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_status ("statusId", name) FROM stdin;
1	fx_matesc
2	fx_bouee
3	fx_cuzmal
4	fx_cup4
5	fx_demon
6	fx_lantrn
7	fx_medal4
8	fx_nenuph
9	fx_pelle
10	fx_rasca
11	fx_palmes
12	fx_amulst
13	fx_admin
14	fw_astone
15	fx_basalt
16	fx_bckpck
17	fx_brkpel
18	fx_ccard
19	fx_conts1
20	fx_conts2
21	fx_conts3
22	fx_corail
23	fx_cup1
24	fx_cup2
25	fx_cup3
26	fx_fcharm
27	fx_gant
28	fx_gshop
29	fx_ice
30	fx_lvlup1
31	fx_lvlup2
32	fx_lvlup3
33	fx_marais
34	fx_maudit
35	fx_mcapt
36	fx_medal1
37	fx_medal2
38	fx_medal3
39	fx_morsso
40	fx_newski
41	fx_pelle2
42	fx_potion
43	fx_reinca
44	fx_renais
45	fx_skull
46	fx_sylkey
47	fx_totem
48	fx_vkill
49	fx_wcharm
50	fx_wpure
\.


--
-- TOC entry 3177 (class 0 OID 0)
-- Dependencies: 203
-- Name: tb_ass_dinoz_object_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_ass_dinoz_object_id_seq', 1, false);


--
-- TOC entry 3178 (class 0 OID 0)
-- Dependencies: 209
-- Name: tb_dinoz_dinozId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."tb_dinoz_dinozId_seq"', 12, true);


--
-- TOC entry 3179 (class 0 OID 0)
-- Dependencies: 212
-- Name: tb_dinoz_shop_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_dinoz_shop_id_seq', 56, true);


--
-- TOC entry 3180 (class 0 OID 0)
-- Dependencies: 217
-- Name: tb_ingredient_grid_gridId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."tb_ingredient_grid_gridId_seq"', 1, false);


--
-- TOC entry 3181 (class 0 OID 0)
-- Dependencies: 226
-- Name: tb_player_playerId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."tb_player_playerId_seq"', 10, true);


--
-- TOC entry 2942 (class 2606 OID 53923)
-- Name: tb_ass_dinoz_object tb_ass_dinoz_object_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_object
    ADD CONSTRAINT tb_ass_dinoz_object_pkey PRIMARY KEY (id);


--
-- TOC entry 2944 (class 2606 OID 53925)
-- Name: tb_ass_dinoz_skill tb_ass_dinoz_skill_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_skill
    ADD CONSTRAINT tb_ass_dinoz_skill_pkey PRIMARY KEY ("dinozId", "skillId");


--
-- TOC entry 2946 (class 2606 OID 53927)
-- Name: tb_ass_dinoz_status tb_ass_dinoz_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_status
    ADD CONSTRAINT tb_ass_dinoz_status_pkey PRIMARY KEY ("dinozId", "statusId");


--
-- TOC entry 2950 (class 2606 OID 53929)
-- Name: tb_ass_player_object tb_ass_player_object_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_player_object
    ADD CONSTRAINT tb_ass_player_object_pkey PRIMARY KEY (id);


--
-- TOC entry 2948 (class 2606 OID 53931)
-- Name: tb_ass_player_reward tb_ass_player_reward_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_player_reward
    ADD CONSTRAINT tb_ass_player_reward_pkey PRIMARY KEY ("playerId", "rewardId");


--
-- TOC entry 2952 (class 2606 OID 53933)
-- Name: tb_dinoz tb_dinoz_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT tb_dinoz_pkey PRIMARY KEY ("dinozId");


--
-- TOC entry 2954 (class 2606 OID 53935)
-- Name: tb_dinoz_race tb_dinoz_race_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz_race
    ADD CONSTRAINT tb_dinoz_race_pkey PRIMARY KEY ("raceId");


--
-- TOC entry 2956 (class 2606 OID 53937)
-- Name: tb_dinoz_shop tb_dinoz_shop_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz_shop
    ADD CONSTRAINT tb_dinoz_shop_pkey PRIMARY KEY (id);


--
-- TOC entry 2958 (class 2606 OID 53939)
-- Name: tb_element tb_element_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_element
    ADD CONSTRAINT tb_element_pkey PRIMARY KEY ("elementId");


--
-- TOC entry 2960 (class 2606 OID 53941)
-- Name: tb_epic_reward tb_epic_reward_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_epic_reward
    ADD CONSTRAINT tb_epic_reward_pkey PRIMARY KEY ("rewardId");


--
-- TOC entry 2964 (class 2606 OID 53943)
-- Name: tb_ingredient_grid tb_ingredient_grid_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient_grid
    ADD CONSTRAINT tb_ingredient_grid_pkey PRIMARY KEY ("gridId");


--
-- TOC entry 2966 (class 2606 OID 53945)
-- Name: tb_ingredient_grid_type tb_ingredient_grid_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient_grid_type
    ADD CONSTRAINT tb_ingredient_grid_type_pkey PRIMARY KEY ("ingredientGridTypeId");


--
-- TOC entry 2962 (class 2606 OID 53947)
-- Name: tb_ingredient tb_ingredient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient
    ADD CONSTRAINT tb_ingredient_pkey PRIMARY KEY ("ingredientId");


--
-- TOC entry 2968 (class 2606 OID 53949)
-- Name: tb_level tb_level_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_level
    ADD CONSTRAINT tb_level_pkey PRIMARY KEY ("levelId");


--
-- TOC entry 2970 (class 2606 OID 53951)
-- Name: tb_map tb_map_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_map
    ADD CONSTRAINT tb_map_pkey PRIMARY KEY ("mapId");


--
-- TOC entry 2972 (class 2606 OID 53953)
-- Name: tb_mission tb_mission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_mission
    ADD CONSTRAINT tb_mission_pkey PRIMARY KEY ("missionId");


--
-- TOC entry 2974 (class 2606 OID 53955)
-- Name: tb_object tb_object_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_object
    ADD CONSTRAINT tb_object_pkey PRIMARY KEY ("objectId");


--
-- TOC entry 2978 (class 2606 OID 53957)
-- Name: tb_place_access tb_place_access_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_place_access
    ADD CONSTRAINT tb_place_access_pkey PRIMARY KEY (id);


--
-- TOC entry 2976 (class 2606 OID 53959)
-- Name: tb_place tb_place_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_place
    ADD CONSTRAINT tb_place_pkey PRIMARY KEY ("placeId");


--
-- TOC entry 2980 (class 2606 OID 53961)
-- Name: tb_player tb_player_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_player
    ADD CONSTRAINT tb_player_pkey PRIMARY KEY ("playerId");


--
-- TOC entry 2982 (class 2606 OID 53963)
-- Name: tb_skill tb_skill_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_skill
    ADD CONSTRAINT tb_skill_pkey PRIMARY KEY ("skillId");


--
-- TOC entry 2984 (class 2606 OID 53965)
-- Name: tb_status tb_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_status
    ADD CONSTRAINT tb_status_pkey PRIMARY KEY ("statusId");


--
-- TOC entry 2985 (class 2606 OID 53966)
-- Name: tb_ass_dinoz_object tb_ass_dinoz_object_dinozId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_object
    ADD CONSTRAINT "tb_ass_dinoz_object_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES public.tb_dinoz("dinozId") ON UPDATE CASCADE;


--
-- TOC entry 2986 (class 2606 OID 53971)
-- Name: tb_ass_dinoz_object tb_ass_dinoz_object_objectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_object
    ADD CONSTRAINT "tb_ass_dinoz_object_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES public.tb_object("objectId") ON UPDATE CASCADE;


--
-- TOC entry 2987 (class 2606 OID 53976)
-- Name: tb_ass_dinoz_skill tb_ass_dinoz_skill_dinozId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_skill
    ADD CONSTRAINT "tb_ass_dinoz_skill_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES public.tb_dinoz("dinozId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2988 (class 2606 OID 53981)
-- Name: tb_ass_dinoz_skill tb_ass_dinoz_skill_skillId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_skill
    ADD CONSTRAINT "tb_ass_dinoz_skill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES public.tb_skill("skillId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2989 (class 2606 OID 53986)
-- Name: tb_ass_dinoz_status tb_ass_dinoz_status_dinozId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_status
    ADD CONSTRAINT "tb_ass_dinoz_status_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES public.tb_dinoz("dinozId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2990 (class 2606 OID 53991)
-- Name: tb_ass_dinoz_status tb_ass_dinoz_status_statusId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_dinoz_status
    ADD CONSTRAINT "tb_ass_dinoz_status_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES public.tb_status("statusId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2993 (class 2606 OID 53996)
-- Name: tb_ass_player_object tb_ass_player_object_objectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_player_object
    ADD CONSTRAINT "tb_ass_player_object_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES public.tb_object("objectId") ON UPDATE CASCADE;


--
-- TOC entry 2994 (class 2606 OID 54001)
-- Name: tb_ass_player_object tb_ass_player_object_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_player_object
    ADD CONSTRAINT "tb_ass_player_object_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.tb_player("playerId") ON UPDATE CASCADE;


--
-- TOC entry 2991 (class 2606 OID 54006)
-- Name: tb_ass_player_reward tb_ass_player_reward_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_player_reward
    ADD CONSTRAINT "tb_ass_player_reward_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.tb_player("playerId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2992 (class 2606 OID 54011)
-- Name: tb_ass_player_reward tb_ass_player_reward_rewardId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ass_player_reward
    ADD CONSTRAINT "tb_ass_player_reward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES public.tb_epic_reward("rewardId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2995 (class 2606 OID 54016)
-- Name: tb_dinoz tb_dinoz_dinozId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT "tb_dinoz_dinozId_fkey" FOREIGN KEY ("levelId") REFERENCES public.tb_level("levelId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2996 (class 2606 OID 54021)
-- Name: tb_dinoz tb_dinoz_levelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT "tb_dinoz_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES public.tb_level("levelId") ON UPDATE CASCADE;


--
-- TOC entry 2997 (class 2606 OID 54026)
-- Name: tb_dinoz tb_dinoz_missionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT "tb_dinoz_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES public.tb_mission("missionId") ON UPDATE CASCADE;


--
-- TOC entry 2998 (class 2606 OID 54031)
-- Name: tb_dinoz tb_dinoz_nextUpAltElementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT "tb_dinoz_nextUpAltElementId_fkey" FOREIGN KEY ("nextUpAltElementId") REFERENCES public.tb_element("elementId") ON UPDATE CASCADE;


--
-- TOC entry 2999 (class 2606 OID 54036)
-- Name: tb_dinoz tb_dinoz_nextUpElementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT "tb_dinoz_nextUpElementId_fkey" FOREIGN KEY ("nextUpElementId") REFERENCES public.tb_element("elementId") ON UPDATE CASCADE;


--
-- TOC entry 3000 (class 2606 OID 54041)
-- Name: tb_dinoz tb_dinoz_placeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT "tb_dinoz_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES public.tb_place("placeId") ON UPDATE CASCADE;


--
-- TOC entry 3001 (class 2606 OID 54046)
-- Name: tb_dinoz tb_dinoz_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT "tb_dinoz_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.tb_player("playerId") ON UPDATE CASCADE;


--
-- TOC entry 3002 (class 2606 OID 54051)
-- Name: tb_dinoz tb_dinoz_raceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz
    ADD CONSTRAINT "tb_dinoz_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES public.tb_dinoz_race("raceId") ON UPDATE CASCADE;


--
-- TOC entry 3003 (class 2606 OID 54056)
-- Name: tb_dinoz_race tb_dinoz_race_skillId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz_race
    ADD CONSTRAINT "tb_dinoz_race_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES public.tb_skill("skillId") ON UPDATE CASCADE;


--
-- TOC entry 3004 (class 2606 OID 54061)
-- Name: tb_dinoz_shop tb_dinoz_shop_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz_shop
    ADD CONSTRAINT "tb_dinoz_shop_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.tb_player("playerId") ON UPDATE CASCADE;


--
-- TOC entry 3005 (class 2606 OID 54066)
-- Name: tb_dinoz_shop tb_dinoz_shop_raceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_dinoz_shop
    ADD CONSTRAINT "tb_dinoz_shop_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES public.tb_dinoz_race("raceId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3008 (class 2606 OID 54071)
-- Name: tb_ingredient_grid tb_ingredient_grid_ingredientGridId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient_grid
    ADD CONSTRAINT "tb_ingredient_grid_ingredientGridId_fkey" FOREIGN KEY ("ingredientGridId") REFERENCES public.tb_ingredient_grid_type("ingredientGridTypeId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3009 (class 2606 OID 54076)
-- Name: tb_ingredient_grid tb_ingredient_grid_ingredientGridTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient_grid
    ADD CONSTRAINT "tb_ingredient_grid_ingredientGridTypeId_fkey" FOREIGN KEY ("ingredientGridTypeId") REFERENCES public.tb_ingredient_grid_type("ingredientGridTypeId") ON UPDATE CASCADE;


--
-- TOC entry 3010 (class 2606 OID 54081)
-- Name: tb_ingredient_grid tb_ingredient_grid_placeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient_grid
    ADD CONSTRAINT "tb_ingredient_grid_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES public.tb_place("placeId") ON UPDATE CASCADE;


--
-- TOC entry 3011 (class 2606 OID 54086)
-- Name: tb_ingredient_grid tb_ingredient_grid_playerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient_grid
    ADD CONSTRAINT "tb_ingredient_grid_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES public.tb_player("playerId") ON UPDATE CASCADE;


--
-- TOC entry 3006 (class 2606 OID 54091)
-- Name: tb_ingredient tb_ingredient_ingredientGridTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient
    ADD CONSTRAINT "tb_ingredient_ingredientGridTypeId_fkey" FOREIGN KEY ("ingredientGridTypeId") REFERENCES public.tb_ingredient_grid_type("ingredientGridTypeId") ON UPDATE CASCADE;


--
-- TOC entry 3007 (class 2606 OID 54096)
-- Name: tb_ingredient tb_ingredient_ingredientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_ingredient
    ADD CONSTRAINT "tb_ingredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES public.tb_ingredient_grid_type("ingredientGridTypeId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3013 (class 2606 OID 54101)
-- Name: tb_place_access tb_place_access_placeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_place_access
    ADD CONSTRAINT "tb_place_access_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES public.tb_place("placeId") ON UPDATE CASCADE;


--
-- TOC entry 3012 (class 2606 OID 54106)
-- Name: tb_place tb_place_mapId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_place
    ADD CONSTRAINT "tb_place_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES public.tb_map("mapId") ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2021-06-30 20:43:19 CEST

--
-- PostgreSQL database dump complete
--

