//! This module defines types, constants and functions related to skills.
//! Skills implementations can be found in the `skills` folder

use log::error;
use serde::{Deserialize, Serialize};
use serde_repr::{Deserialize_repr, Serialize_repr};
use std::fmt;

use super::{
    fighter::Fighter,
    manager::{AttackResult, Manager},
};

mod air;
mod fire;
mod lightning;
mod water;
mod wood;

mod double;
mod invocation;
mod monster;
mod race;
mod sphere;

use crate::fight::skills::{
    air::*, double::*, fire::*, invocation::*, lightning::*, race::*, sphere::*, water::*, wood::*,
};

pub const DEFAULT_SKILL_ENERGY_COST: u32 = 20;

/// Type of skill
#[derive(PartialEq, Deserialize, Serialize, Debug, Copy, Clone)]
pub enum SkillType {
    ACTIVE,
    COLLECT, // Useless in fights
    EVENT,
    INVOCATION,
    PASSIVE,
    SPECIAL,
    UNIVERSAL,
    UNKNOWN,
}

/// This wrapper type is meant to catch any wrong values from the configuration and prevent a crash
#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(untagged)]
pub enum SkillOrUnknown {
    Skill(SkillId),
    Unknown(serde_json::Value),
}

/// Shortcut to the effect of a skill: returns a vector of tuple (Option<FighterId>, AttackResult)
pub type SkillEffect = fn(&mut Fighter, &mut Manager) -> Vec<(Option<u32>, AttackResult)>;

/// Definition of a skill, fields are kept private because they are not meant to be changed after creation
///
/// The energy, priority and probability fields matter only for skills that get triggered
/// (like invocation, event, active, may be some specials)
#[derive(Clone, Copy)]
pub struct Skill {
    /// [ID](`SkillId`) of the skill
    id: SkillId,
    // pub elements: Vec<ElementIndex>, // don't think that's needed
    /// [Type](`SkillType`) of the skill
    /// Note: "type" is a protected keyword in rust
    skill_type: SkillType,
    /// Amount of energy used by the skill
    energy: u32,
    /// Priority of the skill when selecting it
    priority: u32,
    /// Probability to use the skill
    probability: u32,
    /// [Effect](`SkillEffect`) of the skill
    effect: SkillEffect,
    /// If true, the skill should be disabled. This is a not related to the enabled/disabled feature for skills.
    /// Instead this is a kill-switch to disable/ignore a skill quickly.
    /// Also some skills just have no effect in fights, so this field will be used to mark them as such.
    ignore: bool,
}

impl std::fmt::Debug for Skill {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "Skill id {:?}: type: {:?}, energy {:?}, priority {:?}, probability {:?}",
            self.id, self.skill_type, self.energy, self.priority, self.probability
        )
    }
}

impl Skill {
    /// Get a vec of skills from a configuration
    pub fn from_config(list_ids: Vec<SkillOrUnknown>) -> Vec<Skill> {
        let mut skills = Vec::new();

        for s in list_ids {
            match s {
                SkillOrUnknown::Skill(s) => skills.push(s.get_skill()),
                SkillOrUnknown::Unknown(v) => {
                    error!("Unknown skill from config: {:?}", v);
                }
            }
        }

        skills
    }

    /// Processes the [effect](`SkillEffect`) of a skill
    pub fn process_skill(
        self,
        f: &mut Fighter,
        m: &mut Manager,
    ) -> Vec<(Option<u32>, AttackResult)> {
        if !self.ignore {
            (self.effect)(f, m)
        } else {
            error!("Skill {:?} not processed because it is ignored", self.id);
            vec![(None, AttackResult::IgnoredSkill)]
        }
    }

    /// Getter for the [id](`SkillId`) of the skill
    pub fn id(&self) -> SkillId {
        self.id
    }

    /// Getter for the [type](`SkillType`) of the skill
    pub fn skill_type(&self) -> SkillType {
        self.skill_type
    }

    /// Getter for the energy consumed by the skill
    pub fn energy(&self) -> u32 {
        self.energy
    }

    /// Getter for the priority of the skill
    pub fn priority(&self) -> u32 {
        self.priority
    }

    /// Getter for the probability of the skill
    pub fn probability(&self) -> u32 {
        self.probability
    }

    /// Getter for the [effect](`SkillEffect`) of the skill
    pub fn effect(&self) -> SkillEffect {
        self.effect
    }

    /// Getter for the `ignore` field of the skill
    pub fn ignore(&self) -> bool {
        self.ignore
    }
}

