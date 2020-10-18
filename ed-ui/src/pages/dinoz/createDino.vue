<template>
	<div id="createDinoz">
        <div id="myDino">
	        <object type="application/x-shockwave-flash" :data="url" width="195" height="160">
	            <param name="movie" :value="url">
	            <param v-for="(value, key) in params" :name="key" :value="value">
	            <param name="flashvars" :value="serialize(flashVars)">

	            <embed :src="url" type="application/x-shockwave-flash" v-bind="params" :flashvars="serialize(flashVars)" quality="high" width=100% height=100% />
	        </object>
	        <p>data : {{ flashVars.data }}</p>
	        <p>chk : {{ flashVars.chk }}</p>
		</div>

		<!--<div>
			<input type="text" :value="getLetter(0)" />
			<button @click="decrease(0)">-</button>
			<button @click="increase(0)">+</button>
		</div>

		<div>
			<input type="text" :value="getLetter(1)" />
			<button @click="decrease(1)">-</button>
			<button @click="increase(1)">+</button>
		</div>

		<div>
			<input type="text" :value="getLetter(2)" />
			<button @click="decrease(2)">-</button>
			<button @click="increase(2)">+</button>
		</div>

		<div>
			<input type="text" :value="getLetter(3)" />
			<button @click="decrease(3)">-</button>
			<button @click="increase(3)">+</button>
		</div>

		<div>
			<input type="text" :value="getLetter(4)" />
			<button @click="decrease(4)">-</button>
			<button @click="increase(4)">+</button>
		</div>

		<div>
			<input type="text" :value="getLetter(5)" />
			<button @click="decrease(5)">-</button>
			<button @click="increase(5)">+</button>
		</div>

		<div>
			<input type="text" :value="getLetter(6)" />
			<button @click="decrease(6)">-</button>
			<button @click="increase(6)">+</button>
		</div>

		<div>
			<input type="text" :value="getLetter(7)" />
			<button @click="decrease(7)">-</button>
			<button @click="increase(7)">+</button>
		</div>

		<div>
			<input type="text" :value="getLetter(8)" />
			<button @click="decrease(8)">-</button>
			<button @click="increase(8)">+</button>
		</div>

		<div>
			<input type="text" :value="getLetter(9)" />
			<button @click="decrease(9)">-</button>
			<button @click="increase(9)">+</button>
		</div>

		<div>
			<input type="text" :value="getLetter(10)" />
			<button @click="decrease(10)">-</button>
			<button @click="increase(10)">+</button>
		</div>

		<div>
			<input type="text" :value="getLetter(11)" />
			<button @click="decrease(11)">-</button>
			<button @click="increase(11)">+</button>
		</div>

		<div>
			<input type="text" :value="getLetter(12)" />
			<button @click="decrease(12)">-</button>
			<button @click="increase(12)">+</button>
		</div>

		<div>
			<input type="text" :value="getLetter(13)" />
			<button @click="decrease(13)">-</button>
			<button @click="increase(13)">+</button>
		</div>

		<div>
			<input type="text" :value="getLetter(14)" />
			<button @click="decrease(14)">-</button>
			<button @click="increase(14)">+</button>
		</div>

		<div>
			<input type="text" :value="getLetter(15)" />
			<button @click="decrease(15)">-</button>
			<button @click="increase(15)">+</button>
		</div>-->
	</div>
</template>

<script>
	export default {
		name: 'createDino',
		data() {
			return {
				params: {
		          allowScriptAccess: 'always',
		          bgcolor: '#fce3bb',
		          menu: 'false',
		          scale: 'noscale',
		          wmode: 'visible'
		        },
		        flashVars: {
		          data: 'BASF4hxg31OWC000',
		          chk: 145305914,
		          damages: 0,
		          flip: 1
        		},
        		width: 190,
        		height: 165,
        		url: 'http://data.dinorpg.com/swf/dino.swf',
        		version: '8'
			}
		},
		created() {
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
            getLetter(index) {
            	return this.flashVars.data.charAt(index);
            },
            decrease(index) {
            	var letterWanted = this.flashVars.data.charCodeAt(index);
            	letterWanted --;
            	letterWanted = letterWanted === 64 ? 57 : letterWanted;
            	letterWanted = letterWanted === 96 ? 90 : letterWanted;
            	letterWanted = letterWanted === 47 ? 122 : letterWanted;
            	var newData = this.flashVars.data.substring(0, index) + String.fromCharCode(letterWanted) + this.flashVars.data.substring(index + 1, this.flashVars.data.length);
            	this.flashVars.data = newData;
            },
            increase(index) {
            	var letterWanted = this.flashVars.data.charCodeAt(index);
            	letterWanted ++;
            	letterWanted = letterWanted === 58 ? 65 : letterWanted;
            	letterWanted = letterWanted === 91 ? 97 : letterWanted;
            	letterWanted = letterWanted === 123 ? 48 : letterWanted;
            	var newData = this.flashVars.data.substring(0, index) + String.fromCharCode(letterWanted) + this.flashVars.data.substring(index + 1, this.flashVars.data.length);
            	this.flashVars.data = newData;
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
