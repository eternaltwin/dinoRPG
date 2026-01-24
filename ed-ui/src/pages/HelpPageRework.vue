<template>
	<TitleHeader :title="`${$t('pageTitle.guide')}`" :header="$t(`topBar.rightMenu.guide`)" />
	<div class="intro">
		<div class="menu">
			<ul class="list">
				<li
					v-for="(item, index) in helpPageSections"
					:key="item.id"
					@click="showContent(index)"
					:class="{ selected: selectedItemIndex === index }"
				>
					<img v-if="item.nameImageUrl" :src="getImgURL(item.nameImageUrl.path, item.nameImageUrl.name)" alt="Image" />
					{{ $t(item.nameI18nKey) }}
				</li>
			</ul>
		</div>
		<div class="image">
			<img :src="getImgURL('design', 'rocky_01')" />
		</div>
	</div>
	<div class="showContent">
		<div v-if="selectedItem" class="content">
			<div class="titleContent">
				<h3>{{ $t(selectedItem.nameI18nKey) }}</h3>
			</div>
			<div class="markdown">
				<Markdown :source="markdownContent" />
			</div>
			<button @click="showPrevItem" v-if="selectedItem.prevItem" class="next">
				<img :src="getImgURL('icons', 'small_page_up')" />
				{{ $t(getPrevItem()?.nameI18nKey || '') }}
			</button>
			<button @click="showNextItem" v-if="selectedItem.nextItem" class="next">
				<img :src="getImgURL('icons', 'small_page_down')" />
				{{ $t(getNextItem()?.nameI18nKey || '') }}
			</button>
			<button @click="goToPage('News')" class="next">
				<img :src="getImgURL('icons', 'small_delete')" />
				{{ $t(`guide.text.stop`) }}
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import Markdown from 'vue3-markdown-it';
import { loadHelpPageMarkdown, processMarkdownImages } from '../utils/markdownLoader';
import { localStore } from '../store/index';

interface HelpPageConfig {
	id: string;
	nameI18nKey: string;
	nameImageUrl?: { path: string; name: string };
	markdownFile: string;
	nextItem?: string;
	prevItem?: string;
}

