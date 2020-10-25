<template>
	<div id="createDinoz">
        <div id="myDino">
	        <object type="application/x-shockwave-flash" :data="url" width="195" height="160">
	            <param name="movie" :value="url">
	            <param v-for="(value, key) in params" :name="key" :value="value">
	            <param name="flashvars" :value="serialize(flashVars)">

	            <embed :src="url" type="application/x-shockwave-flash" v-bind="params" :flashvars="serialize(flashVars)" quality="high" width=100% height=100% />
	        </object>
		</div>
	</div>
</template>

<script>
import Constants from '@/Constants.js';

	export default {
		props: {
			display: String,
			attrs: Object,
			bgColor: String,
			wmode: String,
			flip: Number
		},
		data() {
			return {
				url : '',
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
			}
		},
		created() {
			// Set params bgColor and wmode if needed
			this.params.bgcolor = this.bgColor ? this.bgColor : this.params.bgcolor;
			this.params.wmode = this.wmode ? this.wmode : this.params.wmode;

			// Set URL to get swf
			this.url = Constants.getDinozSWF();

			// Set flashVars
			this.flashVars.data = this.display;
			this.flashVars.flip = this.flip ? this.flip : this.flashVars.flip;

			// Decode CHK
			let decoded_data = 0,      
			data_list = [],            
			i = -1;   
			while(++i < this.flashVars.data.length) {          
			 let real_char_code = this.decode62(this.flashVars.data.charCodeAt(i));
			    data_list.push(real_char_code);           // Lai nombre magique c supaire
			    real_char_code = real_char_code ^ real_char_code >> 3 & 11795912;
			    real_char_code = (real_char_code << 2) + real_char_code + (real_char_code & 255);
			    decoded_data = (decoded_data * 5 ^ real_char_code) & 268435455;
			 }
			this.flashVars.chk = decoded_data;
		},
        methods: {
            serialize(obj) {
                var str = [];
                for (var p in obj)
                    if (obj.hasOwnProperty(p)) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                return str.join("&");
            },
            decode62(n) {
				if(n >= 48 && n <= 58) {
				  return n - 48;
				}
				if(n >= 65 && n <= 90) {   
				  return n - 65 + 10;
				}
				if(n >= 97 && n <= 122) {
				  return n - 97 + 36;
				}
				return 63;
			}
        }
	}
</script>

<style>

</style>
