import { ItinerantShopFiche } from "./ItinerantShopFiche.mjs";
import { ingredientList } from "../ingredient/ingredientList.mjs";
import { ConditionEnum } from "../enums/Parser.mjs";
import { PlaceEnum } from "../enums/PlaceEnum.mjs";

export const itinerantShopList: Readonly<Record<string, ItinerantShopFiche>> = {
    // ITINERANT MERCHANT ---- MONDAY
    ITINERANT_MERCHANT_MONDAY: {
        itinerantId: 1,
        placeId: PlaceEnum.FORGES_DU_GTC,
        listIngredients: [
            {
                ingredientId: ingredientList.ENERGIE_FOUDRE.ingredientId,
                price: 300
            },
            {
                ingredientId: ingredientList.ENERGIE_AIR.ingredientId,
                price: 1000
            },
            {
                ingredientId: ingredientList.ENERGIE_EAU.ingredientId,
                price: 4000
            },
            {
                ingredientId: ingredientList.ENERGIE_FEU.ingredientId,
                price: 4000
            },
            {
                ingredientId: ingredientList.ENERGIE_BOIS.ingredientId,
                price: 300
            }
        ]
    },
    // ITINERANT MERCHANT ---- TUESDAY
    ITINERANT_MERCHANT_TUESDAY: {
        itinerantId: 2,
        placeId: PlaceEnum.FORGES_DU_GTC,
        listIngredients: [
            {
                ingredientId: ingredientList.FEUILLES_DE_PELINAE.ingredientId,
                price: 75
            },
            {
                ingredientId: ingredientList.BOLET_PHALISK_BLANC.ingredientId,
                price: 130
            },
            {
                ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
                price: 230
            },
            {
                ingredientId: ingredientList.RACINE_DE_FIGONICIA.ingredientId,
                price: 230
            },
            {
                ingredientId: ingredientList.SADIQUAE_MORDICUS.ingredientId,
                price: 230
            },
            {
                ingredientId: ingredientList.FLAUREOLE.ingredientId,
                price: 500
            },
            {
                ingredientId: ingredientList.SPORE_ETHERAL.ingredientId,
                price: 150
            },
            {
                ingredientId: ingredientList.POUSSE_SOMBRE.ingredientId,
                price: 300
            }
        ]
    },
    // ITINERANT MERCHANT ---- WEDNESDAY
    ITINERANT_MERCHANT_WEDNESDAY: {
        itinerantId: 3,
        placeId: PlaceEnum.FORGES_DU_GTC,
        listIngredients: [
            {
                ingredientId: ingredientList.SILEX_TAILLE.ingredientId,
                price: 150
            },
            {
                ingredientId: ingredientList.FRAGMENT_DE_TEXTE_ANCIEN.ingredientId,
                price: 1000
            },
            {
                ingredientId: ingredientList.VIEIL_ANNEAU_PRECIEUX.ingredientId,
                price: 8000
            },
            {
                ingredientId: ingredientList.CALICE_CISELE.ingredientId,
                price: 8000
            },
            {
                ingredientId: ingredientList.COLLIER_KARAT.ingredientId,
                price: 8000
            },
            {
                ingredientId: ingredientList.BROCHE_EN_PARFAIT_ETAT.ingredientId,
                price: 30000
            },
            {
                ingredientId: ingredientList.SUPERBE_COURONNE_ROYALE.ingredientId,
                price: 40000
            },
            {
                ingredientId: ingredientList.BRAS_MECANIQUE.ingredientId,
                price: 23000
            }
        ]
    },
    // ITINERANT MERCHANT ---- THURSDAY
    ITINERANT_MERCHANT_THURSDAY: {
        itinerantId: 4,
        placeId: PlaceEnum.FORGES_DU_GTC,
        listIngredients: [
            {
                ingredientId: ingredientList.TOUFFE_DE_FOURRURE.ingredientId,
                price: 350
            },
            {
                ingredientId: ingredientList.ROCHE_RADIO_ACTIVE.ingredientId,
                price: 500
            },
            {
                ingredientId: ingredientList.GRIFFES_ACEREES.ingredientId,
                price: 750
            },
            {
                ingredientId: ingredientList.CORNE_EN_CHOCOLAT.ingredientId,
                price: 1000
            },
            {
                ingredientId: ingredientList.OEIL_VISQUEUX.ingredientId,
                price: 1300
            },
            {
                ingredientId: ingredientList.LANGUE_MONSTRUEUSE.ingredientId,
                price: 10000
            },
            {
                ingredientId: ingredientList.DENT_DE_DOROGON.ingredientId,
                price: 12000
            }
        ]
    },
    // ITINERANT MERCHANT ---- FRIDAY
    ITINERANT_MERCHANT_FRIDAY: {
        itinerantId: 5,
        placeId: PlaceEnum.FORGES_DU_GTC,
        listIngredients: [
            {
                ingredientId: ingredientList.MEROU_LUJIDANE.ingredientId,
                price: 100
            },
            {
                ingredientId: ingredientList.POISSON_VENGEUR.ingredientId,
                price: 300
            },
            {
                ingredientId: ingredientList.AN_GUILI_GUILILLE.ingredientId,
                price: 1500
            },
            {
                ingredientId: ingredientList.GLOBULOS.ingredientId,
                price: 1500
            },
            {
                ingredientId: ingredientList.SUPER_POISSON.ingredientId,
                price: 1500
            }
        ]
    },
    // ITINERANT MERCHANT ---- SATURDAY
    ITINERANT_MERCHANT_SATURDAY: {
        itinerantId: 6,
        placeId: PlaceEnum.FORGES_DU_GTC,
        listIngredients: [
            {
                ingredientId: ingredientList.MEROU_LUJIDANE.ingredientId,
                price: 100
            },
            {
                ingredientId: ingredientList.POISSON_VENGEUR.ingredientId,
                price: 300
            },
            {
                ingredientId: ingredientList.AN_GUILI_GUILILLE.ingredientId,
                price: 1500
            },
            {
                ingredientId: ingredientList.GLOBULOS.ingredientId,
                price: 1500
            },
            {
                ingredientId: ingredientList.SUPER_POISSON.ingredientId,
                price: 1500
            },
            {
                ingredientId: ingredientList.TOUFFE_DE_FOURRURE.ingredientId,
                price: 350
            },
            {
                ingredientId: ingredientList.ROCHE_RADIO_ACTIVE.ingredientId,
                price: 500
            },
            {
                ingredientId: ingredientList.GRIFFES_ACEREES.ingredientId,
                price: 750
            },
            {
                ingredientId: ingredientList.CORNE_EN_CHOCOLAT.ingredientId,
                price: 1000
            },
            {
                ingredientId: ingredientList.OEIL_VISQUEUX.ingredientId,
                price: 1300
            },
            {
                ingredientId: ingredientList.LANGUE_MONSTRUEUSE.ingredientId,
                price: 10000
            },
            {
                ingredientId: ingredientList.DENT_DE_DOROGON.ingredientId,
                price: 12000
            },
            {
                ingredientId: ingredientList.ENERGIE_FOUDRE.ingredientId,
                price: 300
            },
            {
                ingredientId: ingredientList.ENERGIE_AIR.ingredientId,
                price: 1000
            },
            {
                ingredientId: ingredientList.ENERGIE_EAU.ingredientId,
                price: 4000
            },
            {
                ingredientId: ingredientList.ENERGIE_FEU.ingredientId,
                price: 4000
            },
            {
                ingredientId: ingredientList.ENERGIE_BOIS.ingredientId,
                price: 300
            },
            {
                ingredientId: ingredientList.SILEX_TAILLE.ingredientId,
                price: 150
            },
            {
                ingredientId: ingredientList.FRAGMENT_DE_TEXTE_ANCIEN.ingredientId,
                price: 1000
            },
            {
                ingredientId: ingredientList.VIEIL_ANNEAU_PRECIEUX.ingredientId,
                price: 8000
            },
            {
                ingredientId: ingredientList.CALICE_CISELE.ingredientId,
                price: 8000
            },
            {
                ingredientId: ingredientList.COLLIER_KARAT.ingredientId,
                price: 8000
            },
            {
                ingredientId: ingredientList.BROCHE_EN_PARFAIT_ETAT.ingredientId,
                price: 30000
            },
            {
                ingredientId: ingredientList.SUPERBE_COURONNE_ROYALE.ingredientId,
                price: 40000
            },
            {
                ingredientId: ingredientList.BRAS_MECANIQUE.ingredientId,
                price: 23000
            },
            {
                ingredientId: ingredientList.FEUILLES_DE_PELINAE.ingredientId,
                price: 75
            },
            {
                ingredientId: ingredientList.BOLET_PHALISK_BLANC.ingredientId,
                price: 130
            },
            {
                ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
                price: 230
            },
            {
                ingredientId: ingredientList.RACINE_DE_FIGONICIA.ingredientId,
                price: 230
            },
            {
                ingredientId: ingredientList.SADIQUAE_MORDICUS.ingredientId,
                price: 230
            },
            {
                ingredientId: ingredientList.FLAUREOLE.ingredientId,
                price: 500
            },
            {
                ingredientId: ingredientList.SPORE_ETHERAL.ingredientId,
                price: 150
            },
            {
                ingredientId: ingredientList.POUSSE_SOMBRE.ingredientId,
                price: 300
            },
            {
                ingredientId: ingredientList.GRAINE_DE_DEVOREUSE.ingredientId,
                price: 15000
            }
        ]
    },
    // ITINERANT MERCHANT ---- SUNDAY ---- SHOP CLOSED
    ITINERANT_MERCHANT_SUNDAY: {
        itinerantId: 7,
        placeId: PlaceEnum.FORGES_DU_GTC,
        listIngredients: []
    } 
}