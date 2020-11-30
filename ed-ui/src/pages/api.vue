<template>
	<div id="api">
		<div id="attention">
			<span><strong>Warning</strong> !<br><br>

			When you will press the "Get account data" button, this one will be disabled. You'll see no loading bar during this process, please do not close this tab. <br>

			Once your account's data will be get, a message is gonna appear below this button. You'll be able to see your account data by opening your console (press F12 or right click -> Inspect)</span>
		</div>
		<br>
		<div>
			<input type="text" name="cookie" v-model="cookie">
			<button :disabled="!buttonClickable" @click="getAccountData()">Get account data</button>
		</div>
		<br>
		<div id="attention" v-if="erreurMessage">
			{{ erreurMessage }}
		</div>
		<div id="reussite" v-if="reussite">
			Your account recovery is a success.
		</div>
	</div>
</template>

<script>
import DataService from '@/services/DataService';

export default {
	data() {
		return {
			cookie: null,
			buttonClickable: true,
			noCookie: false,
			wrongCookie: false,
			erreurMessage: null,
			reussite: false
		};
	},
	props: {
		code: String
	},
	created() {
		this.$emit('hideButton');
	},
	methods: {
		getAccountData() {
			if (this.cookie) {
				this.buttonClickable = false;
				DataService.getApiData(this.code, this.cookie)
					.then(res => {
						this.reussite = true;
						console.log(res.data);
					}).catch(err => {
						this.erreurMessage = err.response.data.message;
						this.buttonClickable = true;
					});
			} else {
				this.noCookie = true;
				this.erreurMessage = 'Please put a valid cookie here';
			}
		}
	}
};
</script>

<style>
#attention {
	color: #FF0000;
	border-width: 1px;
	border-style: solid;
	border-color: red;
	padding-top: 5px;
	padding-bottom: 5px;
	border-radius: 10px;
	text-align: center;
}

div {
	text-align: center;
}

#reussite {
	color: #00FF00;
	border-width: 1px;
	border-style: solid;
	border-color: green;
	padding-top: 5px;
	padding-bottom: 5px;
	border-radius: 10px;
	text-align: center;
}
</style>