/// List of skill IDs
#[derive(PartialEq, Eq, Hash, Deserialize_repr, Serialize_repr, Debug, Copy, Clone)]
#[repr(u32)]
#[allow(non_camel_case_types)]
#[non_exhaustive]
pub enum SkillId {
    // FIRE Skills
    GRIFFES_ENFLAMMEES = 11101,
    COLERE = 11102,
    FORCE = 11103,
    BRASERO = 11104,
    SOUFFLE_ARDENT = 11201,
    CHARGE = 11202,
    SANG_CHAUD = 11203,
    FURIE = 11204,
    CHASSEUR_DE_GOUPIGNON = 11205,
    ARTS_MARTIAUX = 11206,
    DETONATION = 11207,
    PROPULSION_DIVINE = 11208,
    VIGILANCE = 11301,
    COEUR_ARDENT = 11302,
    COULEE_DE_LAVE = 11303,
    SIESTE = 11304,
    KAMIKAZE = 11305,
    CHASSEUR_DE_GEANT = 11306,
    BOULE_DE_FEU = 11307,
    WAIKIKIDO = 11308,
    AURA_INCANDESCENTE = 11309,
    VENGEANCE = 11310,
    COMBUSTION = 11311,
    PAUME_CHALUMEAU = 11312,
    COEUR_DE_PHOENIX = 11313,
    BOUDDHA = 11314,
    GRIFFES_INFERNALES = 11315,
    CHASSEUR_DE_DRAGON = 11401,
    BELIER = 11402,
    TORCHE = 11403,
    SELF_CONTROL = 11404,
    SPRINT = 11405,
    VENDETTA = 11406,
    METEORES = 11407,
    CHEF_DE_GUERRE = 11408,
    ARMURE_DE_BASALTE = 11409,
    MAITRE_ELEMENTAIRE = 11410,
    SALAMANDRE = 11411,
    VULCAIN = 11412,
    ARMURE_DIFRIT = 11413,
    BRAVE = 11501,
    PROTEINES_DINOZIENNES = 12101,
    EXTENUATION = 12201,
    ROUGE = 12202,
    CARAPACE_DE_MAGMA = 12301,
    CRI_DE_GUERRE = 12302,
    FIEVRE_BRULANTE = 12401,
    BENEDICTION_DARTEMIS = 12402,
    JOKER = 12403,
    ARMURE_DE_FEU = 12404,
    PAYS_DE_CENDRE = 12501,
    RECEPTACLE_ROCHEUX = 12502,
    PLUMES_DE_PHOENIX = 12503,
    ACCLAMATION_FRATERNELLE = 12504,
    POING_DE_FEU = 12505,

    // WOOD Skills
    CARAPACE = 21101,
    SAUVAGERIE = 21102,
    ENDURANCE = 21103,
    LANCEUR_DE_GLAND = 21104,
    VIGNES = 21201,
    RENFORTS_KORGON = 21202,
    SYMPATIQUE = 21203,
    TENACITE = 21204,
    FOUILLE = 21205,
    CROISSANCE = 21206,
    GRATTEUR = 21207,
    ETAT_PRIMAL = 21301,
    DETECTIVE = 21302,
    COCON = 21303,
    INSTINCT_SAUVAGE = 21304,
    LARGE_MACHOIRE = 21305,
    ACROBATE = 21306,
    PRINTEMPS_PRECOCE = 21307,
    CHARISME = 21308,
    RESISTANCE_A_LA_MAGIE = 21309,
    PLANIFICATEUR = 21310,
    HERITAGE_FAROE = 21311,
    EXPERT_EN_FOUILLE = 21312,
    GROSSE_BEIGNE = 21313,
    ESPRIT_GORILLOZ = 21401,
    LEADER = 21402,
    INGENIEUR = 21403,
    GEANT = 21404,
    GARDE_FORESTIER = 21405,
    ARCHEOLOGUE = 21406,
    BENEDICTION_DES_FEES = 21407,
    CHOC = 21408,
    LOUP_GAROU = 21409,
    COLOSSE = 21501,
    OXYGENATION_MUSCULAIRE = 22101,
    VERT = 22102,
    SOURCE_DE_VIE = 22201,
    VIDE_ENERGETIQUE = 22202,
    BOUCLIER_DINOZ = 22203,
    ACIDE_LACTIQUE = 22204,
    LANCER_DE_ROCHE = 22301,
    COURBATURES = 22302,
    FORCE_CONTROL = 22303,
    PEAU_DE_FER = 22304,
    CHAMPOLLION = 22401,
    COURANT_DE_VIE = 22402,
    BERSERK = 22403,
    RIVIERE_DE_VIE = 22404,
    MUR_DE_BOUE = 22501,
    PEAU_DACIER = 22502,
    SHARIGNAN = 22503,
    AMAZONIE = 22504,
    RECEPTACLE_AQUEUX = 22505,