const helpPageSections: HelpPageConfig[] = [
	{
		id: 'intro',
		nameI18nKey: 'guide.sections.intro',
		nameImageUrl: { path: 'icons', name: 'small_home' },
		markdownFile: 'intro',
		nextItem: 'adopt'
	},
	{
		id: 'adopt',
		nameI18nKey: 'guide.sections.adopt',
		nameImageUrl: { path: 'design', name: 'small_member' },
		markdownFile: 'adopt',
		nextItem: 'name',
		prevItem: 'intro'
	},
	{
		id: 'name',
		nameI18nKey: 'guide.sections.name',
		nameImageUrl: { path: 'icons', name: 'small_question' },
		markdownFile: 'name',
		nextItem: 'card',
		prevItem: 'adopt'
	},
	{
		id: 'card',
		nameI18nKey: 'guide.sections.card',
		nameImageUrl: { path: 'status', name: 'fx_ccard' },
		markdownFile: 'card',
		nextItem: 'move',
		prevItem: 'name'
	},
	{
		id: 'move',
		nameI18nKey: 'guide.sections.move',
		nameImageUrl: { path: 'icons', name: 'small_follow' },
		markdownFile: 'move',
		nextItem: 'fight',
		prevItem: 'card'
	},
	{
		id: 'fight',
		nameI18nKey: 'guide.sections.fight',
		nameImageUrl: { path: 'icons', name: 'small_fire' },
		markdownFile: 'fight',
		nextItem: 'heal',
		prevItem: 'move'
	},
	// {
	// 	id: 'heal',
	// 	nameI18nKey: 'guide.sections.heal',
	// 	nameImageUrl: { path: 'icons', name: 'small_use' },
	// 	markdownFile: 'heal',
	// 	nextItem: 'death',
	// 	prevItem: 'fight'
	// },
	// {
	// 	id: 'death',
	// 	nameI18nKey: 'guide.sections.death',
	// 	nameImageUrl: { path: 'icons', name: 'small_delete' },
	// 	markdownFile: 'death',
	// 	nextItem: 'exp',
	// 	prevItem: 'heal'
	// },
	// {
	// 	id: 'exp',
	// 	nameI18nKey: 'guide.sections.exp',
	// 	nameImageUrl: { path: 'icons', name: 'small_xp' },
	// 	markdownFile: 'exp',
	// 	nextItem: 'missions',
	// 	prevItem: 'death'
	// },
	// {
	// 	id: 'missions',
	// 	nameI18nKey: 'guide.sections.missions',
	// 	nameImageUrl: { path: 'icons', name: 'small_gold' },
	// 	markdownFile: 'missions',
	// 	nextItem: 'status',
	// 	prevItem: 'exp'
	// },
	// {
	// 	id: 'status',
	// 	nameI18nKey: 'guide.sections.status',
	// 	nameImageUrl: { path: 'icons', name: 'small_edit' },
	// 	markdownFile: 'status',
	// 	nextItem: 'equipment',
	// 	prevItem: 'missions'
	// },
	// {
	// 	id: 'equipment',
	// 	nameI18nKey: 'guide.sections.equipment',
	// 	nameImageUrl: { path: 'status', name: 'fx_bckpck' },
	// 	markdownFile: 'equipment',
	// 	nextItem: 'epic',
	// 	prevItem: 'status'
	// },
	// {
	// 	id: 'epic',
	// 	nameI18nKey: 'guide.sections.epic',
	// 	nameImageUrl: { path: 'icons', name: 'small_mode' },
	// 	markdownFile: 'epic',
	// 	nextItem: 'group',
	// 	prevItem: 'equipment'
	// },
	// {
	// 	id: 'group',
	// 	nameI18nKey: 'guide.sections.group',
	// 	nameImageUrl: { path: 'icons', name: 'small_leader' },
	// 	markdownFile: 'group',
	// 	nextItem: 'ingredient',
	// 	prevItem: 'epic'
	// },
	// {
	// 	id: 'ingredient',
	// 	nameI18nKey: 'guide.sections.ingredient',
	// 	nameImageUrl: { path: 'status', name: 'fx_pelle' },
	// 	markdownFile: 'ingredient',
	// 	nextItem: 'clans',
	// 	prevItem: 'group'
	// },
	// {
	// 	id: 'clans',
	// 	nameI18nKey: 'guide.sections.clans',
	// 	nameImageUrl: { path: 'icons', name: 'small_leader' },
	// 	markdownFile: 'clans',
	// 	nextItem: 'dojo',
	// 	prevItem: 'ingredient'
	// },
	// {
	// 	id: 'dojo',
	// 	nameI18nKey: 'guide.sections.dojo',
	// 	nameImageUrl: { path: 'icons', name: 'small_dojo' },
	// 	markdownFile: 'dojo',
	// 	nextItem: 'gdc',
	// 	prevItem: 'clans'
	// },
	// {
	// 	id: 'gdc',
	// 	nameI18nKey: 'guide.sections.gdc',
	// 	nameImageUrl: { path: 'icons', name: 'small_attack' },
	// 	markdownFile: 'gdc',
	// 	nextItem: 'cdc',
	// 	prevItem: 'dojo'
	// },
	// {
	// 	id: 'cdc',
	// 	nameI18nKey: 'guide.sections.cdc',
	// 	nameImageUrl: { path: 'icons', name: 'small_attack' },
	// 	markdownFile: 'cdc',
	// 	nextItem: 'question',
	// 	prevItem: 'gdc'
	// },
	// {
	// 	id: 'question',
	// 	nameI18nKey: 'guide.sections.question',
	// 	nameImageUrl: { path: 'icons', name: 'small_mail' },
	// 	markdownFile: 'question',
	// 	nextItem: 'support',
	// 	prevItem: 'cdc'
	// },
	// {
	// 	id: 'support',
	// 	nameI18nKey: 'guide.sections.support',
	// 	nameImageUrl: { path: 'icons', name: 'small_browse_next' },
	// 	markdownFile: 'support',
	// 	nextItem: 'security',
	// 	prevItem: 'question'
	// },
	// {
	// 	id: 'security',
	// 	nameI18nKey: 'guide.sections.security',
	// 	nameImageUrl: { path: 'icons', name: 'small_lock' },
	// 	markdownFile: 'security',
	// 	prevItem: 'support'
	// }
];

