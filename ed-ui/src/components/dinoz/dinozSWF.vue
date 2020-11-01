<template>
	<div id="createDinoz">
		<div id="myDino">
			<object type="application/x-shockwave-flash" :data="url" :width="width" :height="height">
				<param name="movie" :value="url">
				<param v-for="(value, key) in params" :key="key" :name="key" :value="value">
				<param name="flashvars" :value="serialize(flashVars)">

				<embed :src="url" type="application/x-shockwave-flash" v-bind="params" :flashvars="serialize(flashVars)" quality="high" width=100% height=100% />
			</object>
		</div>
	</div>
</template>

<script>
import Constants from '@/helpers/Constants.js';

export default {
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
			url: '',
			flashVars: {
				data: '',
				chk: 0,
				damages: 0,
				flip: null
			},
			params: {
				allowScriptAccess: 'always',
				bgcolor: '#fce3bb',
				menu: 'false',
				scale: 'noscale',
				wmode: 'transparent'
			}
		};
	},
	created() {
		// Set params bgColor and wmode if needed
		this.params.bgcolor = this.bgColor ? this.bgColor : this.params.bgcolor;
		this.params.wmode = this.wmode ? this.wmode : this.params.wmode;

		// Set URL to get swf
		this.url = this.type === 'dino' ? Constants.getDinoSWF() : Constants.getSDinoSWF();

		// Set flashVars
		this.flashVars.data = this.display;
		this.flashVars.flip = this.flip ? this.flip : this.flashVars.flip;

		// Decode CHK
		let decodedData = 0;
		let dataList = [];
		let i = -1;
		while (++i < this.flashVars.data.length) {
			let realCharCode = this.decode62(this.flashVars.data.charCodeAt(i));
			dataList.push(realCharCode);
			// Lai nombre magique c supaire
			realCharCode = realCharCode ^ realCharCode >> 3 & 11795912;
			realCharCode = (realCharCode << 2) + realCharCode + (realCharCode & 255);
			decodedData = (decodedData * 5 ^ realCharCode) & 268435455;
		}
		this.flashVars.chk = decodedData;
	},
	methods: {
		serialize(obj) {
			var str = [];
			for (var p in obj) {
				if (obj.hasOwnProperty(p)) {
					str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
				}
			}
			return str.join('&');
		},
		decode62(n) {
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
	}
};
</script>

<style>
</style>
