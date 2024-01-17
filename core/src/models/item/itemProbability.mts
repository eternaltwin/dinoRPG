import { BoxOpening, boxType } from './boxOpening.mjs';
import { itemList } from './ItemList.mjs';

export const itemProbability: BoxOpening[] = [
	{
		boxType: boxType.COMMON,
		items: [
			{
				item: itemList.FEROSS_EGG,
				probability: 1
			},
			{
				item: itemList.MOUEFFE_EGG,
				probability: 2
			},
			{
				item: itemList.PIGMOU_EGG,
				probability: 2
			},
			{
				item: itemList.WINKS_EGG,
				probability: 2
			},
			{
				item: itemList.PLANAILLE_EGG,
				probability: 2
			},
			{
				item: itemList.CASTIVORE_EGG,
				probability: 2
			},
			{
				item: itemList.NUAGOZ_EGG,
				probability: 2
			},
			{
				item: itemList.SIRAIN_EGG,
				probability: 2
			},
			{
				item: itemList.GORILLOZ_EGG,
				probability: 2
			},
			{
				item: itemList.WANWAN_EGG,
				probability: 2
			},
			{
				item: itemList.FIRE_SPHERE,
				probability: 1
			},
			{
				item: itemList.WOOD_SPHERE,
				probability: 1
			},
			{
				item: itemList.WATER_SPHERE,
				probability: 1
			},
			{
				item: itemList.LIGHTNING_SPHERE,
				probability: 1
			},
			{
				item: itemList.AIR_SPHERE,
				probability: 1
			},
			{
				item: itemList.AMNESIC_RICE,
				probability: 25 //49
			},
			{
				item: itemList.MONOCHROMATIC,
				probability: 11 //60
			},
			{
				item: itemList.FUCA_PILL,
				probability: 5 //65
			},
			{
				item: itemList.HOT_BREAD,
				probability: 10 //75
			},
			{
				item: itemList.ELIXIR,
				probability: 10 //85
			},
			{
				item: itemList.BOX_RARE,
				probability: 5 //90
			},
			{
				item: itemList.BOX_EPIC,
				probability: 2 //92
			},
			{
				item: itemList.DAILY_TICKET,
				probability: 2 //94
			},
			{
				item: itemList.VOID_SPHERE,
				probability: 3 //97
			},
			{
				item: itemList.TIK_BRACELET,
				probability: 3 //100
			}
		]
	},
	{
		boxType: boxType.RARE,
		items: [
			{
				item: itemList.FEROSS_EGG,
				probability: 2
			},
			{
				item: itemList.MOUEFFE_EGG,
				probability: 1
			},
			{
				item: itemList.PIGMOU_EGG,
				probability: 1
			},
			{
				item: itemList.WINKS_EGG,
				probability: 1
			},
			{
				item: itemList.PLANAILLE_EGG,
				probability: 1
			},
			{
				item: itemList.CASTIVORE_EGG,
				probability: 1
			},
			{
				item: itemList.NUAGOZ_EGG,
				probability: 1
			},
			{
				item: itemList.SIRAIN_EGG,
				probability: 1
			},
			{
				item: itemList.GORILLOZ_EGG,
				probability: 1
			},
			{
				item: itemList.WANWAN_EGG,
				probability: 1
			},
			{
				item: itemList.MOUEFFE_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.WINKS_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.WANWAN_BABY_RARE,
				probability: 1
			},
			{
				item: itemList.ROCKY_EGG,
				probability: 2
			},
			{
				item: itemList.PTEROZ_EGG,
				probability: 2
			},
			{
				item: itemList.HIPPOCLAMP_EGG,
				probability: 2 //20
			},
			{
				item: itemList.FIRE_SPHERE,
				probability: 2
			},
			{
				item: itemList.WOOD_SPHERE,
				probability: 2
			},
			{
				item: itemList.WATER_SPHERE,
				probability: 2
			},
			{
				item: itemList.LIGHTNING_SPHERE,
				probability: 2
			},
			{
				item: itemList.AIR_SPHERE,
				probability: 2 //30
			},
			{
				item: itemList.AMNESIC_RICE,
				probability: 20 //50
			},
			{
				item: itemList.MONOCHROMATIC,
				probability: 15 //65
			},
			{
				item: itemList.FUCA_PILL,
				probability: 5 //70
			},
			{
				item: itemList.ELIXIR,
				probability: 12 //82
			},
			{
				item: itemList.BOX_LEGENDARY,
				probability: 1 //83
			},
			{
				item: itemList.BOX_EPIC,
				probability: 2 //85
			},
			{
				item: itemList.DAILY_TICKET,
				probability: 3 //88
			},
			{
				item: itemList.VOID_SPHERE,
				probability: 6 //94
			},
			{
				item: itemList.TIK_BRACELET,
				probability: 6 //100
			}
		]
	},
	{
		boxType: boxType.EPIC,
		items: [
			{
				item: itemList.FEROSS_EGG,
				probability: 1
			},
			{
				item: itemList.FEROSS_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.MOUEFFE_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.PIGMOU_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.WINKS_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.PLANAILLE_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.CASTIVORE_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.NUAGOZ_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.SANTAZ_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.GORILLOZ_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.WANWAN_BABY_RARE,
				probability: 1
			},
			{
				item: itemList.ROCKY_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.PTEROZ_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.HIPPOCLAMP_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.SANTAZ_EGG,
				probability: 1
			},
			{
				item: itemList.KABUKI_EGG,
				probability: 1
			},
			{
				item: itemList.MAHAMUTI_EGG,
				probability: 1
			},
			{
				item: itemList.SOUFFLET_EGG,
				probability: 1
			},
			{
				item: itemList.TOUFUFU_BABY,
				probability: 1
			},
			{
				item: itemList.QUETZU_EGG,
				probability: 1 //20
			},
			{
				item: itemList.FIRE_SPHERE,
				probability: 3
			},
			{
				item: itemList.WOOD_SPHERE,
				probability: 3
			},
			{
				item: itemList.WATER_SPHERE,
				probability: 3
			},
			{
				item: itemList.LIGHTNING_SPHERE,
				probability: 3
			},
			{
				item: itemList.AIR_SPHERE,
				probability: 3 //30
			},
			{
				item: itemList.AMNESIC_RICE,
				probability: 15 //45
			},
			{
				item: itemList.MONOCHROMATIC,
				probability: 10 //55
			},
			{
				item: itemList.ELIXIR,
				probability: 5 //60
			},
			{
				item: itemList.BOX_LEGENDARY,
				probability: 3 //63
			},
			{
				item: itemList.BOX_EPIC,
				probability: 2 //65
			},
			{
				item: itemList.VOID_SPHERE,
				probability: 15 //80
			},
			{
				item: itemList.TIK_BRACELET,
				probability: 10 //90
			},
			{
				item: itemList.GOLDEN_NAPODINO,
				probability: 10 //100
			}
		]
	},
	{
		boxType: boxType.LEGENDARY,
		items: [
			{
				item: itemList.FEROSS_EGG,
				probability: 2
			},
			{
				item: itemList.FEROSS_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.MOUEFFE_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.PIGMOU_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.WINKS_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.PLANAILLE_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.CASTIVORE_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.NUAGOZ_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.SANTAZ_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.GORILLOZ_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.WANWAN_BABY_RARE,
				probability: 1
			},
			{
				item: itemList.ROCKY_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.PTEROZ_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.HIPPOCLAMP_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.SANTAZ_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.SANTAZ_EGG,
				probability: 1
			},
			{
				item: itemList.RARE_KABUKI_EGG,
				probability: 1
			},
			{
				item: itemList.KABUKI_EGG,
				probability: 1
			},
			{
				item: itemList.RARE_MAHAMUTI_EGG,
				probability: 1
			},
			{
				item: itemList.MAHAMUTI_EGG,
				probability: 1
			},
			{
				item: itemList.SOUFFLET_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.SOUFFLET_EGG,
				probability: 1
			},
			{
				item: itemList.TOUFUFU_BABY_RARE,
				probability: 1
			},
			{
				item: itemList.TOUFUFU_BABY,
				probability: 1
			},
			{
				item: itemList.QUETZU_EGG,
				probability: 1
			},
			{
				item: itemList.QUETZU_EGG_RARE,
				probability: 1
			},
			{
				item: itemList.SMOG_EGG,
				probability: 2
			},
			{
				item: itemList.SMOG_EGG_CHRISTMAS_BLUE,
				probability: 1
			},
			{
				item: itemList.TRICERAGNON_BABY,
				probability: 2
			},
			{
				item: itemList.TRICERAGNON_EGG_BABY,
				probability: 1 //33
			},
			{
				item: itemList.FIRE_SPHERE,
				probability: 5
			},
			{
				item: itemList.WOOD_SPHERE,
				probability: 5
			},
			{
				item: itemList.WATER_SPHERE,
				probability: 5
			},
			{
				item: itemList.LIGHTNING_SPHERE,
				probability: 5
			},
			{
				item: itemList.AIR_SPHERE,
				probability: 5 //58
			},
			{
				item: itemList.BOX_LEGENDARY,
				probability: 2 //60
			},
			{
				item: itemList.VOID_SPHERE,
				probability: 15 //75
			},
			{
				item: itemList.TIK_BRACELET,
				probability: 15 //90
			},
			{
				item: itemList.GOLDEN_NAPODINO,
				probability: 10 //100
			}
		]
	}
];