export default defineComponent({
	name: 'Help',
	components: {
		TitleHeader,
		Markdown
	},
	data() {
		return {
			helpPageSections,
			selectedItemIndex: 0,
			markdownContent: '',
			localStore: localStore()
		};
	},
	computed: {
		selectedItem(): HelpPageConfig | null {
			return this.helpPageSections[this.selectedItemIndex] || null;
		},
		currentLanguage(): string {
			return this.localStore.getLanguage ?? 'fr';
		}
	},
	methods: {
		async loadMarkdownForCurrentItem() {
			if (!this.selectedItem) {
				this.markdownContent = '';
				return;
			}

			// Update URL hash without triggering navigation
			const sectionId = this.helpPageSections[this.selectedItemIndex].id;
			window.history.replaceState(null, '', `#${sectionId}`);

			try {
				const rawMarkdown = await loadHelpPageMarkdown(
					'helpPage',
					this.selectedItem.markdownFile,
					this.currentLanguage
				);
				
				// Process custom image syntax
				this.markdownContent = processMarkdownImages(rawMarkdown, this.getImgURL);
			} catch (error) {
				console.error('Error loading markdown:', error);
				this.markdownContent = '# Error\n\nFailed to load help content.';
			}
		},
		async showContent(index: number) {
			this.selectedItemIndex = index;
			await this.loadMarkdownForCurrentItem();
		},
		async showNextItem() {
			if (this.selectedItem?.nextItem) {
				const nextIndex = this.helpPageSections.findIndex(
					item => item.id === this.selectedItem?.nextItem
				);
				if (nextIndex !== -1) {
					await this.showContent(nextIndex);
				}
			}
		},
		async showPrevItem() {
			if (this.selectedItem?.prevItem) {
				const prevIndex = this.helpPageSections.findIndex(
					item => item.id === this.selectedItem?.prevItem
				);
				if (prevIndex !== -1) {
					await this.showContent(prevIndex);
				}
			}
		},
		getNextItem(): HelpPageConfig | undefined {
			if (!this.selectedItem?.nextItem) return undefined;
			return this.helpPageSections.find(item => item.id === this.selectedItem?.nextItem);
		},
		getPrevItem(): HelpPageConfig | undefined {
			if (!this.selectedItem?.prevItem) return undefined;
			return this.helpPageSections.find(item => item.id === this.selectedItem?.prevItem);
		},
		goToPage(pageName: string) {
			this.$router.push({ name: pageName });
		},
		async loadFromHash() {
			const hash = this.$route.hash.replace('#', '');
			
			if (hash) {
				// Find the section index by ID
				const sectionIndex = this.helpPageSections.findIndex(
					item => item.id === hash
				);
				
				if (sectionIndex !== -1) {
					this.selectedItemIndex = sectionIndex;
				} else {
					// Default to intro
					this.selectedItemIndex  = 0;
				}
			}
			
			// Load the markdown for the current (or default) section
			await this.loadMarkdownForCurrentItem();
		}
	},
	async mounted() {
		// Check if there's a hash in the URL to load a specific section
		await this.loadFromHash();
	},
	watch: {
		async currentLanguage() {
			await this.loadMarkdownForCurrentItem();
		},
		// Watch for hash changes in the URL
		'$route.hash': {
			async handler() {
				await this.loadFromHash();
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.intro {
	display: flex;
	margin-left: 10px;
	max-width: 95%;
	align-self: baseline;
	.menu {
		background-color: #e09b6244;
		border-radius: 5px;
		width: 220px;
		.list {
			color: rgb(142, 62, 38);
			cursor: pointer;
			font-variant: small-caps;
			font-weight: bold;
			list-style: none;
			margin-top: 6px;
			margin-left: 6px;
			& li:hover,
			& li.selected {
				color: #fce3bc;
				background-color: rgb(142, 62, 38);
			}
		}
	}
	.image {
		margin-top: auto;
		& img {
			max-width: 95%;
			height: auto;
		}
	}
}
.showContent {
	max-width: 95%;
	align-self: center;
	margin-top: 30px;
	.content {
		margin-top: 30px;
		.titleContent {
			height: fit-content;
			background-image: url('../assets/design/title_h1.webp');
			background-position: left bottom;
			background-repeat: no-repeat;
			padding-bottom: 22px;
			h3 {
				margin-left: 5px;
				color: #71b703;
				font-variant: small-caps;
			}
		}
		.markdown {
			margin-top: 15px;
			margin-left: 10px;

			// Headings styling
			:deep(h1),
			:deep(h2),
			:deep(h3),
			:deep(h4),
			:deep(h5),
			:deep(h6) {
				background-color: rgb(142, 62, 38);
				border-radius: 2px;
				color: #fff1ad;
				margin-bottom: 10px;
				// padding: 5px 10px;
			}

			// Paragraphs
			:deep(p) {
				margin: 10px 0;
				display: block;
			}

			// Strong and italic
			:deep(strong) {
				color: rgb(142, 62, 38);
			}

			:deep(i),
			:deep(em) {
				color: rgb(142, 62, 38);
			}

			// Images - inline by default
			:deep(img) {
				max-width: 100%;
				height: auto;
				vertical-align: middle;
				display: inline-block;
				margin: 0 5px 0 0;
			}
			
			// Images that are alone in a paragraph should be block-level
			:deep(p > img:only-child) {
				display: block;
			}

			// Lists
			:deep(ul),
			:deep(ol) {
				list-style: none;
				margin-top: 12px;
				padding-left: 0;
			}

			:deep(li) {
				margin-top: 10px;
				margin-left: 10px;
				padding-left: 30px;
				position: relative;
				// display: flex;
				// align-items: flex-start;
				// gap: 8px;
			}

			// Default bullet point using info_button image
			:deep(ul li::before) {
				content: '';
				position: absolute;
				left: 0;
				top: 7px;
				width: 7px;
				height: 7px;
				background-image: url('../assets/design/info_button.webp');
				background-size: 7px 7px;
				background-repeat: no-repeat;
				background-position: center;
				flex-shrink: 0;
			}

			// Hide default bullet when list item starts with an image
			:deep(li:has(> img:first-child)::before) {
				display: none;
			}

			// Style for custom bullet images (first child)
			:deep(li img:first-child) {
				flex-shrink: 0;
				margin-left: -30px;
				margin-right: 0;
				width: auto;
				height: auto;
			}

			// Links
			:deep(a) {
				color: #71b703;
				text-decoration: underline;
				
				&:hover {
					color: #fce3bc;
				}
			}

			// Code blocks
			:deep(code) {
				background-color: rgba(0, 0, 0, 0.2);
				padding: 2px 6px;
				border-radius: 3px;
				font-family: monospace;
			}

			:deep(pre) {
				background-color: rgba(0, 0, 0, 0.2);
				padding: 15px;
				border-radius: 5px;
				overflow-x: auto;
				
				code {
					background: none;
					padding: 0;
				}
			}

			// Blockquotes
			:deep(blockquote) {
				border-left: 4px solid rgb(142, 62, 38);
				padding-left: 15px;
				margin: 15px 0;
				font-style: italic;
				color: #fce3bc;
			}

			// Tables
			:deep(table) {
				width: 100%;
				border-collapse: collapse;
				margin: 15px 0;
			}

			:deep(th),
			:deep(td) {
				border: 1px solid rgb(142, 62, 38);
				padding: 8px;
				text-align: left;
			}

			:deep(th) {
				background-color: rgb(142, 62, 38);
				color: #fff1ad;
			}

			// Horizontal rules
			:deep(hr) {
				border: none;
				border-top: 2px solid rgb(142, 62, 38);
				margin: 20px 0;
			}
		}
		.next {
			background-image: url('../assets/button/button.webp');
			border: none;
			color: #fff1ad;
			font-variant: small-caps;
			font-weight: bold;
			text-align: center;
			height: 28px;
			width: 145px !important;
			background-repeat: no-repeat;
			font-size: 7pt;
			margin-left: 10px;
			margin-right: 10px;
			margin-top: 20px;
			cursor: pointer;
			&:hover {
				color: white;
				background-image: url('../assets/button/button_hover.webp');
			}
		}
	}
}
</style>