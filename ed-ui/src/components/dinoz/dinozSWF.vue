<template>
	<div id="dinozSWF">
		<div id="myDino">
			<object
				type="application/x-shockwave-flash"
				:data="url"
				:width="width"
				:height="height"
			>
				<param name="movie" :value="url" />
				<param
					v-for="(value, key) in params"
					:key="key"
					:name="key"
					:value="value"
				/>
				<param name="flashvars" :value="serialize(flashVars)" />

				<embed
					:src="url"
					type="application/x-shockwave-flash"
					v-bind="params"
					:flashvars="serialize(flashVars)"
					quality="high"
					width="100%"
					height="100%"
				/>
			</object>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { url } from '@/utils/constants';

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
		type: String
	},
	data() {
		return {
			url: '' as string,
			flashVars: {
				data: '',
				chk: 0,
				damages: 0,
				flip: 0
			} as FlashVars,
			params: {
				allowScriptAccess: 'always' as string,
				bgcolor: '#fce3bb' as string,
				menu: 'false' as string,
				scale: 'noscale' as string,
				wmode: 'transparent' as string
			}
		};
	},
	methods: {
		serialize(obj: FlashVars): string {
			const str: Array<string> = [];
			for (const p in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, p)) {
					str.push(
						encodeURIComponent(p) +
							'=' +
							encodeURIComponent(obj[p as keyof FlashVars])
					);
				}
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
		// Set params bgColor and wmode if needed
		this.params.bgcolor = this.bgColor ? this.bgColor : this.params.bgcolor;
		this.params.wmode = this.wmode ? this.wmode : this.params.wmode;

		// Set URL to get swf
		this.url = this.type === 'dino' ? url.dinozSWF : url.sDinozSWF;

		// Set flashVars
		this.flashVars.data = this.display!;
		this.flashVars.flip = this.flip ? this.flip : this.flashVars.flip;

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

interface FlashVars {
	data: string;
	chk: number;
	damages: number;
	flip: number;
}
</script>
