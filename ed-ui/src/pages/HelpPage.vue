<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<TitleHeader :title="`${$t('pageTitle.guide')}`" />
	<div class="section ml-[-35px] mt-[-30px] sm:ml-0 sm:mt-0">
		<div class="titlePage">
			<h3>{{ $t(`rightMenu.guide`) }}</h3>
		</div>
	</div>
	<div class="ml-[-35px] flex flex-wrap sm:ml-0 sm:flex-nowrap sm:justify-center">
		<div class="min-w-[210px] rounded-md bg-[#e09b6244]">
			<ul class="ml-1 mt-1 cursor-pointer p-1 font-bold text-[#8e3e26]" style="font-variant: small-caps">
				<li
					class="hover:bg-[#8e3e26] hover:text-[#fce3bc]"
					v-for="(item, index) in items"
					:key="index"
					@click="showContent(item)"
				>
					<img v-if="item.nameImageUrl" :src="getImgURL(item.nameImageUrl.path, item.nameImageUrl.name)" alt="Image" />
					{{ item.name }}
				</li>
			</ul>
		</div>
		<div class="hidden justify-center sm:block">
			<img class="size-[250px] lg:size-[350px]" :src="getImgURL('design', 'rocky_01')" />
		</div>
	</div>
	<div class="showContent ml-[-25px] sm:ml-0">
		<div v-if="selectedItem" class="custom-deep ml-[-20px] mt-[20px] flex w-full flex-col flex-wrap sm:ml-0">
			<h2 class="titlePage">{{ selectedItem.name }}</h2>
			<img class="size-full" :src="getImgURL('design', 'title_h1')" />
			<div v-for="(section, index) in selectedItem.contentSections" :key="index" class="ml-[10px] mt-[15px] w-[98%]">
				<h3 class="mb-[10px] rounded-[2px] bg-[#8e3e26] text-[#fff1ad]">{{ section.name }}</h3>
				<ul v-if="section.texts" class="mt-[10px] flex flex-col gap-[10px] sm:ml-0">
					<li v-for="(text, i) in section.texts" :key="i">
						<p v-html="formatContent(text)" />
					</li>
				</ul>
				<img
					v-if="section.ImageUrl"
					:src="getImgURL(section.ImageUrl.path, section.ImageUrl.name)"
					alt="Image"
					class="my-[10px] h-auto w-full"
				/>
				<ul v-if="section.listItems" class="mt-[12px]">
					<li class="mt-[10px] sm:ml-[10px]" v-for="(item, i) in section.listItems" :key="i">
						<img
							class="mr-2"
							v-if="item.imageUrl"
							:src="getImgURL(item.imageUrl.path, item.imageUrl.name)"
							alt="Image"
						/>
						<span v-html="formatContent(item.text)" />
					</li>
				</ul>
			</div>
			<div class="mt-[10px] flex flex-col justify-between sm:flex-row">
				<a @click="showPrevItem" v-if="selectedItem.prevItem !== undefined" class="button">
					<img :src="getImgURL('icons', 'small_page_down')" />
					{{ items[selectedItem.prevItem].name }}
				</a>
				<a @click="showNextItem" v-if="selectedItem.nextItem !== undefined" class="button">
					<img :src="getImgURL('icons', 'small_page_up')" />
					{{ items[selectedItem.nextItem].name }}
				</a>
				<a @click="goToPage('News')" class="button">
					<img :src="getImgURL('icons', 'small_delete')" />
					{{ $t(`guide.text.stop`) }}
				</a>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';

