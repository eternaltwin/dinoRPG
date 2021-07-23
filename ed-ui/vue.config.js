module.exports = {
	lintOnSave: true,
	transpileDependencies: ['vuex-persist'],
	css: {
		loaderOptions: {
			// pass options to sass-loader
			// @/ is an alias to src/
			// so this assumes you have a file named src/variables.sass
			// Note: this option is named as "additionalData" in sass-loader v9
			sass: {
				additionalData: `
                  @import "./src/css/_mixins.scss";
              `
			}
		}
	}
};
