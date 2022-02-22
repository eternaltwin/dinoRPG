<template>
	<div class="shop">
		<Title :title="$t('pageTitle.shop')" />
		<div class="section">
			<div
				class="titlePage"
				style="undefined"
				width="520"
				height="27"
				v-html="
					formatContent($t(`shop.item.title`)) +
						formatContent($t(`shop.item.${shop}.name`))
				"
			/>
		</div>
		<div class="shopDesc">
			<div class="contain">
				<div class="art art_shop">
					<img :src="getImg('icons', '', 'shop_flying')" alt="" />
				</div>
				<p v-html="formatContent($t(`shop.item.${shop}.description`))" />
				<div class="clear"></div>
			</div>
		</div>
		<div class="bg bg2">
			<div class="list">
				<Tippy
					theme="small"
					class="name"
					v-for="(item, index) in itemList"
					:id="itemNameList[item.itemId]"
					:key="index"
					tag="a"
				>
					<img
						:src="getImg('item', 'item_', `${itemNameList[item.itemId]}`)"
						alt="icon"
						@click="selectedItem = item"
					/>
					<template #content>
						<h2
							v-html="
								formatContent($t(`item.name.${itemNameList[item.itemId]}`))
							"
						/>
						<p>
							{{ item.price }}
							<img :src="getImg('icons', '', 'small_gold')" />
						</p>
					</template>
				</Tippy>
			</div>
			<div class="details">
				<div v-if="selectedItem.itemId === 0" id="shop_guide">
					<p v-html="formatContent($t('shop.item.help'))" />
					<div
						class="ad"
						v-html="
							formatContent($t('shop.item.advice') + $t('shop.item.advice_1'))
						"
					/>
				</div>
				<div
					v-if="selectedItem.itemId !== 0"
					id="item_"
					class="item"
					style="display: block;"
				>
					<Tippy
						theme="small"
						tag="div"
						class="stock"
						:class="{
							full: isFull(selectedItem)
						}"
						@click="buyMaxItemPopinConfirmChoice()"
					>
						{{ selectedItem.quantity }} / {{ selectedItem.maxQuantity }}
						<template #content>
							<div
								v-html="
									formatContent($t('tooltip.shop.buyMaxTopNote_part1')) +
										selectedItem.quantity +
										formatContent($t('tooltip.shop.buyMaxTopNote_part2')) +
										selectedItem.maxQuantity +
										formatContent($t('tooltip.shop.buyMaxTopNote_part3'))
								"
							/>
							<div
								v-html="formatContent($t('tooltip.shop.buyMaxBottomNote'))"
							/>
						</template>
					</Tippy>
					<div class="type">
						<Tippy
							theme="small"
							tag="img"
							v-if="selectedItem.canBeUsedNow"
							:src="getImg('icons', 'small_', 'use')"
							alt=""
						>
							<template #content>
								<p v-html="formatContent($t('tooltip.item.use'))" />
							</template>
						</Tippy>
						<Tippy
							theme="small"
							tag="img"
							v-else
							:src="getImg('icons', 'small_', 'use_off')"
							alt=""
						>
							<template #content>
								<p v-html="formatContent($t('tooltip.item.useOff'))" />
							</template>
						</Tippy>
						<Tippy
							theme="small"
							tag="img"
							v-if="selectedItem.canBeEquipped"
							:src="getImg('icons', 'small_', 'equip')"
							alt=""
						>
							<template #content>
								<p v-html="formatContent($t('tooltip.item.equip'))" />
							</template>
						</Tippy>
						<Tippy
							theme="small"
							tag="img"
							v-else
							:src="getImg('icons', 'small_', 'equip_off')"
							alt=""
						>
							<template #content>
								<p v-html="formatContent($t('tooltip.item.equipOff'))" />
							</template>
						</Tippy>
					</div>
					<div class="infos">
						<label for="field_1">{{ $t('shop.item.quantity') }}</label>
						<input type="number" v-model="selectedQuantity" />
						<a
							class="button"
							v-if="
								isSelectedQuantityValid(
									parseFloat(selectedQuantity),
									selectedItem
								)
							"
							@click="buyItemPopinConfirmChoice()"
						>
							{{ $t(`shop.item.buy`) }}
						</a>
						<Tippy theme="small" tag="a" class="button disabled" v-else>
							<template #content>
								<div
									v-html="formatContent($t('tooltip.shop.invalidQuantity'))"
								/>
								<div
									v-html="
										formatContent($t('tooltip.shop.invalidQuantity_foot'))
									"
								/>
							</template>
							{{ $t(`shop.item.buy`) }}
						</Tippy>
					</div>
					<div class="header">
						<img
							class="icon"
							:src="
								getImg('item', 'item_', `${itemNameList[selectedItem.itemId]}`)
							"
						/>
						<div class="name">
							{{ $t(`item.name.${itemNameList[selectedItem.itemId]}`) }}
						</div>
						<div class="value">
							<span class="money">
								{{ selectedItem.price }}
								<img :src="getImg('icons', '', 'small_gold')" alt="or" />
							</span>
						</div>
					</div>
					<div class="clear"></div>
					<div
						class="desc"
						v-html="
							formatContent(
								$t(`item.description.${itemNameList[selectedItem.itemId]}`)
							)
						"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" scoped>