export default defineComponent({
	name: 'Help',
	components: {
		TitleHeader
	},
	data() {
		return {
			items: [
				{
					name: this.$t('guide.sections.intro'),
					nameImageUrl: { path: 'icons', name: 'small_home' },
					contentSections: [{ texts: [this.$t('guide.text.intro')] }],
					nextItem: 1
				},
				{
					name: this.$t('guide.sections.adopt'),
					nameImageUrl: { path: 'design', name: 'small_member' },
					contentSections: [
						{
							texts: [this.$t('guide.text.adopt')],
							ImageUrl: { path: 'guide', name: 'adopt' }
						},
						{ texts: [this.$t('guide.text.adopt2')] }
					],
					nextItem: 2,
					prevItem: 0
				},
				{
					name: this.$t('guide.sections.name'),
					nameImageUrl: { path: 'icons', name: 'small_question' },
					contentSections: [
						{ texts: [this.$t('guide.text.name')], ImageUrl: { path: 'guide', name: 'name' } },
						{ texts: [this.$t('guide.text.name2')] }
					],
					nextItem: 3,
					prevItem: 1
				},
				{
					name: this.$t('guide.sections.card'),
					nameImageUrl: { path: 'status', name: 'fx_ccard' },
					contentSections: [
						{ texts: [this.$t('guide.text.card')], ImageUrl: { path: 'guide', name: 'card' } },
						{
							texts: [this.$t('guide.text.card2')],
							listItems: [
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.card2-1') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.card2-2') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.card2-3') }
							]
						},
						{ texts: [this.$t('guide.text.card3')] }
					],
					nextItem: 4,
					prevItem: 2
				},
				{
					name: this.$t('guide.sections.move'),
					nameImageUrl: { path: 'icons', name: 'small_follow' },
					contentSections: [
						{ texts: [this.$t('guide.text.move')], ImageUrl: { path: 'guide', name: 'move' } },
						{
							texts: [this.$t('guide.text.move2')],
							listItems: [{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.move2-1') }]
						},
						{ texts: [this.$t('guide.text.move3')] }
					],
					nextItem: 5,
					prevItem: 3
				},
				{
					name: this.$t('guide.sections.fight'),
					nameImageUrl: { path: 'icons', name: 'small_fire' },
					contentSections: [
						{ texts: [this.$t('guide.text.fight')], ImageUrl: { path: 'guide', name: 'fight' } },
						{
							texts: [this.$t('guide.text.fight2')],
							listItems: [
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.fight2-1') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.fight2-2') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.fight2-3') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.fight2-4') }
							]
						},
						{
							name: this.$t('guide.text.fight3'),
							texts: [this.$t('guide.text.fight3-1')],
							listItems: [
								{ imageUrl: { path: 'elements', name: 'elem_fire' }, text: this.$t('guide.text.fight3-1-1') },
								{ imageUrl: { path: 'elements', name: 'elem_wood' }, text: this.$t('guide.text.fight3-1-2') },
								{ imageUrl: { path: 'elements', name: 'elem_water' }, text: this.$t('guide.text.fight3-1-3') },
								{ imageUrl: { path: 'elements', name: 'elem_lightning' }, text: this.$t('guide.text.fight3-1-4') },
								{ imageUrl: { path: 'elements', name: 'elem_air' }, text: this.$t('guide.text.fight3-1-5') }
							]
						},
						{
							texts: [this.$t('guide.text.fight3-2')],
							ImageUrl: { path: 'guide', name: 'elements' }
						},
						{ texts: [this.$t('guide.text.fight3-3')] },
						{
							name: this.$t('guide.text.fight4'),
							texts: [this.$t('guide.text.fight4-1')],
							ImageUrl: { path: 'guide', name: 'assault' }
						},
						{
							texts: [this.$t('guide.text.fight4-2')],
							listItems: [
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.fight4-2-1') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.fight4-2-2') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.fight4-2-3') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.fight4-2-4') }
							]
						},
						{ texts: [this.$t('guide.text.fight4-3')] },
						{ name: this.$t('guide.text.fight5'), texts: [this.$t('guide.text.fight5-1')] },
						{ name: this.$t('guide.text.fight6'), texts: [this.$t('guide.text.fight6-1')] },
						{ name: this.$t('guide.text.fight7'), ImageUrl: { path: 'guide', name: 'energy' } },
						{ texts: [this.$t('guide.text.fight7-1')] },
						{
							name: this.$t('guide.text.fight8'),
							texts: [this.$t('guide.text.fight8-1')],
							listItems: [
								{ imageUrl: { path: 'guide', name: 'status_sleep' }, text: this.$t('guide.text.fight8-1-1') },
								{ imageUrl: { path: 'guide', name: 'status_untouchable' }, text: this.$t('guide.text.fight8-1-2') },
								{ imageUrl: { path: 'guide', name: 'status_slow_down' }, text: this.$t('guide.text.fight8-1-3') },
								{ imageUrl: { path: 'guide', name: 'status_faster' }, text: this.$t('guide.text.fight8-1-4') },
								{ imageUrl: { path: 'guide', name: 'status_petrified' }, text: this.$t('guide.text.fight8-1-5') },
								{ imageUrl: { path: 'guide', name: 'status_assault_bonus' }, text: this.$t('guide.text.fight8-1-6') },
								{ imageUrl: { path: 'guide', name: 'status_poisoned' }, text: this.$t('guide.text.fight8-1-7') },
								{ imageUrl: { path: 'guide', name: 'status_locked' }, text: this.$t('guide.text.fight8-1-8') },
								{ imageUrl: { path: 'guide', name: 'status_dazzled' }, text: this.$t('guide.text.fight8-1-9') },
								{ imageUrl: { path: 'guide', name: 'status_protected' }, text: this.$t('guide.text.fight8-1-10') },
								{ imageUrl: { path: 'guide', name: 'status_mute' }, text: this.$t('guide.text.fight8-1-11') },
								{ imageUrl: { path: 'guide', name: 'status_sharingan' }, text: this.$t('guide.text.fight8-1-12') },
								{
									imageUrl: { path: 'guide', name: 'status_blocked_inventory' },
									text: this.$t('guide.text.fight8-1-13')
								},
								{ imageUrl: { path: 'guide', name: 'status_energy_penalty' }, text: this.$t('guide.text.fight8-1-14') },
								{ imageUrl: { path: 'guide', name: 'status_energy_bonus' }, text: this.$t('guide.text.fight8-1-15') },
								{ imageUrl: { path: 'guide', name: 'status_bonus_def_fire' }, text: this.$t('guide.text.fight8-1-16') },
								{ imageUrl: { path: 'guide', name: 'status_bonus_def_wood' }, text: this.$t('guide.text.fight8-1-17') },
								{
									imageUrl: { path: 'guide', name: 'status_bonus_def_water' },
									text: this.$t('guide.text.fight8-1-18')
								},
								{
									imageUrl: { path: 'guide', name: 'status_bonus_def_lightning' },
									text: this.$t('guide.text.fight8-1-19')
								},
								{ imageUrl: { path: 'guide', name: 'status_bonus_def_air' }, text: this.$t('guide.text.fight8-1-20') },
								{
									imageUrl: { path: 'guide', name: 'status_initiative_bonus' },
									text: this.$t('guide.text.fight8-1-21')
								},
								{
									imageUrl: { path: 'guide', name: 'status_initiative_penalty' },
									text: this.$t('guide.text.fight8-1-22')
								},
								{ imageUrl: { path: 'guide', name: 'status_dodge_bonus' }, text: this.$t('guide.text.fight8-1-23') },
								{ imageUrl: { path: 'guide', name: 'status_def_bonus' }, text: this.$t('guide.text.fight8-1-24') }
							]
						}
					],
					nextItem: 6,
					prevItem: 4
				},
				{
					name: this.$t('guide.sections.heal'),
					nameImageUrl: { path: 'icons', name: 'small_use' },
					contentSections: [
						{
							texts: [this.$t('guide.text.heal')],
							ImageUrl: { path: 'guide', name: 'heal' }
						},
						{ name: this.$t('guide.text.heal2'), texts: [this.$t('guide.text.heal2-1')] }
					],
					nextItem: 7,
					prevItem: 5
				},
				{
					name: this.$t('guide.sections.death'),
					nameImageUrl: { path: 'icons', name: 'small_delete' },
					contentSections: [
						{
							texts: [this.$t('guide.text.death')],
							listItems: [
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.death-1') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.death-2') }
							]
						},
						{ texts: [this.$t('guide.text.death2')] }
					],
					nextItem: 8,
					prevItem: 6
				},
				{
					name: this.$t('guide.sections.exp'),
					nameImageUrl: { path: 'icons', name: 'small_xp' },
					contentSections: [
						{ texts: [this.$t('guide.text.exp')], ImageUrl: { path: 'guide', name: 'exp' } },
						{ name: this.$t('guide.text.exp2'), texts: [this.$t('guide.text.exp2-1')] },
						{ name: this.$t('guide.text.exp3'), texts: [this.$t('guide.text.exp3-1')] }
					],
					nextItem: 9,
					prevItem: 7
				},
				{
					name: this.$t('guide.sections.missions'),
					nameImageUrl: { path: 'icons', name: 'small_gold' },
					contentSections: [
						{ texts: [this.$t('guide.text.missions')], ImageUrl: { path: 'guide', name: 'missions' } },
						{ texts: [this.$t('guide.text.missions2')] }
					],
					nextItem: 10,
					prevItem: 8
				},
				{
					name: this.$t('guide.sections.status'),
					nameImageUrl: { path: 'icons', name: 'small_edit' },
					contentSections: [{ texts: [this.$t('guide.text.status')] }],
					nextItem: 11,
					prevItem: 9
				},
				{
					name: this.$t('guide.sections.equipment'),
					nameImageUrl: { path: 'status', name: 'fx_bckpck' },
					contentSections: [
						{ texts: [this.$t('guide.text.equipment')], ImageUrl: { path: 'guide', name: 'equipment' } },
						{ texts: [this.$t('guide.text.equipment2')] }
					],
					nextItem: 12,
					prevItem: 10
				},
				{
					name: this.$t('guide.sections.epic'),
					nameImageUrl: { path: 'icons', name: 'small_mode' },
					contentSections: [{ texts: [this.$t('guide.text.epic')] }],
					nextItem: 13,
					prevItem: 11
				},
				{
					name: this.$t('guide.sections.group'),
					nameImageUrl: { path: 'icons', name: 'small_leader' },
					contentSections: [
						{ texts: [this.$t('guide.text.group')], ImageUrl: { path: 'guide', name: 'group' } },
						{ texts: [this.$t('guide.text.group2')] }
					],
					nextItem: 14,
					prevItem: 12
				},
				{
					name: this.$t('guide.sections.ingredient'),
					nameImageUrl: { path: 'status', name: 'fx_pelle' },
					contentSections: [
						{ texts: [this.$t('guide.text.ingredient')], ImageUrl: { path: 'guide', name: 'gather' } },
						{ texts: [this.$t('guide.text.ingredient2')] }
					],
					nextItem: 15,
					prevItem: 13
				},
				{
					name: this.$t('guide.sections.clans'),
					nameImageUrl: { path: 'icons', name: 'small_leader' },
					contentSections: [
						{ texts: [this.$t('guide.text.clans')] },
						{ name: this.$t('guide.text.clans1'), texts: [this.$t('guide.text.clans1-1')] },
						{ name: this.$t('guide.text.clans2'), texts: [this.$t('guide.text.clans2-1')] }
					],
					nextItem: 16,
					prevItem: 14
				},
				{
					name: this.$t('guide.sections.dojo'),
					nameImageUrl: { path: 'icons', name: 'small_dojo' },
					contentSections: [
						{
							texts: [this.$t('guide.text.dojos')],
							listItems: [{ imageUrl: { path: 'icons', name: 'act_train' }, text: this.$t('guide.text.dojos-1') }]
						},
						{ texts: [this.$t('guide.text.dojos-2')] },
						{ name: this.$t('guide.text.dojos1'), texts: [this.$t('guide.text.dojos1-1')] },
						{
							name: this.$t('guide.text.dojos2'),
							texts: [this.$t('guide.text.dojos2-1')],
							listItems: [{ imageUrl: { path: 'icons', name: 'act_defi' }, text: this.$t('guide.text.dojos2-2') }]
						},
						{
							name: this.$t('guide.text.dojos3'),
							texts: [this.$t('guide.text.dojos3-1')],
							listItems: [{ imageUrl: { path: 'icons', name: 'act_tournoi' }, text: this.$t('guide.text.dojos3-2') }]
						},
						{ texts: [this.$t('guide.text.dojos3-3')] },
						{
							name: this.$t('guide.text.dojos4'),
							listItems: [{ imageUrl: { path: 'icons', name: 'act_historique' }, text: this.$t('guide.text.dojos4-1') }]
						},
						{
							name: this.$t('guide.text.dojos5'),
							listItems: [
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.dojos5-1') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.dojos5-2') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.dojos5-3') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.dojos5-4') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.dojos5-5') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.dojos5-6') }
							]
						}
					],
					nextItem: 17,
					prevItem: 15
				},
				{
					name: this.$t('guide.sections.gdc'),
					nameImageUrl: { path: 'icons', name: 'small_attack' },
					contentSections: [
						{ texts: [this.$t('guide.text.gdc')] },
						{
							name: this.$t('guide.text.gdc1'),
							texts: [this.$t('guide.text.gdc1-1')],
							listItems: [
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.gdc1-2') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.gdc1-3') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.gdc1-4') }
							]
						},
						{
							name: this.$t('guide.text.gdc2'),
							texts: [this.$t('guide.text.gdc2-1')],
							ImageUrl: { path: 'guide', name: 'castle' }
						},
						{
							texts: [this.$t('guide.text.gdc2-2')],
							listItems: [
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.gdc2-2-1') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.gdc2-2-2') }
							]
						},
						{ name: this.$t('guide.text.gdc3'), texts: [this.$t('guide.text.gdc3-1')] },
						{
							name: this.$t('guide.text.gdc4'),
							texts: [this.$t('guide.text.gdc4-1')],
							ImageUrl: { path: 'guide', name: 'attack_castle' }
						},
						{
							name: this.$t('guide.text.gdc5'),
							texts: [this.$t('guide.text.gdc5-1')],
							ImageUrl: { path: 'guide', name: 'def_castle' }
						},
						{ name: this.$t('guide.text.gdc6'), texts: [this.$t('guide.text.gdc6-1')] }
					],
					nextItem: 18,
					prevItem: 16
				},
				{
					name: this.$t('guide.sections.cdc'),
					nameImageUrl: { path: 'icons', name: 'small_attack' },
					contentSections: [
						{ texts: [this.$t('guide.text.cdc')] },
						{ name: this.$t('guide.text.cdc1'), texts: [this.$t('guide.text.cdc1-1')] },
						{
							name: this.$t('guide.text.cdc2'),
							texts: [this.$t('guide.text.cdc2-1')],
							ImageUrl: { path: 'guide', name: 'battle_cdc' }
						},
						{ texts: [this.$t('guide.text.cdc2-2')] },
						{ name: this.$t('guide.text.cdc3'), texts: [this.$t('guide.text.cdc3-1')] },
						{
							name: this.$t('guide.text.cdc4'),
							texts: [this.$t('guide.text.cdc4-1')],
							ImageUrl: { path: 'guide', name: 'position_cdc' }
						},
						{ texts: [this.$t('guide.text.cdc4-2')] }
					],
					nextItem: 19,
					prevItem: 17
				},
				{
					name: this.$t('guide.sections.question'),
					nameImageUrl: { path: 'icons', name: 'small_mail' },
					contentSections: [
						{
							texts: [this.$t('guide.text.questions')],
							listItems: [
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.questions1') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.questions2') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.questions3') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.questions4') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.questions5') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.questions6') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.questions7') }
							]
						}
					],
					nextItem: 20,
					prevItem: 18
				},
				{
					name: this.$t('guide.sections.support'),
					nameImageUrl: { path: 'icons', name: 'small_browse_next' },
					contentSections: [
						{ name: this.$t('guide.text.support'), texts: [this.$t('guide.text.support-1')] },
						{
							texts: [this.$t('guide.text.support1')],
							listItems: [
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.support1-1') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.support1-2') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.support1-3') }
							]
						},
						{
							texts: [this.$t('guide.text.support2')],
							listItems: [
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.support2-1') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.support2-2') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.support2-3') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.support2-4') }
							]
						},
						{
							texts: [this.$t('guide.text.support3')],
							listItems: [
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.support3-1') },
								{ imageUrl: { path: 'design', name: 'info_button' }, text: this.$t('guide.text.support3-2') }
							]
						},
						{ name: this.$t('guide.text.support4'), texts: [this.$t('guide.text.support4-1')] }
					],
					nextItem: 21,
					prevItem: 19
				},
				{
					name: this.$t('guide.sections.security'),
					nameImageUrl: { path: 'icons', name: 'small_lock' },
					contentSections: [{ name: this.$t('guide.text.security'), texts: [this.$t('guide.text.security-1')] }],
					prevItem: 20
				}
			],
			selectedItem: null
		};
	},
	methods: {
		showContent(item) {
			this.selectedItem = item;
		},
		showNextItem() {
			if (this.selectedItem && this.selectedItem.nextItem !== undefined) {
				const nextItemIndex = this.selectedItem.nextItem;
				this.selectedItem = this.items[nextItemIndex];
			}
		},
		showPrevItem() {
			if (this.selectedItem && this.selectedItem.prevItem !== undefined) {
				const prevItemIndex = this.selectedItem.prevItem;
				this.selectedItem = this.items[prevItemIndex];
			}
		},
		goToPage(pageName: string) {
			this.$router.push({ name: pageName });
		}
	}
});
</script>

<style lang="scss" scoped>
.custom-deep {
	:deep(strong) {
		color: #8e3e26;
	}
	:deep(i) {
		color: #8e3e26;
	}
}
</style>
