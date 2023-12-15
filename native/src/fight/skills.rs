//! This module defines types, constants and functions related to skills.
//! Skills implementations can be found in the `skills` folder

use log::{error, trace};
use serde::{Deserialize, Serialize};
use serde_repr::{Deserialize_repr, Serialize_repr};
use std::fmt::{self, Display};

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

/// Shortcut to the effect of a skill: returns a vector of [AttackResult] to support skills that affect multiple targets
///
/// A single target skill will return `vec![TargetId]` whereas a whole team skill will return a vector containing the result for each target
pub type SkillEffect = fn(&mut Fighter, &mut Manager) -> Vec<AttackResult>;

/// Definition of a skill, fields are kept private because they are not meant to be changed after creation
///
/// The energy, priority and probability fields matter only for skills that get triggered
/// (like invocation, event, active, may be some specials)
#[derive(Clone, Copy)]
pub struct Skill {
    /// [ID](SkillId) of the skill
    id: SkillId,
    // pub elements: Vec<ElementIndex>, // don't think that's needed
    /// [Type](SkillType) of the skill
    /// Note: "type" is a protected keyword in rust
    skill_type: SkillType,
    /// Amount of energy used by the skill
    energy: u32,
    /// Priority of the skill when selecting it
    priority: u32,
    /// Probability to use the skill
    probability: u32,
    /// [Effect](SkillEffect) of the skill
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
                SkillOrUnknown::Skill(s) => {
                    if let Some(s) = s.get_skill() {
                        skills.push(s)
                    }
                }
                SkillOrUnknown::Unknown(v) => {
                    error!("Unknown skill from config: {:?}", v);
                }
            }
        }

        skills
    }

    /// Processes the [effect](`SkillEffect`) of a skill
    pub fn process_skill(self, f: &mut Fighter, m: &mut Manager) -> Vec<AttackResult> {
        if !self.ignore {
            (self.effect)(f, m)
        } else {
            error!("Skill {:?} not processed because it is ignored", self.id);
            vec![AttackResult::IgnoredSkill(self.id)]
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
///
/// This regroup all skills, they are purposefully all there so that the Node backend can just query the list of skills of the dinoz
/// and does not have to do some complex filtering
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

impl Display for SkillId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        // TODO name the skills here
        writeln!(f, "{}", self)
    }
}