    // WATER Skills
    CANON_A_EAU = 31101,
    PERCEPTION = 31102,
    MUTATION = 31103,
    VITALITE = 31104,
    GEL = 31201,
    DOUCHE_ECOSSAISE = 31202,
    COUP_SOURNOIS = 31203,
    APPRENTI_PECHEUR = 31204,
    POCHE_VENTRALE = 31205,
    KARATE_SOUS_MARIN = 31206,
    ECAILLES_LUMINESCENTES = 31207,
    MOIGNONS_LIQUIDES = 31208,
    ZERO_ABSOLU = 31301,
    PETRIFICATION = 31302,
    ACUPUNCTURE = 31303,
    SAPEUR = 31304,
    COUP_FATAL = 31305,
    ENTRAINEMENT_SOUS_MARIN = 31306,
    PECHEUR_CONFIRME = 31307,
    MARECAGE = 31308,
    SUMO = 31309,
    SANS_PITIE = 31310,
    CLONE_AQUEUX = 31311,
    GRIFFES_EMPOISONNEES = 31312,
    DELUGE = 31313,
    PEAU_DE_SERPENT = 31314,
    RAYON_KAAR_SHER = 31401,
    MAGASINIER = 31402,
    ENTRAINEMENT_SOUS_MARIN_AVANCE = 31403,
    MAITRE_PECHEUR = 31404,
    CUISINIER = 31405,
    SANG_ACIDE = 31406,
    BULLE = 31407,
    INCREVABLE = 31408,
    ONDINE = 31409,
    MAITRE_NAGEUR = 31501,
    LEVIATHAN = 31502,
    EAU_DIVINE = 32101,
    RADIATIONS_GAMMA = 32201,
    BLEU = 32202,
    MUE_ACQUEUSE = 32301,
    CARAPACE_BLINDEE = 32302,
    DIETE_CHROMATIQUE = 32303,
    EFFLUVE_APHRODISIAQUE = 32401,
    NEMO = 32402,
    CLEPTOMANE = 32403,
    ABYSSE = 32404,
    BANNI_DES_DIEUX = 32405,
    TOURBILLON_MAGIQUE = 32501,
    HYPERVENTILATION = 32502,
    THERAPIE_DE_GROUPE = 32503,
    RECEPTACLE_TESLA = 32504,
    VITALITE_MARINE = 32505,

    // LIGHTNING Skills
    INTELLIGENCE = 41101,
    FOCUS = 41102,
    CELERITE = 41103,
    REFLEX = 41104,
    CONCENTRATION = 41201,
    ATTAQUE_ECLAIR = 41202,
    PARATONNERRE = 41203,
    COUP_DOUBLE = 41204,
    REGENERESCENCE = 41205,
    PREMIERS_SOINS = 41206,
    ECLAIR_SINUEUX = 41207,
    FOUDRE = 41301,
    FISSION_ELEMENTAIRE = 41302,
    VOIE_DE_KAOS = 41303,
    PLAN_DE_CARRIERE = 41304,
    ADRENALINE = 41305,
    VOIE_DE_GAIA = 41306,
    MEDECINE = 41307,
    DANSE_FOUDROYANTE = 41308,
    EMBUCHE = 41309,
    PUREE_SALVATRICE = 41310,
    AURA_HERMETIQUE = 41311,
    CROCS_DIAMANT = 41312,
    SURVIE = 41313,
    AUBE_FEUILLUE = 41401,
    BRANCARDIER = 41402,
    BENEDICTION = 41403,
    CREPUSCULE_FLAMBOYANT = 41404,
    MARCHAND = 41405,
    REINCARNATION = 41406,
    SURCHARGE = 41408,
    ELECTROLYSE = 41409,
    GOLEM = 41410,
    RAIJIN = 41411,
    QUETZACOATL = 41412,
    ROI_DES_SINGES = 41413,
    ARCHANGE_CORROSIF = 41501,
    ARCHANGE_GENESIF = 41502,
    PRETRE = 41503,
    SOUTIEN_MORAL = 42101,
    STIMULATION_CARDIAQUE = 42201,
    JAUNE = 42202,
    MORSURE_DU_SOLEIL = 42301,
    CRAMPE_CHRONIQUE = 42303,
    BATTERIE_SUPPLEMENTAIRE = 42401,
    EINSTEIN = 42402,
    BARRIERE_ELECTRIFIEE = 42403,
    ORACLE = 42404,
    RECEPTACLE_AERIEN = 42501,
    FEU_DE_ST_ELME = 42502,
    FORCE_DE_ZEUS = 42503,
    REMANENCE_HERTZIENNE = 42504,

