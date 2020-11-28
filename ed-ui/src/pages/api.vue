<template>
	<div id="api">
		<div id="attention">
			<span>Attention ! <br> Les développeurs sont des feignants. <br> <br> Une fois que vous aurez appuyé sur ce bouton, celui-ci va se désactiver. Il n'y aura pas de barre de chargement pour indiquer où en est la récupération de votre compte</span>
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
			La récupération de votre compte est une réussite ! Pour voir vos données collectées, ouvrez la console (F12 ou clic droit -> inspecter)
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
				this.erreurMessage = 'Merci de bien vouloir renseigner un cookie';
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
