import { BoxOpening, boxType } from './boxOpening.mjs';
import { Item, itemList } from './ItemList.mjs';

export const itemProbability: BoxOpening[] = [
	{
		boxType: boxType.COMMON,
		items: [
			{
				item: itemList[Item.FEROSS_EGG],
				probability: 1
			},
			{
				item: itemList[Item.MOUEFFE_EGG],
				probability: 2
			},
			{
				item: itemList[Item.PIGMOU_EGG],
				probability: 2
			},
			{
				item: itemList[Item.WINKS_EGG],
				probability: 2
			},
			{
				item: itemList[Item.PLANAILLE_EGG],
				probability: 2
			},
			{
				item: itemList[Item.CASTIVORE_EGG],
				probability: 2
			},
			{
				item: itemList[Item.NUAGOZ_EGG],
				probability: 2
			},
			{
				item: itemList[Item.SIRAIN_EGG],
				probability: 2
			},
			{
				item: itemList[Item.GORILLOZ_EGG],
				probability: 2
			},
			{
				item: itemList[Item.WANWAN_EGG],
				probability: 2
			},
			{
				item: itemList[Item.FIRE_SPHERE],
				probability: 1
			},
			{
				item: itemList[Item.WOOD_SPHERE],
				probability: 1
			},
			{
				item: itemList[Item.WATER_SPHERE],
				probability: 1
			},
			{
				item: itemList[Item.LIGHTNING_SPHERE],
				probability: 1
			},
			{
				item: itemList[Item.AIR_SPHERE],
				probability: 1
			},
			{
				item: itemList[Item.AMNESIC_RICE],
				probability: 25 //49
			},
			{
				item: itemList[Item.MONOCHROMATIC],
				probability: 11 //60
			},
			{
				item: itemList[Item.FUCA_PILL],
				probability: 5 //65
			},
			{
				item: itemList[Item.HOT_BREAD],
				probability: 10 //75
			},
			{
				item: itemList[Item.ELIXIR],
				probability: 10 //85
			},
			{
				item: itemList[Item.BOX_RARE],
				probability: 5 //90
			},
			{
				item: itemList[Item.BOX_EPIC],
				probability: 2 //92
			},
			{
				item: itemList[Item.DAILY_TICKET],
				probability: 2 //94
			},
			{
				item: itemList[Item.VOID_SPHERE],
				probability: 3 //97
			},
			{
				item: itemList[Item.TIK_BRACELET],
				probability: 3 //100
			}
		]
	},
	{
		boxType: boxType.RARE,
		items: [
			{
				item: itemList[Item.FEROSS_EGG],
				probability: 2
			},
			{
				item: itemList[Item.MOUEFFE_EGG],
				probability: 1
			},
			{
				item: itemList[Item.PIGMOU_EGG],
				probability: 1
			},
			{
				item: itemList[Item.WINKS_EGG],
				probability: 1
			},
			{
				item: itemList[Item.PLANAILLE_EGG],
				probability: 1
			},
			{
				item: itemList[Item.CASTIVORE_EGG],
				probability: 1
			},
			{
				item: itemList[Item.NUAGOZ_EGG],
				probability: 1
			},
			{
				item: itemList[Item.SIRAIN_EGG],
				probability: 1
			},
			{
				item: itemList[Item.GORILLOZ_EGG],
				probability: 1
			},
			{
				item: itemList[Item.WANWAN_EGG],
				probability: 1
			},
			{
				item: itemList[Item.MOUEFFE_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.WINKS_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.WANWAN_BABY_RARE],
				probability: 1
			},
			{
				item: itemList[Item.ROCKY_EGG],
				probability: 2
			},
			{
				item: itemList[Item.PTEROZ_EGG],
				probability: 2
			},
			{
				item: itemList[Item.HIPPOCLAMP_EGG],
				probability: 2 //20
			},
			{
				item: itemList[Item.FIRE_SPHERE],
				probability: 2
			},
			{
				item: itemList[Item.WOOD_SPHERE],
				probability: 2
			},
			{
				item: itemList[Item.WATER_SPHERE],
				probability: 2
			},
			{
				item: itemList[Item.LIGHTNING_SPHERE],
				probability: 2
			},
			{
				item: itemList[Item.AIR_SPHERE],
				probability: 2 //30
			},
			{
				item: itemList[Item.AMNESIC_RICE],
				probability: 20 //50
			},
			{
				item: itemList[Item.MONOCHROMATIC],
				probability: 15 //65
			},
			{
				item: itemList[Item.FUCA_PILL],
				probability: 5 //70
			},
			{
				item: itemList[Item.ELIXIR],
				probability: 12 //82
			},
			{
				item: itemList[Item.BOX_LEGENDARY],
				probability: 1 //83
			},
			{
				item: itemList[Item.BOX_EPIC],
				probability: 2 //85
			},
			{
				item: itemList[Item.DAILY_TICKET],
				probability: 3 //88
			},
			{
				item: itemList[Item.VOID_SPHERE],
				probability: 6 //94
			},
			{
				item: itemList[Item.TIK_BRACELET],
				probability: 6 //100
			}
		]
	},
	{
		boxType: boxType.EPIC,
		items: [
			{
				item: itemList[Item.FEROSS_EGG],
				probability: 1
			},
			{
				item: itemList[Item.FEROSS_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.MOUEFFE_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.PIGMOU_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.WINKS_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.PLANAILLE_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.CASTIVORE_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.NUAGOZ_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.SANTAZ_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.GORILLOZ_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.WANWAN_BABY_RARE],
				probability: 1
			},
			{
				item: itemList[Item.ROCKY_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.PTEROZ_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.HIPPOCLAMP_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.SANTAZ_EGG],
				probability: 1
			},
			{
				item: itemList[Item.KABUKI_EGG],
				probability: 1
			},
			{
				item: itemList[Item.MAHAMUTI_EGG],
				probability: 1
			},
			{
				item: itemList[Item.SOUFFLET_EGG],
				probability: 1
			},
			{
				item: itemList[Item.TOUFUFU_BABY],
				probability: 1
			},
			{
				item: itemList[Item.QUETZU_EGG],
				probability: 1 //20
			},
			{
				item: itemList[Item.FIRE_SPHERE],
				probability: 3
			},
			{
				item: itemList[Item.WOOD_SPHERE],
				probability: 3
			},
			{
				item: itemList[Item.WATER_SPHERE],
				probability: 3
			},
			{
				item: itemList[Item.LIGHTNING_SPHERE],
				probability: 3
			},
			{
				item: itemList[Item.AIR_SPHERE],
				probability: 3 //30
			},
			{
				item: itemList[Item.AMNESIC_RICE],
				probability: 15 //45
			},
			{
				item: itemList[Item.MONOCHROMATIC],
				probability: 10 //55
			},
			{
				item: itemList[Item.ELIXIR],
				probability: 5 //60
			},
			{
				item: itemList[Item.BOX_LEGENDARY],
				probability: 3 //63
			},
			{
				item: itemList[Item.BOX_EPIC],
				probability: 2 //65
			},
			{
				item: itemList[Item.VOID_SPHERE],
				probability: 15 //80
			},
			{
				item: itemList[Item.TIK_BRACELET],
				probability: 10 //90
			},
			{
				item: itemList[Item.GOLDEN_NAPODINO],
				probability: 10 //100
			}
		]
	},
	{
		boxType: boxType.LEGENDARY,
		items: [
			{
				item: itemList[Item.FEROSS_EGG],
				probability: 2
			},
			{
				item: itemList[Item.FEROSS_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.MOUEFFE_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.PIGMOU_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.WINKS_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.PLANAILLE_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.CASTIVORE_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.NUAGOZ_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.SANTAZ_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.GORILLOZ_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.WANWAN_BABY_RARE],
				probability: 1
			},
			{
				item: itemList[Item.ROCKY_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.PTEROZ_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.HIPPOCLAMP_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.SANTAZ_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.SANTAZ_EGG],
				probability: 1
			},
			{
				item: itemList[Item.RARE_KABUKI_EGG],
				probability: 1
			},
			{
				item: itemList[Item.KABUKI_EGG],
				probability: 1
			},
			{
				item: itemList[Item.RARE_MAHAMUTI_EGG],
				probability: 1
			},
			{
				item: itemList[Item.MAHAMUTI_EGG],
				probability: 1
			},
			{
				item: itemList[Item.SOUFFLET_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.SOUFFLET_EGG],
				probability: 1
			},
			{
				item: itemList[Item.TOUFUFU_BABY_RARE],
				probability: 1
			},
			{
				item: itemList[Item.TOUFUFU_BABY],
				probability: 1
			},
			{
				item: itemList[Item.QUETZU_EGG],
				probability: 1
			},
			{
				item: itemList[Item.QUETZU_EGG_RARE],
				probability: 1
			},
			{
				item: itemList[Item.SMOG_EGG],
				probability: 2
			},
			{
				item: itemList[Item.SMOG_EGG_CHRISTMAS_BLUE],
				probability: 1
			},
			{
				item: itemList[Item.TRICERAGNON_BABY],
				probability: 2
			},
			{
				item: itemList[Item.TRICERAGNON_EGG_BABY],
				probability: 1 //33
			},
			{
				item: itemList[Item.FIRE_SPHERE],
				probability: 5
			},
			{
				item: itemList[Item.WOOD_SPHERE],
				probability: 5
			},
			{
				item: itemList[Item.WATER_SPHERE],
				probability: 5
			},
			{
				item: itemList[Item.LIGHTNING_SPHERE],
				probability: 5
			},
			{
				item: itemList[Item.AIR_SPHERE],
				probability: 5 //58
			},
			{
				item: itemList[Item.BOX_LEGENDARY],
				probability: 2 //60
			},
			{
				item: itemList[Item.VOID_SPHERE],
				probability: 15 //75
			},
			{
				item: itemList[Item.TIK_BRACELET],
				probability: 15 //90
			},
			{
				item: itemList[Item.GOLDEN_NAPODINO],
				probability: 10 //100
			}
		]
	}
];
