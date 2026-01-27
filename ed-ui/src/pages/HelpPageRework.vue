<template>
	<TitleHeader :title="`${$t('pageTitle.guide')}`" :header="$t(`topBar.rightMenu.guide`)" />
	<div v-if="isLoading" class="loading">Loading...</div>
	<div v-else>
		<div class="intro">
			<div class="menu">
				<ul class="list">
					<li
						v-for="(section, index) in helpPageSections"
						:key="section.id"
						@click="showContent(index)"
						:class="{ selected: selectedSectionIndex === index }"
					>
						<img 
							v-if="section.metadata.icon" 
							:src="getImgURL(section.metadata.icon.path, section.metadata.icon.name)" 
							alt="Icon" 
						/>
						{{ $t(`guide.sections.${section.id}`) }}
					</li>
				</ul>
			</div>
			<div class="image">
				<img :src="getImgURL('design', 'rocky_01')" />
			</div>
		</div>
		<div class="showContent">
			<div v-if="selectedSection" class="content">
				<div class="markdown">
					<Markdown :source="markdownContent" />
				</div>
				<DZButton @click="showPrevItem" class="next" v-if="hasPrevious">
					<img :src="getImgURL('icons', 'small_page_up')" />
					{{ $t(`guide.sections.${helpPageSections[selectedSectionIndex - 1].id}`) }}
				</DZButton>
				<DZButton @click="showNextItem" class="next" v-if="hasNext">
					<img :src="getImgURL('icons', 'small_page_down')" />
					{{ $t(`guide.sections.${helpPageSections[selectedSectionIndex + 1].id}`) }}
				</DZButton>
				<RouterLink to="/news" class="link">
					<DZButton class="next"><img :src="getImgURL('icons', 'small_delete')" />{{ $t('guide.text.stop') }}</DZButton>
				</RouterLink>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import DZButton from '../components/common/DZButton.vue';
import Markdown from 'vue3-markdown-it';
import {MarkdownWithMetadata, loadAllHelpPages, processMarkdownImages } from '../utils/markdownLoader';
import { localStore } from '../store/index';


// export interface HelpPageSection {
// 	id: string;
// 	nameImageUrl?: { path: string; name: string };
// }

// // Minimal configuration - just the unique data per section
// export const helpPageSections: Record<string, HelpPageSection> = {
// 	intro: { id: 'intro', nameImageUrl: { path: 'icons', name: 'small_home' } },
// 	adopt: { id: 'adopt', nameImageUrl: { path: 'design', name: 'small_member' } },
// 	name: { id: 'name', nameImageUrl: { path: 'icons', name: 'small_question' } },
// 	card: { id: 'card', nameImageUrl: { path: 'status', name: 'fx_ccard' } },
// 	move: { id: 'move', nameImageUrl: { path: 'icons', name: 'small_follow' } },
// 	fight: { id: 'fight', nameImageUrl: { path: 'icons', name: 'small_fire' } },
// 	heal: { id: 'heal', nameImageUrl: { path: 'icons', name: 'small_use' } },
// 	death: { id: 'death', nameImageUrl: { path: 'icons', name: 'small_delete' } },
// 	exp: { id: 'exp', nameImageUrl: { path: 'icons', name: 'small_xp' } },
// 	missions: { id: 'missions', nameImageUrl: { path: 'icons', name: 'small_gold' } },
// 	status: { id: 'status', nameImageUrl: { path: 'icons', name: 'small_edit' } },
// 	equipment: { id: 'equipment', nameImageUrl: { path: 'status', name: 'fx_bckpck' } },
// 	epic: { id: 'epic', nameImageUrl: { path: 'icons', name: 'small_mode' } },
// 	group: { id: 'group', nameImageUrl: { path: 'icons', name: 'small_leader' } },
// 	ingredient: { id: 'ingredient', nameImageUrl: { path: 'status', name: 'fx_pelle' } },
// 	clans: { id: 'clans', nameImageUrl: { path: 'icons', name: 'small_leader' } },
// 	dojo: { id: 'dojo', nameImageUrl: { path: 'icons', name: 'small_dojo' } },
// 	gdc: { id: 'gdc', nameImageUrl: { path: 'icons', name: 'small_attack' } },
// 	cdc: { id: 'cdc', nameImageUrl: { path: 'icons', name: 'small_attack' } },
// 	question: { id: 'question', nameImageUrl: { path: 'icons', name: 'small_mail' } },
// 	support: { id: 'support', nameImageUrl: { path: 'icons', name: 'small_browse_next' } },
// 	security: { id: 'security', nameImageUrl: { path: 'icons', name: 'small_lock' } }
// };

// Order of sections (this defines prev/next automatically)
// export const helpPageOrder = [
// 	'intro', 'adopt', 'name', 'card', 'move', 'fight', 'heal', 'death',
// 	'exp', 'missions', 'status', 'equipment', 'epic', 'group', 'ingredient',
// 	'clans', 'dojo', 'gdc', 'cdc', 'question', 'support', 'security'
// ];