impl SkillId {
    /// Matches the [SkillId] with the [Skill] definition
    ///
    /// Returns `None` if no matching [Skill] exists
    fn get_skill(self) -> Option<Skill> {
        match self {
            // Vanilla FIRE Skills
            SkillId::GRIFFES_ENFLAMMEES => Some(GRIFFES_ENFLAMMEES),
            SkillId::COLERE => Some(COLERE),
            SkillId::FORCE => Some(FORCE),
            SkillId::SOUFFLE_ARDENT => Some(SOUFFLE_ARDENT),
            SkillId::CHARGE => Some(CHARGE),
            SkillId::SANG_CHAUD => Some(SANG_CHAUD),
            SkillId::FURIE => Some(FURIE),
            SkillId::ARTS_MARTIAUX => Some(ARTS_MARTIAUX),
            SkillId::PROPULSION_DIVINE => Some(PROPULSION_DIVINE),
            SkillId::VIGILANCE => Some(VIGILANCE),
            SkillId::COEUR_ARDENT => Some(COEUR_ARDENT),
            SkillId::COULEE_DE_LAVE => Some(COULEE_DE_LAVE),
            SkillId::SIESTE => Some(SIESTE),
            SkillId::KAMIKAZE => Some(KAMIKAZE),
            SkillId::BOULE_DE_FEU => Some(BOULE_DE_FEU),
            SkillId::WAIKIKIDO => Some(WAIKIKIDO),
            SkillId::AURA_INCANDESCENTE => Some(AURA_INCANDESCENTE),
            SkillId::VENGEANCE => Some(VENGEANCE),
            SkillId::COMBUSTION => Some(COMBUSTION),
            SkillId::PAUME_CHALUMEAU => Some(PAUME_CHALUMEAU),
            SkillId::GRIFFES_INFERNALES => Some(GRIFFES_INFERNALES),
            SkillId::BELIER => Some(BELIER),
            SkillId::TORCHE => Some(TORCHE),
            SkillId::SELF_CONTROL => Some(SELF_CONTROL),
            SkillId::METEORES => Some(METEORES),
            SkillId::CHEF_DE_GUERRE => Some(CHEF_DE_GUERRE),
            SkillId::BRAVE => Some(BRAVE),

            // Ether FIRE Skills
            SkillId::PROTEINES_DINOZIENNES => Some(PROTEINES_DINOZIENNES),
            SkillId::EXTENUATION => Some(EXTENUATION),
            SkillId::ROUGE => Some(ROUGE),
            SkillId::CARAPACE_DE_MAGMA => Some(CARAPACE_DE_MAGMA),
            SkillId::CRI_DE_GUERRE => Some(CRI_DE_GUERRE),
            SkillId::FIEVRE_BRULANTE => Some(FIEVRE_BRULANTE),
            SkillId::JOKER => Some(JOKER),
            SkillId::ARMURE_DE_FEU => Some(ARMURE_DE_FEU),
            SkillId::PAYS_DE_CENDRE => Some(PAYS_DE_CENDRE),
            SkillId::RECEPTACLE_ROCHEUX => Some(RECEPTACLE_ROCHEUX),
            SkillId::PLUMES_DE_PHOENIX => Some(PLUMES_DE_PHOENIX),
            SkillId::ACCLAMATION_FRATERNELLE => Some(ACCLAMATION_FRATERNELLE),
            SkillId::POING_DE_FEU => Some(POING_DE_FEU),

            // Ignored FIRE Skills because they are useless in fights, they are intentionally commented
            // SkillId::CHASSEUR_DE_GOUPIGNON => Some(CHASSEUR_DE_GOUPIGNON),
            // SkillId::CHASSEUR_DE_GEANT => Some(CHASSEUR_DE_GEANT),
            // SkillId::CHASSEUR_DE_DRAGON => Some(CHASSEUR_DE_DRAGON),
            // SkillId::BENEDICTION_DARTEMIS => Some(BENEDICTION_DARTEMIS),

            // Vanilla WOOD Skills
            SkillId::CARAPACE => Some(CARAPACE),
            SkillId::SAUVAGERIE => Some(SAUVAGERIE),
            SkillId::ENDURANCE => Some(ENDURANCE),
            SkillId::VIGNES => Some(VIGNES),
            SkillId::RENFORTS_KORGON => Some(RENFORTS_KORGON),
            SkillId::TENACITE => Some(TENACITE),
            SkillId::CROISSANCE => Some(CROISSANCE),
            SkillId::ETAT_PRIMAL => Some(ETAT_PRIMAL),
            SkillId::INSTINCT_SAUVAGE => Some(INSTINCT_SAUVAGE),
            SkillId::LARGE_MACHOIRE => Some(LARGE_MACHOIRE),
            SkillId::ACROBATE => Some(ACROBATE),
            SkillId::PRINTEMPS_PRECOCE => Some(PRINTEMPS_PRECOCE),
            SkillId::RESISTANCE_A_LA_MAGIE => Some(RESISTANCE_A_LA_MAGIE),
            SkillId::HERITAGE_FAROE => Some(HERITAGE_FAROE),
            SkillId::ESPRIT_GORILLOZ => Some(ESPRIT_GORILLOZ),
            SkillId::GEANT => Some(GEANT),
            SkillId::GARDE_FORESTIER => Some(GARDE_FORESTIER),
            SkillId::COLOSSE => Some(COLOSSE),

            // Ether WOOD Skills
            SkillId::OXYGENATION_MUSCULAIRE => Some(OXYGENATION_MUSCULAIRE),
            SkillId::VERT => Some(VERT),
            SkillId::SOURCE_DE_VIE => Some(SOURCE_DE_VIE),
            SkillId::VIDE_ENERGETIQUE => Some(VIDE_ENERGETIQUE),
            SkillId::BOUCLIER_DINOZ => Some(BOUCLIER_DINOZ),
            SkillId::ACIDE_LACTIQUE => Some(ACIDE_LACTIQUE),
            SkillId::LANCER_DE_ROCHE => Some(LANCER_DE_ROCHE),
            SkillId::COURBATURES => Some(COURBATURES),
            SkillId::FORCE_CONTROL => Some(FORCE_CONTROL),
            SkillId::PEAU_DE_FER => Some(PEAU_DE_FER),
            SkillId::COURANT_DE_VIE => Some(COURANT_DE_VIE),
            SkillId::BERSERK => Some(BERSERK),
            SkillId::RIVIERE_DE_VIE => Some(RIVIERE_DE_VIE),
            SkillId::MUR_DE_BOUE => Some(MUR_DE_BOUE),
            SkillId::PEAU_DACIER => Some(PEAU_DACIER),
            SkillId::SHARIGNAN => Some(SHARIGNAN),
            SkillId::AMAZONIE => Some(AMAZONIE),
            SkillId::RECEPTACLE_AQUEUX => Some(RECEPTACLE_AQUEUX),

            // Ignored WOOD Skills because they are useless in fights, they are intentionally commented
            // SkillId::COCON => Some(COCON),
            // SkillId::SYMPATIQUE => Some(SYMPATIQUE),
            // SkillId::CHARISME => Some(CHARISME),
            // SkillId::DETECTIVE => Some(DETECTIVE),
            // SkillId::FOUILLE => Some(FOUILLE),
            // SkillId::PLANIFICATEUR => Some(PLANIFICATEUR),
            // SkillId::EXPERT_EN_FOUILLE => Some(EXPERT_EN_FOUILLE),
            // SkillId::ARCHEOLOGUE => Some(ARCHEOLOGUE),
            // SkillId::LEADER => Some(LEADER),
            // SkillId::INGENIEUR => Some(INGENIEUR),
            // SkillId::CHAMPOLLION => Some(CHAMPOLLION),

            // Vanilla WATER Skills
            SkillId::CANON_A_EAU => Some(CANON_A_EAU),
            SkillId::PERCEPTION => Some(PERCEPTION),
            SkillId::MUTATION => Some(MUTATION),
            SkillId::GEL => Some(GEL),
            SkillId::DOUCHE_ECOSSAISE => Some(DOUCHE_ECOSSAISE),
            SkillId::COUP_SOURNOIS => Some(COUP_SOURNOIS),
            SkillId::POCHE_VENTRALE => Some(POCHE_VENTRALE),
            SkillId::KARATE_SOUS_MARIN => Some(KARATE_SOUS_MARIN),
            SkillId::ECAILLES_LUMINESCENTES => Some(ECAILLES_LUMINESCENTES),
            SkillId::ZERO_ABSOLU => Some(ZERO_ABSOLU),
            SkillId::PETRIFICATION => Some(PETRIFICATION),
            SkillId::ACUPUNCTURE => Some(ACUPUNCTURE),
            SkillId::SAPEUR => Some(SAPEUR),
            SkillId::COUP_FATAL => Some(COUP_FATAL),
            SkillId::ENTRAINEMENT_SOUS_MARIN => Some(ENTRAINEMENT_SOUS_MARIN),
            SkillId::MARECAGE => Some(MARECAGE),
            SkillId::SUMO => Some(SUMO),
            SkillId::SANS_PITIE => Some(SANS_PITIE),
            SkillId::CLONE_AQUEUX => Some(CLONE_AQUEUX),
            SkillId::GRIFFES_EMPOISONNEES => Some(GRIFFES_EMPOISONNEES),
            SkillId::PEAU_DE_SERPENT => Some(PEAU_DE_SERPENT),
            SkillId::RAYON_KAAR_SHER => Some(RAYON_KAAR_SHER),
            SkillId::ENTRAINEMENT_SOUS_MARIN_AVANCE => Some(ENTRAINEMENT_SOUS_MARIN_AVANCE),
            SkillId::SANG_ACIDE => Some(SANG_ACIDE),
            SkillId::MAITRE_NAGEUR => Some(MAITRE_NAGEUR),

            // Ether WATER Skills
            SkillId::RADIATIONS_GAMMA => Some(RADIATIONS_GAMMA),
            SkillId::BLEU => Some(BLEU),
            SkillId::MUE_ACQUEUSE => Some(MUE_ACQUEUSE),
            SkillId::CARAPACE_BLINDEE => Some(CARAPACE_BLINDEE),
            SkillId::DIETE_CHROMATIQUE => Some(DIETE_CHROMATIQUE),
            SkillId::CLEPTOMANE => Some(CLEPTOMANE),
            SkillId::ABYSSE => Some(ABYSSE),
            SkillId::BANNI_DES_DIEUX => Some(BANNI_DES_DIEUX),
            SkillId::TOURBILLON_MAGIQUE => Some(TOURBILLON_MAGIQUE),
            SkillId::HYPERVENTILATION => Some(HYPERVENTILATION),
            SkillId::THERAPIE_DE_GROUPE => Some(THERAPIE_DE_GROUPE),
            SkillId::RECEPTACLE_TESLA => Some(RECEPTACLE_TESLA),
            SkillId::VITALITE_MARINE => Some(VITALITE_MARINE),

            // Ignored WATER Skills because they are useless in fights, they are intentionally commented
            // SkillId::APPRENTI_PECHEUR => Some(APPRENTI_PECHEUR),
            // SkillId::PECHEUR_CONFIRME => Some(PECHEUR_CONFIRME),
            // SkillId::MAITRE_PECHEUR => Some(MAITRE_PECHEUR),
            // SkillId::CUISINIER => Some(CUISINIER),
            // SkillId::MAGASINIER => Some(MAGASINIER),
            // SkillId::EAU_DIVINE => Some(EAU_DIVINE),
            // SkillId::EFFLUVE_APHRODISIAQUE => Some(EFFLUVE_APHRODISIAQUE),
            // SkillId::NEMO => Some(NEMO),

            // Vanilla LIGHTNING Skills
            SkillId::FOCUS => Some(FOCUS),
            SkillId::CELERITE => Some(CELERITE),
            SkillId::CONCENTRATION => Some(CONCENTRATION),
            SkillId::ATTAQUE_ECLAIR => Some(ATTAQUE_ECLAIR),
            SkillId::COUP_DOUBLE => Some(COUP_DOUBLE),
            SkillId::PREMIERS_SOINS => Some(PREMIERS_SOINS),
            SkillId::FOUDRE => Some(FOUDRE),
            SkillId::VOIE_DE_KAOS => Some(VOIE_DE_KAOS),
            SkillId::ADRENALINE => Some(ADRENALINE),
            SkillId::VOIE_DE_GAIA => Some(VOIE_DE_GAIA),
            SkillId::MEDECINE => Some(MEDECINE),
            SkillId::DANSE_FOUDROYANTE => Some(DANSE_FOUDROYANTE),
            SkillId::EMBUCHE => Some(EMBUCHE),
            SkillId::PUREE_SALVATRICE => Some(PUREE_SALVATRICE),
            SkillId::AURA_HERMETIQUE => Some(AURA_HERMETIQUE),
            SkillId::CROCS_DIAMANT => Some(CROCS_DIAMANT),
            SkillId::AUBE_FEUILLUE => Some(AUBE_FEUILLUE),
            SkillId::BRANCARDIER => Some(BRANCARDIER),
            SkillId::BENEDICTION => Some(BENEDICTION),
            SkillId::CREPUSCULE_FLAMBOYANT => Some(CREPUSCULE_FLAMBOYANT),
            SkillId::ARCHANGE_CORROSIF => Some(ARCHANGE_CORROSIF),
            SkillId::ARCHANGE_GENESIF => Some(ARCHANGE_GENESIF),

            // Ether LIGHTNING Skills
            SkillId::SOUTIEN_MORAL => Some(SOUTIEN_MORAL),
            SkillId::STIMULATION_CARDIAQUE => Some(STIMULATION_CARDIAQUE),
            SkillId::JAUNE => Some(JAUNE),
            SkillId::MORSURE_DU_SOLEIL => Some(MORSURE_DU_SOLEIL),
            SkillId::CRAMPE_CHRONIQUE => Some(CRAMPE_CHRONIQUE),
            SkillId::BATTERIE_SUPPLEMENTAIRE => Some(BATTERIE_SUPPLEMENTAIRE),
            SkillId::BARRIERE_ELECTRIFIEE => Some(BARRIERE_ELECTRIFIEE),
            SkillId::ORACLE => Some(ORACLE),
            SkillId::RECEPTACLE_AERIEN => Some(RECEPTACLE_AERIEN),
            SkillId::FEU_DE_ST_ELME => Some(FEU_DE_ST_ELME),
            SkillId::FORCE_DE_ZEUS => Some(FORCE_DE_ZEUS),
            SkillId::REMANENCE_HERTZIENNE => Some(REMANENCE_HERTZIENNE),

            // Ignored LIGHTNING Skills because they are useless in fights, they are intentionally commented
            // SkillId::INTELLIGENCE => Some(INTELLIGENCE),
            // SkillId::REGENERESCENCE => Some(REGENERESCENCE),
            // SkillId::PARATONNERRE => Some(PARATONNERRE),
            // SkillId::FISSION_ELEMENTAIRE => Some(FISSION_ELEMENTAIRE),
            // SkillId::PLAN_DE_CARRIERE => Some(PLAN_DE_CARRIERE),
            // SkillId::MARCHAND => Some(MARCHAND),
            // SkillId::REINCARNATION => Some(REINCARNATION),
            // SkillId::PRETRE => Some(PRETRE),
            // SkillId::EINSTEIN => Some(EINSTEIN),

            // Vanilla AIR Skills
            SkillId::AGILITE => Some(AGILITE),
            SkillId::STRATEGIE => Some(STRATEGIE),
            SkillId::MISTRAL => Some(MISTRAL),
            SkillId::ENVOL => Some(ENVOL),
            SkillId::ESQUIVE => Some(ESQUIVE),
            SkillId::SAUT => Some(SAUT),
            SkillId::ANALYSE => Some(ANALYSE),
            SkillId::TAICHI => Some(TAICHI),
            SkillId::TORNADE => Some(TORNADE),
            SkillId::DISQUE_VACUUM => Some(DISQUE_VACUUM),
            SkillId::ELASTICITE => Some(ELASTICITE),
            SkillId::ATTAQUE_PLONGEANTE => Some(ATTAQUE_PLONGEANTE),
            SkillId::FURTIVITE => Some(FURTIVITE),
            SkillId::SPECIALISTE => Some(SPECIALISTE),
            SkillId::TALON_DACHILLE => Some(TALON_DACHILLE),
            SkillId::NUAGE_TOXIQUE => Some(NUAGE_TOXIQUE),
            SkillId::EVEIL => Some(EVEIL),
            SkillId::PAUME_EJECTABLE => Some(PAUME_EJECTABLE),
            SkillId::VENT_VIF => Some(VENT_VIF),
            SkillId::FORME_VAPOREUSE => Some(FORME_VAPOREUSE),
            SkillId::TROU_NOIR => Some(TROU_NOIR),
            SkillId::MAITRE_LEVITATEUR => Some(MAITRE_LEVITATEUR),
            SkillId::HALEINE_FETIVE => Some(HALEINE_FETIVE),
            SkillId::MEDITATION_SOLITAIRE => Some(MEDITATION_SOLITAIRE),
            SkillId::SOUFFLE_DE_VIE => Some(SOUFFLE_DE_VIE),
            SkillId::MEDITATION_TRANCHANTE => Some(MEDITATION_TRANCHANTE),
            SkillId::FORME_ETHERALE => Some(FORME_ETHERALE),

            // Ether AIR Skills
            SkillId::MAITRISE_CORPORELLE => Some(MAITRISE_CORPORELLE),
            SkillId::BLANC => Some(BLANC),
            SkillId::ANAEROBIE => Some(ANAEROBIE),
            SkillId::DOUBLE_FACE => Some(DOUBLE_FACE),
            SkillId::FLAGELLATION => Some(FLAGELLATION),
            SkillId::SOUFFLE_DANGE => Some(SOUFFLE_DANGE),
            SkillId::OURAGAN => Some(OURAGAN),
            SkillId::OURANOS => Some(OURANOS),
            SkillId::TWINOID_500MG => Some(TWINOID_500MG),
            SkillId::SURPLIS_DHADES => Some(SURPLIS_DHADES),
            SkillId::RECEPTABLE_THERMIQUE => Some(RECEPTABLE_THERMIQUE),
            SkillId::QI_GONG => Some(QI_GONG),
            SkillId::SYLPHIDES => Some(SYLPHIDES),
            SkillId::MUTINERIE => Some(MUTINERIE),
            SkillId::MAINS_COLLANTES => Some(MAINS_COLLANTES),

            // Ignored AIR Skills because they are useless in fights, they are intentionally commented
            // SkillId::CUEILLETTE => Some(CUEILLETTE),
            // SkillId::OEIL_DE_LYNX => Some(OEIL_DE_LYNX),
            // SkillId::PROFESSEUR => Some(PROFESSEUR),
            // SkillId::LONDUHAUT => Some(LONDUHAUT),
            // SkillId::MESSIE => Some(MESSIE),

            // VOID Skills

            // Race Skills
            SkillId::PIETINEMENT => Some(PIETINEMENT),
            SkillId::ROCK => Some(ROCK),
            SkillId::CHARGE_CORNUE => Some(CHARGE_CORNUE),
            SkillId::INSAISISSABLE => Some(INSAISISSABLE),
            SkillId::COQUE => Some(COQUE),
            SkillId::CUIRASSE => Some(CUIRASSE),
            SkillId::ECRASEMENT => Some(ECRASEMENT),
            SkillId::DEPLACEMENT_INSTANTANE => Some(DEPLACEMENT_INSTANTANE),
            SkillId::NAPOMAGICIEN => Some(NAPOMAGICIEN),
            SkillId::BIGMAGNON => Some(BIGMAGNON),

            // Race (Demon) Skills
            SkillId::DUR_A_CUIRE => Some(DUR_A_CUIRE),
            SkillId::GROS_COSTAUD => Some(GROS_COSTAUD),
            SkillId::CHARGE_PIGMOU => Some(CHARGE_PIGMOU),
            SkillId::FRENESIE_COLLECTIVE => Some(FRENESIE_COLLECTIVE),
            SkillId::FORCE_DE_LUMIERE => Some(FORCE_DE_LUMIERE),
            SkillId::ORIGINE_CAUSHEMESHENNE => Some(ORIGINE_CAUSHEMESHENNE),
            SkillId::FORCE_DES_TENEBRES => Some(FORCE_DES_TENEBRES),

            // Sphere Skills
            // Sphere FIRE Skills
            SkillId::BRASERO => Some(BRASERO),
            SkillId::DETONATION => Some(DETONATION),

            // Sphere WOOD Skills
            SkillId::LANCEUR_DE_GLAND => Some(LANCEUR_DE_GLAND),
            SkillId::GROSSE_BEIGNE => Some(GROSSE_BEIGNE),

            // Sphere WATER Skills
            SkillId::VITALITE => Some(VITALITE),
            SkillId::MOIGNONS_LIQUIDES => Some(MOIGNONS_LIQUIDES),
            SkillId::DELUGE => Some(DELUGE),

            // Sphere LIGHTNING Skills
            SkillId::REFLEX => Some(REFLEX),
            SkillId::ECLAIR_SINUEUX => Some(ECLAIR_SINUEUX),
            SkillId::SURVIE => Some(SURVIE),

            // Sphere AIR Skills
            SkillId::AIGUILLON => Some(AIGUILLON),
            SkillId::AURA_PUANTE => Some(AURA_PUANTE),
            SkillId::HYPNOSE => Some(HYPNOSE),

            // Double Skills
            SkillId::ARMURE_DE_BASALTE => Some(ARMURE_DE_BASALTE),
            SkillId::MAITRE_ELEMENTAIRE => Some(MAITRE_ELEMENTAIRE),
            SkillId::SPRINT => Some(SPRINT),
            SkillId::VENDETTA => Some(VENDETTA),
            SkillId::INCREVABLE => Some(INCREVABLE),
            SkillId::CHOC => Some(CHOC),
            SkillId::SECOUSSE => Some(SECOUSSE),
            SkillId::ELECTROLYSE => Some(ELECTROLYSE),
            SkillId::BULLE => Some(BULLE),
            SkillId::SURCHARGE => Some(SURCHARGE),

            // Invocation Skills
            SkillId::SALAMANDRE => Some(SALAMANDRE),
            SkillId::VULCAIN => Some(VULCAIN),
            SkillId::ARMURE_DIFRIT => Some(ARMURE_DIFRIT),
            SkillId::BALEINE_BLANCHE => Some(BALEINE_BLANCHE),
            SkillId::LEVIATHAN => Some(LEVIATHAN),
            SkillId::ONDINE => Some(ONDINE),
            SkillId::LOUP_GAROU => Some(LOUP_GAROU),
            SkillId::BENEDICTION_DES_FEES => Some(BENEDICTION_DES_FEES),
            SkillId::YGGDRASIL => Some(YGGDRASIL),
            SkillId::BIG_MAMA => Some(BIG_MAMA),
            SkillId::RAIJIN => Some(RAIJIN),
            SkillId::GOLEM => Some(GOLEM),
            SkillId::ROI_DES_SINGES => Some(ROI_DES_SINGES),
            SkillId::DJINN => Some(DJINN),
            SkillId::FUJIN => Some(FUJIN),
            SkillId::TOTEM_ANCESTRAL_AEROPORTE => Some(TOTEM_ANCESTRAL_AEROPORTE),
            SkillId::BOUDDHA => Some(BOUDDHA),
            SkillId::HADES => Some(HADES),
            SkillId::REINE_DE_LA_RUCHE => Some(REINE_DE_LA_RUCHE),
            SkillId::HERCOLUBUS => Some(HERCOLUBUS),
            SkillId::QUETZACOATL => Some(QUETZACOATL),

            // Other ignored Skills because they are useless in fights, they are intentionally commented
            // SkillId::COEUR_DE_PHOENIX => Some(COEUR_DE_PHOENIX),
            // SkillId::GRATTEUR => Some(GRATTEUR),
            // SkillId::COMPETENCE_DOUBLE => Some(COMPETENCE_DOUBLE),
            // SkillId::LIMITE_BRISEE => Some(LIMITE_BRISEE),
            // SkillId::INVOCATEUR => Some(INVOCATEUR),

            // All those skills are the skills that have no effects in a fight. They are intentionally commented above in the match
            // and then they are regrouped here to be matched with `None` instead of being handled the same way as an unknown skill
            SkillId::CHASSEUR_DE_GOUPIGNON
            | SkillId::CHASSEUR_DE_GEANT
            | SkillId::CHASSEUR_DE_DRAGON
            | SkillId::BENEDICTION_DARTEMIS
            | SkillId::COCON
            | SkillId::SYMPATIQUE
            | SkillId::CHARISME
            | SkillId::DETECTIVE
            | SkillId::FOUILLE
            | SkillId::PLANIFICATEUR
            | SkillId::EXPERT_EN_FOUILLE
            | SkillId::ARCHEOLOGUE
            | SkillId::LEADER
            | SkillId::INGENIEUR
            | SkillId::CHAMPOLLION
            | SkillId::APPRENTI_PECHEUR
            | SkillId::PECHEUR_CONFIRME
            | SkillId::MAITRE_PECHEUR
            | SkillId::CUISINIER
            | SkillId::MAGASINIER
            | SkillId::EAU_DIVINE
            | SkillId::EFFLUVE_APHRODISIAQUE
            | SkillId::NEMO
            | SkillId::INTELLIGENCE
            | SkillId::REGENERESCENCE
            | SkillId::PARATONNERRE
            | SkillId::FISSION_ELEMENTAIRE
            | SkillId::PLAN_DE_CARRIERE
            | SkillId::MARCHAND
            | SkillId::REINCARNATION
            | SkillId::PRETRE
            | SkillId::EINSTEIN
            | SkillId::CUEILLETTE
            | SkillId::OEIL_DE_LYNX
            | SkillId::PROFESSEUR
            | SkillId::LONDUHAUT
            | SkillId::MESSIE
            | SkillId::COEUR_DE_PHOENIX
            | SkillId::GRATTEUR
            | SkillId::COMPETENCE_DOUBLE
            | SkillId::LIMITE_BRISEE
            | SkillId::INVOCATEUR => {
                trace!("This skill ({}) is intentionally not implemented because it has no effects in fights", self);
                None
            }
            _ => {
                error!("Unknown skill {}, report this to a developer", self);
                None
            }
        }
    }
}