import { defineComponent } from 'vue';
import { ItemShopService } from '@/services';
import { Item } from '@/models';
import { errorHandler } from '@/utils';
import { itemNameList } from '@/constants';
import { sessionStore } from '@/store';
import Title from '@/components/utils/Title.vue';
import EventBus from '@/events';

export default defineComponent({
	name: 'ItemShopPage',
	data() {
		return {
			// Temporarily forced to flying, later this will be a parameter of the shop to display
			shop: 'flying' as string,
			itemList: [] as Array<Item>,
			itemNameList: itemNameList,
			selectedItem: {} as Item,
			selectedQuantity: 1 as number
		};
	},
	components: {
		Title
	},
	computed: {
		// Check if the quantity select is valid:
		// i.e a valid number or the player has enough room
		isSelectedQuantityValid(): {
			(selectedQuantity: number, selectedItem: Item): boolean;
		} {
			return (selectedQuantity: number, selectedItem: Item) => {
				return (
					selectedQuantity > 0 &&
					selectedQuantity <=
						selectedItem.maxQuantity! - selectedItem.quantity! &&
					Number.isInteger(selectedQuantity)
				);
			};
		}
	},
	methods: {
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.webp`);
		},
		isFull(item: Item): boolean {
			return item.quantity === item.maxQuantity;
		},
		// Buy n of the selected item
		async buyItems(itemId: number, quantity: number): Promise<void> {
			try {
				await ItemShopService.buyItem(
					1, // Temporary hardcoded to flying shop ID
					itemId,
					quantity
				);
				EventBus.emit('isLoading', false);
				// Update the new quantity
				// Both values are forced to number to avoid them somehow being treated as a string
				this.selectedItem.quantity =
					Number(this.selectedItem.quantity!) + Number(quantity);
			} catch (err) {
				errorHandler.handle(err);
				return;
			}

			// Update player's money
			const newMoney = (sessionStore.getters.getMoney -
				this.selectedItem.price! * quantity) as number;
			sessionStore.commit('setMoney', newMoney);
		},
		async buyMaxItemPopinConfirmChoice(): Promise<void> {
			const maxQuantity: number =
				this.selectedItem.maxQuantity! - this.selectedItem.quantity!;
			const totalPrice: number = maxQuantity * this.selectedItem.price!;
			const res: boolean = confirm(
				this.$t('popup.shop.buyMaxConfirm_part1') +
					maxQuantity +
					this.$t('popup.shop.buyMaxConfirm_part2') +
					totalPrice +
					this.$t('popup.shop.buyMaxConfirm_part3')
			);
			if (res) {
				EventBus.emit('isLoading', true);
				this.buyItems(this.selectedItem.itemId!, maxQuantity);
			}
		},
		async buyItemPopinConfirmChoice(): Promise<void> {
			const res: boolean = confirm(this.$t('popup.confirm'));
			if (res) {
				EventBus.emit('isLoading', true);
				this.buyItems(this.selectedItem.itemId!, this.selectedQuantity!);
			}
		}
	},
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);
		// Get shop and its items to display
		try {
			// Temporarily forced to flying/1, later this will be a parameter of the shop to display
			this.itemList = await ItemShopService.getItemFromItemShop(1);
			this.shop = 'flying';
			this.selectedItem.itemId = 0;
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err);
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
.shop {
	.section {
		height: 45px;
		margin-left: -15px;
		margin-bottom: 20px;
		background-image: url('../assets/design/title_h1.webp');
		background-position: left bottom;
		background-repeat: no-repeat;
	}
	.shopDesc {
		margin: auto;
		margin-bottom: 8px;
		width: 520px;
		height: 168px;
		padding: 5px;
		font-style: italic;
		color: #ffee92;
		font-size: 10pt;
		background-image: url('../assets/background/desc_shop.webp');
		background-repeat: no-repeat;
		.contain {
			margin-top: 10px;
			padding: 15px;
		}
		.art {
			width: 160px;
			height: 120px;
			margin-right: 10px;
			margin-bottom: 10px;
			border: none;
			outline: none;
			float: left;
			position: relative;
			overflow: hidden;
			font-size: 0pt;
			line-height: 0pt;
			background-position: top left;
			background-repeat: no-repeat;
		}
		p {
			margin: 0px;
		}
	}
	.bg {
		margin: auto;
		width: 520px;
		height: 222px;
		background-image: url('../assets/design/shop_bg.webp');
		background-repeat: no-repeat;
		.list {
			position: absolute;
			width: 140px;
			margin-left: 20px;
			margin-top: 19px;
			font-size: 0pt;
			line-height: 0pt;
			a {
				display: block;
				float: left;
				position: relative;
				width: 32px;
				height: 32px;
				border: 1px solid #b37047;
				border-radius: 0px;
				-moz-border-radius: 0px;
				-webkit-border-radius: 0px;
				&:hover {
					border-color: white;
					z-index: 3;
				}
			}
		}
		.full {
			.stock {
				color: yellow;
				font-weight: bold;
			}
			.button {
				opacity: 0.3;
				filter: alpha(opacity=30);
				zoom: 1;
			}
		}
		.details {
			position: absolute;
			width: 294px;
			height: 180px;
			margin-left: 200px;
			margin-top: 20px;
			#shop_guide {
				.ad {
					margin-top: 80px;
					color: #ffee92;
					font-size: 9pt;
					line-height: 10pt;
					font-style: italic;
				}
				p {
					padding-left: 40px;
					text-indent: 0px;
					color: #fce3bc;
					background-image: url('../assets/design/shop_arrow.webp');
					background-position: 0px 5px;
					background-repeat: no-repeat;
				}
			}
			.item {
				display: none;
			}
			.name {
				color: #ffee92;
				font-variant: small-caps;
				font-weight: bold;
				line-height: 9pt;
				padding-bottom: 4px;
				border-bottom: 1px solid #ffee92;
			}
			.noValue {
				height: 12px;
			}
			.value {
				color: white;
				font-size: 9pt;
				margin-top: 1px;
				span.money {
					background-color: transparent;
					border: 0px;
					color: #ffee92;
				}
				img {
					vertical-align: -5%;
				}
				.objValue {
					margin-top: 4px;
					padding: 3px;
					color: #ffee92;
					font-weight: bold;
					border-top: 1px solid #9a4029;
					border-bottom: 1px solid #9a4029;
					img {
						vertical-align: -50%;
					}
				}
			}
			.type {
				position: absolute;
				z-index: 2;
				margin-top: 23px;
				margin-left: 230px;
				width: 65px;
				text-align: right;
				font-size: 0pt;
				line-height: 0pt;
				img {
					margin-left: 5px;
					cursor: help;
				}
			}
			.desc {
				margin-top: 10px;
				color: #fce3bc;
				font-size: 11pt;
				line-height: 12pt;
			}
			.obj {
				margin-top: 0px;
			}
			.infos {
				position: absolute;
				margin-top: 143px;
				width: 294px;
				padding-top: 2px;
				border-top: 1px solid #ffee92;
				display: flex;
				flex-direction: revert;
				justify-content: space-between;
				input {
					align-self: center;
					width: 64px;
					height: 20px;
					padding-left: 8px;
					padding-right: 8px;
					padding-top: 2px;
					color: #ffee92;
					font-size: 9pt;
					font-weight: bold;
					border: none;
					background-image: url('../assets/design/form_field_small.gif');
					background-repeat: no-repeat;
					background-color: transparent;
					&:focus {
						background-image: url('../assets//design/form_field_small_hover.gif');
					}
				}
			}
			.stock {
				position: absolute;
				width: 50px;
				margin-left: 240px;
				padding-right: 5px;
				text-align: right;
				color: #ffee92;
				font-size: 11pt;
				letter-spacing: -0.5pt;
				background-color: #b46843;
				border: 1px solid #ffee92;
				cursor: pointer;
				&:hover {
					border-color: white;
					background-color: #9f562b;
				}
			}
			img.icon {
				float: left;
				position: relative;
				border: 1px solid black;
				margin-right: 5px;
			}
			label {
				align-self: center;
				display: block;
				float: right;
				position: relative;
				margin-top: 4px;
				margin-bottom: 4px;
				margin-right: 2px;
				padding-top: 3px;
				padding-bottom: 3px;
				padding-right: 5px;
				padding-left: 10px;
				border-radius: 10px;
				-moz-border-radius: 10px;
				-webkit-border-radius: 10px;
				font-size: 8pt;
				background-color: #9a4029;
				color: #ffee92;
			}
		}
	}
	.bg2 {
		background-image: url('../assets/design/shop_bg2.webp');
		height: 304px;
	}
	p {
		line-height: 12pt;
		margin-bottom: 10px;
		&:first-letter {
			font-weight: bold;
			font-size: 115%;
			color: white;
		}
	}
	.full {
		font-weight: bold;
	}
	.disabled {
		opacity: 0.3;
	}
	// Does not work, so I changed in _general.scss
	/*& strong {
		color: white;
	}*/
}
</style>