export default defineComponent({
	name: 'Help',
	components: {
		TitleHeader,
		DZButton,
		Markdown
	},
	data() {
		return {
			helpPageSections: [] as Array<MarkdownWithMetadata>,
			isLoading: false,
			// helpPageOrder,
			// currentMetadata: {} as MarkdownMetadata,
			selectedSectionIndex: 0,
			markdownContent: '',
			localStore: localStore()
		};
	},
	computed: {
		selectedSectionId(): string {
        	return this.helpPageSections[this.selectedSectionIndex].id ?? '';
		},
		selectedSection(): MarkdownWithMetadata | null {
			return this.helpPageSections[this.selectedSectionIndex] || null ;
		},
		hasPrevious(): boolean {
			return this.selectedSectionIndex > 0;
		},
		hasNext(): boolean {
			return this.selectedSectionIndex < this.helpPageSections.length - 1;
		}
	},
	methods: {
		// async loadMarkdownForCurrentItem() {
		// 	if (!this.selectedSection) {
		// 		this.markdownContent = '';
		// 		return;
		// 	}

		// 	try {
		// 		const { content, metadata } =  await loadHelpPageMarkdown(
		// 			'helpPage',
		// 			this.selectedSectionId,
		// 			this.localStore.getLanguage ?? 'fr'
		// 		);
				
		// 		this.currentMetadata = metadata;
		// 		// Process custom image syntax
		// 		this.markdownContent = processMarkdownImages(content, this.getImgURL);
		// 	} catch (error) {
		// 		console.error('Error loading markdown:', error);
		// 		this.markdownContent = '# Error\n\nFailed to load help content.';
		// 	}
		// },
		async loadAllSections() {
			this.isLoading = true;
			try {
				// Load all markdown files for the current language
				const pages = await loadAllHelpPages(this.localStore.getLanguage ?? 'fr');
				
				// Process images for each page
				this.helpPageSections = pages.map(page => ({
					...page,
					content: processMarkdownImages(page.content, this.getImgURL)
				}));

				// // Load all markdown files
				// for (const sectionId of helpPageSections) {
				// 	const { content, metadata } = await loadHelpPageMarkdown(
				// 		'helpPage',
				// 		sectionId,
				// 		this.localStore.getLanguage ?? 'fr'
				// 	);
					
				// 	loadedSections.push({
				// 		id: sectionId,
				// 		metadata,
				// 		content: processMarkdownImages(content, this.getImgURL)
				// 	});
				// }
				
				// Sort by order from frontmatter
				this.helpPageSections.sort((a, b) => {
					const orderA = a.metadata.order ?? 999;
					const orderB = b.metadata.order ?? 999;
					return orderA - orderB;
				});
				

				console.log(`Loaded ${this.helpPageSections.length} sections`);
				
				this.isLoading = false;
			} catch (error) {
				console.error('Error loading help sections:', error);
				this.isLoading = false;
			}
		},
		async showContent(index: number) {
			this.selectedSectionIndex = index;
			// await this.loadMarkdownForCurrentItem();
			// Update URL hash without triggering navigation
			const sectionId = this.helpPageSections[index].id;
			this.$router.replace({ hash: `#${sectionId}` });
		},
		async showNextItem() {
			if (this.hasNext) {
				await this.showContent(this.selectedSectionIndex + 1);
			}
		},
		async showPrevItem() {
			if (this.hasPrevious) {
				await this.showContent(this.selectedSectionIndex - 1);
			}
		},
		async loadFromHash() {
			const hash = this.$route.hash.replace('#', '');
			
			if (hash) {
				// Find the section index by ID
				const sectionIndex = this.helpPageSections.findIndex(
					section => section.id === hash
				);;
				
				if (sectionIndex !== -1) {
					this.selectedSectionIndex = sectionIndex;
				} else {
					// Default to intro
					this.selectedSectionIndex = 0;
				}
			}

			// Load the markdown for the current (or default) section
			// await this.loadMarkdownForCurrentItem();
		}
	},
	async mounted() {
		// Load all sections on mount
		await this.loadAllSections();
		// Check if there's a hash in the URL to load a specific section
		this.loadFromHash();
	},
	unmounted() {
		this.$router.replace({ hash: '' });
	},
	watch: {
		'localStore.getLanguage': {
			async handler() {
				await this.loadAllSections();
			}
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
		.next {
			font-variant: small-caps;
			font-weight: bold;
			text-align: center;
			height: 28px;
			width: 145px !important;
			font-size: 7pt;
			margin-left: 10px;
			margin-right: 10px;
			margin-top: 20px;
		}
		.markdown {
			margin-top: 15px;
			margin-left: 10px;

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

			// Headings styling
			:deep(h1) {
				height: fit-content;
				background-image: url('../assets/design/title_h1.webp');
				background-position: left bottom;
				background-repeat: no-repeat;
				padding-bottom: 22px;
				padding-left: 5px;
				color: #71b703;
				font-variant: small-caps;
				font-size: 20px;
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
	}
}
</style>
