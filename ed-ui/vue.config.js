/* eslint-disable */
const STATIC_DIR = 'static';

module.exports = {
	assetsDir: STATIC_DIR,
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
	},
	chainWebpack(config) {
		config.module
			.rule('swf')
			.test(/\.swf$/)
			.use('file-loader')
			.loader('file-loader')
			.options({
				name: `${STATIC_DIR}/swf/[name].[hash:8].[ext]`
			});

		config
			.plugin('define')
			.tap(args => {
				args[0]['process.env']['VERSION'] = JSON.stringify(require('./package.json').version);
				return args;
			});
	}
};
