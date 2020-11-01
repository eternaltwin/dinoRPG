import Vue from 'vue';

// Add point into number (ex: 2634000 -> 2.634.000)
Vue.filter('beautifulNumber', function(number) {
	var newNumber = '';
	for (var i = 0; i < number.length; i++) {
		newNumber += number[i];
		if (i % 3 === 0 && i !== number.length - 1) {
			newNumber += '.';
		}
	}
	return newNumber;
});