    // AIR Skills
    AGILITE = 51101,
    STRATEGIE = 51102,
    MISTRAL = 51103,
    AIGUILLON = 51104,
    ENVOL = 51105,
    ESQUIVE = 51201,
    SAUT = 51202,
    ANALYSE = 51203,
    CUEILLETTE = 51204,
    TAICHI = 51205,
    TORNADE = 51206,
    AURA_PUANTE = 51207,
    DISQUE_VACUUM = 51301,
    ELASTICITE = 51302,
    ATTAQUE_PLONGEANTE = 51303,
    FURTIVITE = 51304,
    SPECIALISTE = 51305,
    TALON_DACHILLE = 51306,
    NUAGE_TOXIQUE = 51307,
    OEIL_DE_LYNX = 51308,
    EVEIL = 51309,
    PAUME_EJECTABLE = 51310,
    VENT_VIF = 51311,
    FORME_VAPOREUSE = 51312,
    HYPNOSE = 51313,
    SECOUSSE = 51314,
    TROU_NOIR = 51401,
    MAITRE_LEVITATEUR = 51402,
    HALEINE_FETIVE = 51403,
    MEDITATION_SOLITAIRE = 51404,
    PROFESSEUR = 51405,
    SOUFFLE_DE_VIE = 51406,
    TOTEM_ANCESTRAL_AEROPORTE = 51407,
    FUJIN = 51408,
    MEDITATION_TRANCHANTE = 51501,
    DJINN = 51502,
    HADES = 51503,
    FORME_ETHERALE = 51601,
    MAITRISE_CORPORELLE = 52101,
    BLANC = 52201,
    ANAEROBIE = 52202,
    DOUBLE_FACE = 52301,
    FLAGELLATION = 52302,
    SOUFFLE_DANGE = 52303,
    OURAGAN = 52304,
    OURANOS = 52401,
    TWINOID_500MG = 52402,
    LONDUHAUT = 52403,
    SURPLIS_DHADES = 52404,
    RECEPTABLE_THERMIQUE = 52405,
    QI_GONG = 52501,
    SYLPHIDES = 52502,
    MESSIE = 52503,
    MUTINERIE = 52504,
    MAINS_COLLANTES = 52505,

    // VOID Skills
    COMPETENCE_DOUBLE = 61119,
    LIMITE_BRISEE = 61120,
    INVOCATEUR = 61121,
    FRENESIE_COLLECTIVE = 61101,
    COQUE = 61102,
    CHARGE_CORNUE = 61103,
    ROCK = 61104,
    PIETINEMENT = 61105,
    CUIRASSE = 61106,
    INSAISISSABLE = 61107,
    DEPLACEMENT_INSTANTANE = 61108,
    NAPOMAGICIEN = 61109,
    GROS_COSTAUD = 61111,
    ORIGINE_CAUSHEMESHENNE = 61112,
    ECRASEMENT = 61113,
    FORCE_DE_LUMIERE = 61114,
    CHARGE_PIGMOU = 61115,
    FORCE_DES_TENEBRES = 61116,
    BIGMAGNON = 61117,
    DUR_A_CUIRE = 61118,

    // OTHER Skills
    HERCOLUBUS = 41504,
    REINE_DE_LA_RUCHE = 41505,
    BIG_MAMA = 51506,
    YGGDRASIL = 41507,
    BALEINE_BLANCHE = 41508,

    /// Unknown skill
    UNKNOWN = 99999,
}

