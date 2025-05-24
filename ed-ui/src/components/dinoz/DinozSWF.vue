<template>
	<div>
		<a @click="displayMe = !displayMe" class="asyncDinoz" v-if="shop && !displayMe">{{ $t(`alpha.shop`) }}</a>
		<div v-if="displayMe" class="swf" :class="shop ? 'shop' : ''">
			<object type="application/x-shockwave-flash" :data="url" :width="width" :height="height">
				<param name="movie" :value="url" />
				<param v-for="(value, key) in params" :key="key" :name="key" :value="value" />
				<param name="flashvars" :value="serialize(flashVars)" />

				<embed :src="url" v-bind="params" :flashvars="serialize(flashVars)" quality="high" width="100%" height="100%" />
			</object>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import dinozSwf from '../../assets/swf/dino.swf';
import sdinozSwf from '../../assets/swf/sdino.swf';

export default defineComponent({
	name: 'DinozSWF',
	props: {
		display: String,
		attrs: Object,
		bgColor: String,
		wmode: String,
		flip: Number,
		width: Number,
		height: Number,
		type: String,
		shop: Boolean,
		isFrozen: Boolean
	},
	data() {
		return {
			url: '' as string,
			flashVars: {
				data: '',
				chk: 0,
				damages: 0
			} as FlashVars,
			params: {
				allowScriptAccess: 'always' as string,
				bgcolor: '#fce3bb' as string,
				menu: 'false' as string,
				scale: 'noscale' as string,
				wmode: 'transparent' as string
			},
			displayMe: false as boolean
		};
	},
	methods: {
		serialize(obj: FlashVars): string {
			const str: Array<string> = [];
			for (const [key, value] of Object.entries(obj)) {
				if (!(key === 'flip' && value === -1)) str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
			}
			return str.join('&');
		},
		decode62(n: number): number {
			if (n >= 48 && n <= 58) {
				return n - 48;
			}
			if (n >= 65 && n <= 90) {
				return n - 65 + 10;
			}
			if (n >= 97 && n <= 122) {
				return n - 97 + 36;
			}
			return 63;
		}
	},
	mounted(): void {
		if (!this.shop) this.displayMe = true;
		// Set params bgColor and wmode if needed
		this.params.bgcolor = this.bgColor ?? this.params.bgcolor;
		this.params.wmode = this.wmode ?? this.params.wmode;

		// Set URL to get swf
		this.url = this.type === 'dino' ? dinozSwf : sdinozSwf;

		// Set flashVars
		this.flashVars.data = this.display ?? '';
		this.flashVars.flip = this.flip ?? this.flashVars.flip;
		if (this.isFrozen) this.flashVars.status = 'congel';

		// Decode CHK
		let decodedData = 0;
		const dataList: Array<number> = [];
		let i = -1 as number;
		while (++i < this.flashVars.data.length) {
			let realCharCode = this.decode62(this.flashVars.data.charCodeAt(i));
			dataList.push(realCharCode);
			// Lai nombre magique c supaire
			realCharCode = realCharCode ^ ((realCharCode >> 3) & 11795912);
			realCharCode = (realCharCode << 2) + realCharCode + (realCharCode & 255);
			decodedData = ((decodedData * 5) ^ realCharCode) & 268435455;
		}
		this.flashVars.chk = decodedData;
	}
});

type FlashVars = {
	data: string;
	chk: number;
	damages: number;
	flip?: number;
	status?: string;
};
</script>

<style lang="scss" scoped>
.asyncDinoz {
	z-index: 1000;
	height: 24px;
	color: #fff1ad;
	width: 135px;
	position: absolute;
	top: 35px;
	left: 25px;
	background-image: url('../../assets/button/button.webp');
	display: block;
	margin-top: 3px;
	margin-bottom: 2px;
	padding-left: 10px;
	padding-top: 4px;
	font-variant: small-caps;
	font-size: 10pt;
	font-weight: bold;
	text-decoration: none;
	text-align: left;
	cursor: pointer;
	background-repeat: no-repeat;
	border-radius: 0px;
	&:hover {
		color: white;
		background-image: url('../../assets/button/button_hover.webp');
		background-color: transparent;
	}
}
.shop {
	top: 10px;
}

.avatar {
	position: absolute;
	margin-left: 5px;
	margin-top: 25px;
}
</style>