impl SkillId {
    /// Matches the [`SkillId`] with the [`Skill`] definition
    fn get_skill(self) -> Skill {
        match self {
            // FIRE Skills
            SkillId::GRIFFES_ENFLAMMEES => GRIFFES_ENFLAMMEES,
            SkillId::COLERE => COLERE,
            SkillId::FORCE => FORCE,
            SkillId::BRASERO => BRASERO,
            SkillId::SOUFFLE_ARDENT => SOUFFLE_ARDENT,
            SkillId::CHARGE => CHARGE,
            SkillId::SANG_CHAUD => SANG_CHAUD,
            SkillId::FURIE => FURIE,
            SkillId::CHASSEUR_DE_GOUPIGNON => CHASSEUR_DE_GOUPIGNON,
            SkillId::ARTS_MARTIAUX => ARTS_MARTIAUX,
            SkillId::DETONATION => DETONATION,
            SkillId::PROPULSION_DIVINE => PROPULSION_DIVINE,
            SkillId::VIGILANCE => VIGILANCE,
            SkillId::COEUR_ARDENT => COEUR_ARDENT,
            SkillId::COULEE_DE_LAVE => COULEE_DE_LAVE,
            SkillId::SIESTE => SIESTE,
            SkillId::KAMIKAZE => KAMIKAZE,
            SkillId::CHASSEUR_DE_GEANT => CHASSEUR_DE_GEANT,
            SkillId::BOULE_DE_FEU => BOULE_DE_FEU,
            SkillId::WAIKIKIDO => WAIKIKIDO,
            SkillId::AURA_INCANDESCENTE => AURA_INCANDESCENTE,
            SkillId::VENGEANCE => VENGEANCE,
            SkillId::COMBUSTION => COMBUSTION,
            SkillId::PAUME_CHALUMEAU => PAUME_CHALUMEAU,
            SkillId::COEUR_DE_PHOENIX => COEUR_DE_PHOENIX,
            SkillId::BOUDDHA => BOUDDHA,
            SkillId::GRIFFES_INFERNALES => GRIFFES_INFERNALES,
            SkillId::CHASSEUR_DE_DRAGON => CHASSEUR_DE_DRAGON,
            SkillId::BELIER => BELIER,
            SkillId::TORCHE => TORCHE,
            SkillId::SELF_CONTROL => SELF_CONTROL,
            SkillId::SPRINT => SPRINT,
            SkillId::VENDETTA => VENDETTA,
            SkillId::METEORES => METEORES,
            SkillId::CHEF_DE_GUERRE => CHEF_DE_GUERRE,
            SkillId::ARMURE_DE_BASALTE => ARMURE_DE_BASALTE,
            SkillId::MAITRE_ELEMENTAIRE => MAITRE_ELEMENTAIRE,
            SkillId::SALAMANDRE => SALAMANDRE,
            SkillId::VULCAIN => VULCAIN,
            SkillId::ARMURE_DIFRIT => ARMURE_DIFRIT,
            SkillId::BRAVE => BRAVE,
            SkillId::PROTEINES_DINOZIENNES => PROTEINES_DINOZIENNES,
            SkillId::EXTENUATION => EXTENUATION,
            SkillId::ROUGE => ROUGE,
            SkillId::CARAPACE_DE_MAGMA => CARAPACE_DE_MAGMA,
            SkillId::CRI_DE_GUERRE => CRI_DE_GUERRE,
            SkillId::FIEVRE_BRULANTE => FIEVRE_BRULANTE,
            SkillId::BENEDICTION_DARTEMIS => BENEDICTION_DARTEMIS,
            SkillId::JOKER => JOKER,
            SkillId::ARMURE_DE_FEU => ARMURE_DE_FEU,
            SkillId::PAYS_DE_CENDRE => PAYS_DE_CENDRE,
            SkillId::RECEPTACLE_ROCHEUX => RECEPTACLE_ROCHEUX,
            SkillId::PLUMES_DE_PHOENIX => PLUMES_DE_PHOENIX,
            SkillId::ACCLAMATION_FRATERNELLE => ACCLAMATION_FRATERNELLE,
            SkillId::POING_DE_FEU => POING_DE_FEU,

            // WOOD Skills
            SkillId::CARAPACE => CARAPACE,
            SkillId::SAUVAGERIE => SAUVAGERIE,
            SkillId::ENDURANCE => ENDURANCE,
            SkillId::LANCEUR_DE_GLAND => LANCEUR_DE_GLAND,
            SkillId::VIGNES => VIGNES,
            SkillId::RENFORTS_KORGON => RENFORTS_KORGON,
            SkillId::SYMPATIQUE => SYMPATIQUE,
            SkillId::TENACITE => TENACITE,
            SkillId::FOUILLE => FOUILLE,
            SkillId::CROISSANCE => CROISSANCE,
            SkillId::GRATTEUR => GRATTEUR,
            SkillId::ETAT_PRIMAL => ETAT_PRIMAL,
            SkillId::DETECTIVE => DETECTIVE,
            SkillId::COCON => COCON,
            SkillId::INSTINCT_SAUVAGE => INSTINCT_SAUVAGE,
            SkillId::LARGE_MACHOIRE => LARGE_MACHOIRE,
            SkillId::ACROBATE => ACROBATE,
            SkillId::PRINTEMPS_PRECOCE => PRINTEMPS_PRECOCE,
            SkillId::CHARISME => CHARISME,
            SkillId::RESISTANCE_A_LA_MAGIE => RESISTANCE_A_LA_MAGIE,
            SkillId::PLANIFICATEUR => PLANIFICATEUR,
            SkillId::HERITAGE_FAROE => HERITAGE_FAROE,
            SkillId::EXPERT_EN_FOUILLE => EXPERT_EN_FOUILLE,
            SkillId::GROSSE_BEIGNE => GROSSE_BEIGNE,
            SkillId::ESPRIT_GORILLOZ => ESPRIT_GORILLOZ,
            SkillId::LEADER => LEADER,
            SkillId::INGENIEUR => INGENIEUR,
            SkillId::GEANT => GEANT,
            SkillId::GARDE_FORESTIER => GARDE_FORESTIER,
            SkillId::ARCHEOLOGUE => ARCHEOLOGUE,
            SkillId::BENEDICTION_DES_FEES => BENEDICTION_DES_FEES,
            SkillId::CHOC => CHOC,
            SkillId::LOUP_GAROU => LOUP_GAROU,
            SkillId::COLOSSE => COLOSSE,
            SkillId::OXYGENATION_MUSCULAIRE => OXYGENATION_MUSCULAIRE,
            SkillId::VERT => VERT,
            SkillId::SOURCE_DE_VIE => SOURCE_DE_VIE,
            SkillId::VIDE_ENERGETIQUE => VIDE_ENERGETIQUE,
            SkillId::BOUCLIER_DINOZ => BOUCLIER_DINOZ,
            SkillId::ACIDE_LACTIQUE => ACIDE_LACTIQUE,
            SkillId::LANCER_DE_ROCHE => LANCER_DE_ROCHE,
            SkillId::COURBATURES => COURBATURES,
            SkillId::FORCE_CONTROL => FORCE_CONTROL,
            SkillId::PEAU_DE_FER => PEAU_DE_FER,
            SkillId::CHAMPOLLION => CHAMPOLLION,
            SkillId::COURANT_DE_VIE => COURANT_DE_VIE,
            SkillId::BERSERK => BERSERK,
            SkillId::RIVIERE_DE_VIE => RIVIERE_DE_VIE,
            SkillId::MUR_DE_BOUE => MUR_DE_BOUE,
            SkillId::PEAU_DACIER => PEAU_DACIER,
            SkillId::SHARIGNAN => SHARIGNAN,
            SkillId::AMAZONIE => AMAZONIE,
            SkillId::RECEPTACLE_AQUEUX => RECEPTACLE_AQUEUX,

            // WATER Skills
            SkillId::CANON_A_EAU => CANON_A_EAU,
            SkillId::PERCEPTION => PERCEPTION,
            SkillId::MUTATION => MUTATION,
            // SkillId::VITALITE => VITALITE,
            SkillId::GEL => GEL,
            SkillId::DOUCHE_ECOSSAISE => DOUCHE_ECOSSAISE,
            SkillId::COUP_SOURNOIS => COUP_SOURNOIS,
            SkillId::APPRENTI_PECHEUR => APPRENTI_PECHEUR,
            SkillId::POCHE_VENTRALE => POCHE_VENTRALE,
            SkillId::KARATE_SOUS_MARIN => KARATE_SOUS_MARIN,
            SkillId::ECAILLES_LUMINESCENTES => ECAILLES_LUMINESCENTES,
            // SkillId::MOIGNONS_LIQUIDES => MOIGNONS_LIQUIDES,
            SkillId::ZERO_ABSOLU => ZERO_ABSOLU,
            SkillId::PETRIFICATION => PETRIFICATION,
            SkillId::ACUPUNCTURE => ACUPUNCTURE,
            SkillId::SAPEUR => SAPEUR,
            SkillId::COUP_FATAL => COUP_FATAL,
            SkillId::ENTRAINEMENT_SOUS_MARIN => ENTRAINEMENT_SOUS_MARIN,
            SkillId::PECHEUR_CONFIRME => PECHEUR_CONFIRME,
            SkillId::MARECAGE => MARECAGE,
            SkillId::SUMO => SUMO,
            SkillId::SANS_PITIE => SANS_PITIE,
            SkillId::CLONE_AQUEUX => CLONE_AQUEUX,
            SkillId::GRIFFES_EMPOISONNEES => GRIFFES_EMPOISONNEES,
            // SkillId::DELUGE => DELUGE,
            SkillId::PEAU_DE_SERPENT => PEAU_DE_SERPENT,
            SkillId::RAYON_KAAR_SHER => RAYON_KAAR_SHER,
            SkillId::MAGASINIER => MAGASINIER,
            SkillId::ENTRAINEMENT_SOUS_MARIN_AVANCE => ENTRAINEMENT_SOUS_MARIN_AVANCE,
            SkillId::MAITRE_PECHEUR => MAITRE_PECHEUR,
            SkillId::CUISINIER => CUISINIER,
            SkillId::SANG_ACIDE => SANG_ACIDE,
            // SkillId::BULLE => BULLE,
            SkillId::INCREVABLE => INCREVABLE,
            // SkillId::ONDINE => ONDINE,
            SkillId::MAITRE_NAGEUR => MAITRE_NAGEUR,
            // SkillId::LEVIATHAN => LEVIATHAN,
            SkillId::EAU_DIVINE => EAU_DIVINE,
            SkillId::RADIATIONS_GAMMA => RADIATIONS_GAMMA,
            SkillId::BLEU => BLEU,
            SkillId::MUE_ACQUEUSE => MUE_ACQUEUSE,
            SkillId::CARAPACE_BLINDEE => CARAPACE_BLINDEE,
            SkillId::DIETE_CHROMATIQUE => DIETE_CHROMATIQUE,
            SkillId::EFFLUVE_APHRODISIAQUE => EFFLUVE_APHRODISIAQUE,
            SkillId::NEMO => NEMO,
            SkillId::CLEPTOMANE => CLEPTOMANE,
            SkillId::ABYSSE => ABYSSE,
            SkillId::BANNI_DES_DIEUX => BANNI_DES_DIEUX,
            SkillId::TOURBILLON_MAGIQUE => TOURBILLON_MAGIQUE,
            SkillId::HYPERVENTILATION => HYPERVENTILATION,
            SkillId::THERAPIE_DE_GROUPE => THERAPIE_DE_GROUPE,
            SkillId::RECEPTACLE_TESLA => RECEPTACLE_TESLA,
            SkillId::VITALITE_MARINE => VITALITE_MARINE,

            // LIGHTNING Skills
            SkillId::INTELLIGENCE => INTELLIGENCE,
            SkillId::FOCUS => FOCUS,
            SkillId::CELERITE => CELERITE,
            // SkillId::REFLEX => REFLEX,
            SkillId::CONCENTRATION => CONCENTRATION,
            SkillId::ATTAQUE_ECLAIR => ATTAQUE_ECLAIR,
            SkillId::PARATONNERRE => PARATONNERRE,
            SkillId::COUP_DOUBLE => COUP_DOUBLE,
            SkillId::REGENERESCENCE => REGENERESCENCE,
            SkillId::PREMIERS_SOINS => PREMIERS_SOINS,
            // SkillId::ECLAIR_SINUEUX => ECLAIR_SINUEUX,
            SkillId::FOUDRE => FOUDRE,
            SkillId::FISSION_ELEMENTAIRE => FISSION_ELEMENTAIRE,
            SkillId::VOIE_DE_KAOS => VOIE_DE_KAOS,
            SkillId::PLAN_DE_CARRIERE => PLAN_DE_CARRIERE,
            SkillId::ADRENALINE => ADRENALINE,
            SkillId::VOIE_DE_GAIA => VOIE_DE_GAIA,
            SkillId::MEDECINE => MEDECINE,
            SkillId::DANSE_FOUDROYANTE => DANSE_FOUDROYANTE,
            SkillId::EMBUCHE => EMBUCHE,
            SkillId::PUREE_SALVATRICE => PUREE_SALVATRICE,
            SkillId::AURA_HERMETIQUE => AURA_HERMETIQUE,
            SkillId::CROCS_DIAMANT => CROCS_DIAMANT,
            // SkillId::SURVIE => SURVIE,
            SkillId::AUBE_FEUILLUE => AUBE_FEUILLUE,
            SkillId::BRANCARDIER => BRANCARDIER,
            SkillId::BENEDICTION => BENEDICTION,
            SkillId::CREPUSCULE_FLAMBOYANT => CREPUSCULE_FLAMBOYANT,
            SkillId::MARCHAND => MARCHAND,
            SkillId::REINCARNATION => REINCARNATION,
            // SkillId::SURCHARGE => SURCHARGE,
            SkillId::ELECTROLYSE => ELECTROLYSE,
            // SkillId::GOLEM => GOLEM,
            // SkillId::RAIJIN => RAIJIN,
            // SkillId::QUETZACOATL => QUETZACOATL,
            // SkillId::ROI_DES_SINGES => ROI_DES_SINGES,
            SkillId::ARCHANGE_CORROSIF => ARCHANGE_CORROSIF,
            SkillId::ARCHANGE_GENESIF => ARCHANGE_GENESIF,
            SkillId::PRETRE => PRETRE,
            SkillId::SOUTIEN_MORAL => SOUTIEN_MORAL,
            SkillId::STIMULATION_CARDIAQUE => STIMULATION_CARDIAQUE,
            SkillId::JAUNE => JAUNE,
            // SkillId::MORSURE_DU_SOLEIL => MORSURE_DU_SOLEIL,
            // SkillId::CRAMPE_CHRONIQUE => CRAMPE_CHRONIQUE,
            SkillId::BATTERIE_SUPPLEMENTAIRE => BATTERIE_SUPPLEMENTAIRE,
            // SkillId::EINSTEIN => EINSTEIN,
            SkillId::BARRIERE_ELECTRIFIEE => BARRIERE_ELECTRIFIEE,
            SkillId::ORACLE => ORACLE,
            // SkillId::RECEPTACLE_AERIEN => RECEPTACLE_AERIEN,
            // SkillId::FEU_DE_ST_ELME => FEU_DE_ST_ELME,
            SkillId::FORCE_DE_ZEUS => FORCE_DE_ZEUS,
            SkillId::REMANENCE_HERTZIENNE => REMANENCE_HERTZIENNE,

            // AIR Skills
            SkillId::AGILITE => AGILITE,
            // SkillId::STRATEGIE => STRATEGIE,
            // SkillId::MISTRAL => MISTRAL,
            // SkillId::AIGUILLON => AIGUILLON,
            // SkillId::ENVOL =>  ENVOL,
            SkillId::ESQUIVE => ESQUIVE,
            SkillId::SAUT => SAUT,
            // SkillId::ANALYSE => ANALYSE,
            // SkillId::CUEILLETTE => CUEILLETTE,
            SkillId::TAICHI => TAICHI,
            // SkillId::TORNADE => TORNADE,
            // SkillId::AURA_PUANTE => AURA_PUANTE,
            // SkillId::DISQUE_VACUUM => DISQUE_VACUUM,
            SkillId::ELASTICITE => ELASTICITE,
            // SkillId::ATTAQUE_PLONGEANTE => ATTAQUE_PLONGEANTE,
            SkillId::FURTIVITE => FURTIVITE,
            // SkillId::SPECIALISTE => SPECIALISTE,
            SkillId::TALON_DACHILLE => TALON_DACHILLE,
            // SkillId::NUAGE_TOXIQUE => NUAGE_TOXIQUE,
            // SkillId::OEIL_DE_LYNX => OEIL_DE_LYNX,
            SkillId::EVEIL => EVEIL,
            // SkillId::PAUME_EJECTABLE => PAUME_EJECTABLE,
            // SkillId::VENT_VIF => VENT_VIF,
            // SkillId::FORME_VAPOREUSE => FORME_VAPOREUSE,
            // SkillId::HYPNOSE => HYPNOSE,
            // SkillId::SECOUSSE => SECOUSSE,
            // SkillId::TROU_NOIR => TROU_NOIR,
            // SkillId::MAITRE_LEVITATEUR => MAITRE_LEVITATEUR,
            // SkillId::HALEINE_FETIVE => HALEINE_FETIVE,
            SkillId::MEDITATION_SOLITAIRE => MEDITATION_SOLITAIRE,
            // SkillId::PROFESSEUR => PROFESSEUR,
            // SkillId::SOUFFLE_DE_VIE => SOUFFLE_DE_VIE,
            // SkillId::TOTEM_ANCESTRAL_AEROPORTE => TOTEM_ANCESTRAL_AEROPORTE,
            // SkillId::FUJIN => FUJIN,
            SkillId::MEDITATION_TRANCHANTE => MEDITATION_TRANCHANTE,
            // SkillId::DJINN => DJINN,
            // SkillId::HADES => HADES,
            // SkillId::FORME_ETHERALE => FORME_ETHERALE,
            SkillId::MAITRISE_CORPORELLE => MAITRISE_CORPORELLE,
            SkillId::BLANC => BLANC,
            SkillId::ANAEROBIE => ANAEROBIE,
            SkillId::DOUBLE_FACE => DOUBLE_FACE,
            SkillId::FLAGELLATION => FLAGELLATION,
            SkillId::SOUFFLE_DANGE => SOUFFLE_DANGE,
            SkillId::OURAGAN => OURAGAN,
            // SkillId::OURANOS => OURANOS,
            SkillId::TWINOID_500MG => TWINOID_500MG,
            // SkillId::LONDUHAUT => LONDUHAUT,
            // SkillId::SURPLIS_DHADES => SURPLIS_DHADES,
            // SkillId::RECEPTABLE_THERMIQUE => RECEPTABLE_THERMIQUE,
            // SkillId::QI_GONG => QI_GONG,
            // SkillId::SYLPHIDES => SYLPHIDES,
            // SkillId::MESSIE => MESSIE,
            // SkillId::MUTINERIE => MUTINERIE,
            // SkillId::MAINS_COLLANTES => MAINS_COLLANTES,

            // VOID Skills
            // SkillId::COMPETENCE_DOUBLE => COMPETENCE_DOUBLE,
            // SkillId::LIMITE_BRISEE => LIMITE_BRISEE,
            // SkillId::INVOCATEUR => INVOCATEUR,
            // SkillId::FRENESIE_COLLECTIVE => FRENESIE_COLLECTIVE,
            SkillId::COQUE => COQUE,
            SkillId::CHARGE_CORNUE => CHARGE_CORNUE,
            // SkillId::ROCK => ROCK,
            SkillId::PIETINEMENT => PIETINEMENT,
            // SkillId::CUIRASSE => CUIRASSE,
            SkillId::INSAISISSABLE => INSAISISSABLE,
            SkillId::DEPLACEMENT_INSTANTANE => DEPLACEMENT_INSTANTANE,
            // SkillId::NAPOMAGICIEN => NAPOMAGICIEN,
            SkillId::GROS_COSTAUD => GROS_COSTAUD,
            SkillId::ORIGINE_CAUSHEMESHENNE => ORIGINE_CAUSHEMESHENNE,
            // SkillId::ECRASEMENT => ECRASEMENT,
            SkillId::FORCE_DE_LUMIERE => FORCE_DE_LUMIERE,
            // SkillId::CHARGE_PIGMOU => CHARGE_PIGMOU,
            SkillId::FORCE_DES_TENEBRES => FORCE_DES_TENEBRES,
            // SkillId::BIGMAGNON => BIGMAGNsON,
            SkillId::DUR_A_CUIRE => DUR_A_CUIRE,

            // OTHER Skills
            // SkillId::HERCOLUBUS => HERCOLUBUS,
            // SkillId::REINE_DE_LA_RUCHE => REINE_DE_LA_RUCHE,
            // SkillId::BIG_MAMA => BIG_MAMA,
            // SkillId::YGGDRASIL => YGGDRASIL,
            // SkillId::BALEINE_BLANCHE => BALEINE_BLANCHE,
            // TODO add the other skills
            _ => {
                error!("Unknown or not yet implemented skill {:?}", self);
                UNKNOWN_SKILL
            }
        }
    }
}

static UNKNOWN_SKILL: Skill = Skill {
    id: SkillId::UNKNOWN,
    skill_type: SkillType::UNKNOWN,
    energy: 0,
    priority: 0,
    probability: 0,
    effect: |_f: &mut Fighter, _: &mut Manager| {
        error!("Unknown skill, ignored for fights");
        vec![(None, AttackResult::UnknownSkill)]
    },
    ignore: true,
};
