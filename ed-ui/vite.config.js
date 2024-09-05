import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const STATIC_DIR = 'public';

export default defineConfig(() => {
	return {
		plugins: [vue()],
		publicDir: STATIC_DIR,
		resolve: {
			extensions: ['.js', '.ts', '.json', '.vue']
		},
		css: {
			preprocessorOptions: {
				scss: { additionalData: `@import "./src/css/_mixins.scss";` }
			}
		},
		server: {
			port: 8080
		},
		define: {
			['import.meta.env.VERSION']: JSON.stringify(require('./package.json').version)
		},
		build: {
			target: 'esnext',
			rollupOptions: {
				output: {
					manualChunks(id) {
						// Chunk 'dino-animation' pour les imports depuis '@drpg/dino-animation'
						if (id.includes('dinoAnimation/src/smonster')) {
							if (id.includes('goupi')) {
								return 'monster-goupi';
							}
							if (id.includes('goupi2')) {
								return 'monster-goupi2';
							}
							if (id.includes('goupi3')) {
								return 'monster-goupi3';
							}
							if (id.includes('wolf')) {
								return 'monster-wolf';
							}
							if (id.includes('gluon')) {
								return 'monster-gluon';
							}
							if (id.includes('gvert')) {
								return 'monster-gvert';
							}
							if (id.includes('coq')) {
								return 'monster-coq';
							}
							if (id.includes('flam')) {
								return 'monster-flam';
							}
							if (id.includes('goblin')) {
								return 'monster-goblin';
							}
							if (id.includes('korgon')) {
								return 'monster-korgon';
							}
							if (id.includes('rkrgns')) {
								return 'monster-rkrgns';
							}
							if (id.includes('kmask')) {
								return 'monster-kmask';
							}
							if (id.includes('borg')) {
								return 'monster-borg';
							}
							if (id.includes('pira')) {
								return 'monster-pira';
							}
							if (id.includes('anguil')) {
								return 'monster-anguil';
							}
							if (id.includes('kazka')) {
								return 'monster-kazka';
							}
							if (id.includes('ronciv')) {
								return 'monster-ronciv';
							}
							if (id.includes('grdien')) {
								return 'monster-grdien';
							}
							if (id.includes('bat')) {
								return 'monster-bat';
							}
							if (id.includes('ewater')) {
								return 'monster-ewater';
							}
							if (id.includes('efire')) {
								return 'monster-efire';
							}
							if (id.includes('eearth')) {
								return 'monster-eearth';
							}
							if (id.includes('rasca')) {
								return 'monster-rasca';
							}
							if (id.includes('vener')) {
								return 'monster-vener';
							}
							if (id.includes('barche')) {
								return 'monster-barche';
							}
							if (id.includes('cobra')) {
								return 'monster-cobra';
							}
							if (id.includes('hippo')) {
								return 'monster-hippo';
							}
							if (id.includes('rocky')) {
								return 'monster-rocky';
							}
							if (id.includes('pteroz')) {
								return 'monster-pteroz';
							}
							if (id.includes('egrllz')) {
								return 'monster-egrllz';
							}
							if (id.includes('scorp')) {
								return 'monster-scorp';
							}
							if (id.includes('brig1')) {
								return 'monster-brig1';
							}
							if (id.includes('brig2')) {
								return 'monster-brig2';
							}
							if (id.includes('brig3')) {
								return 'monster-brig3';
							}
							if (id.includes('piraos')) {
								return 'monster-piraos';
							}
							if (id.includes('worm')) {
								return 'monster-worm';
							}
							if (id.includes('wteamc')) {
								return 'monster-wteamc';
							}
							if (id.includes('towgrd')) {
								return 'monster-towgrd';
							}
							if (id.includes('bamboo')) {
								return 'monster-bamboo';
							}
							if (id.includes('worm2')) {
								return 'monster-worm2';
							}
							if (id.includes('cactus')) {
								return 'monster-cactus';
							}
							if (id.includes('yakuzi')) {
								return 'monster-yakuzi';
							}
							if (id.includes('igor')) {
								return 'monster-igor';
							}
							if (id.includes('gropi')) {
								return 'monster-gropi';
							}
							if (id.includes('mantoo')) {
								return 'monster-mantoo';
							}
							if (id.includes('mosqui')) {
								return 'monster-mosqui';
							}
							if (id.includes('muking')) {
								return 'monster-muking';
							}
							if (id.includes('mugard')) {
								return 'monster-mugard';
							}
							if (id.includes('singmu')) {
								return 'monster-singmu';
							}
							if (id.includes('frutox')) {
								return 'monster-frutox';
							}
							if (id.includes('ffrutx')) {
								return 'monster-ffrutx';
							}
							if (id.includes('frking')) {
								return 'monster-frking';
							}
							if (id.includes('rapaca')) {
								return 'monster-rapaca';
							}
							if (id.includes('morg')) {
								return 'monster-morg';
							}
							if (id.includes('mandragore')) {
								return 'monster-mandragore';
							}
							if (id.includes('cyclo')) {
								return 'monster-cyclo';
							}
							if (id.includes('cyclo2')) {
								return 'monster-cyclo2';
							}
							if (id.includes('groms')) {
								return 'monster-groms';
							}
							if (id.includes('grom2')) {
								return 'monster-grom2';
							}
							if (id.includes('grom3')) {
								return 'monster-grom3';
							}
							if (id.includes('doro')) {
								return 'monster-doro';
							}
							if (id.includes('dorou')) {
								return 'monster-dorou';
							}
							if (id.includes('lucet')) {
								return 'monster-lucet';
							}
							if (id.includes('lapouf')) {
								return 'monster-lapouf';
							}
							if (id.includes('ecu')) {
								return 'monster-ecu';
							}
							if (id.includes('piglou')) {
								return 'monster-piglou';
							}
							if (id.includes('febrez')) {
								return 'monster-febrez';
							}
							if (id.includes('marca')) {
								return 'monster-marca';
							}
							if (id.includes('dorolu')) {
								return 'monster-dorolu';
							}
							if (id.includes('fuego')) {
								return 'monster-fuego';
							}
							if (id.includes('grizor')) {
								return 'monster-grizor';
							}
							if (id.includes('morg2')) {
								return 'monster-morg2';
							}
							if (id.includes('grizo2')) {
								return 'monster-grizo2';
							}
							if (id.includes('grizo3')) {
								return 'monster-grizo3';
							}
							if (id.includes('garouz')) {
								return 'monster-garouz';
							}
							if (id.includes('amanpe')) {
								return 'monster-amanpe';
							}
							if (id.includes('upgrd')) {
								return 'monster-upgrd';
							}
							if (id.includes('taurus')) {
								return 'monster-taurus';
							}
							if (id.includes('bao')) {
								return 'monster-bao';
							}
							if (id.includes('sofia')) {
								return 'monster-sofia';
							}
							if (id.includes('chima')) {
								return 'monster-chima';
							}
							if (id.includes('groule')) {
								return 'monster-groule';
							}
							if (id.includes('behemu')) {
								return 'monster-behemu';
							}
							if (id.includes('serpe')) {
								return 'monster-serpe';
							}
							if (id.includes('roking')) {
								return 'monster-roking';
							}
							if (id.includes('cranit')) {
								return 'monster-cranit';
							}
							if (id.includes('crokoc')) {
								return 'monster-crokoc';
							}
							if (id.includes('arcadu')) {
								return 'monster-arcadu';
							}
							if (id.includes('rodeur')) {
								return 'monster-rodeur';
							}
							if (id.includes('belius')) {
								return 'monster-belius';
							}
							if (id.includes('mimic')) {
								return 'monster-mimic';
							}
							if (id.includes('feufol')) {
								return 'monster-feufol';
							}
							if (id.includes('becplu')) {
								return 'monster-becplu';
							}
							if (id.includes('updwn')) {
								return 'monster-updwn';
							}
							if (id.includes('fullgd')) {
								return 'monster-fullgd';
							}
							if (id.includes('rhubar')) {
								return 'monster-rhubar';
							}
							if (id.includes('stroa')) {
								return 'monster-stroa';
							}
							if (id.includes('scorpu')) {
								return 'monster-scorpu';
							}
							if (id.includes('sangsa')) {
								return 'monster-sangsa';
							}
							if (id.includes('saboss')) {
								return 'monster-saboss';
							}
							if (id.includes('sangs2')) {
								return 'monster-sangs2';
							} else return 'anim-monster';
						}
						if (id.includes('dinoAnimation/src/dino')) {
							if (id.includes('moueffe')) {
								return 'dino-moueffe';
							}
							if (id.includes('pigmou')) {
								return 'dino-pigmou';
							}
							if (id.includes('winks')) {
								return 'dino-winks';
							}
							if (id.includes('planaile')) {
								return 'dino-planaile';
							}
							if (id.includes('castivore')) {
								return 'dino-castivore';
							}
							if (id.includes('rocky')) {
								return 'dino-rocky';
							}
							if (id.includes('pteroz')) {
								return 'dino-pteroz';
							}
							if (id.includes('nuagoz')) {
								return 'dino-nuagoz';
							}
							if (id.includes('sirain')) {
								return 'dino-sirain';
							}
							if (id.includes('hippoclamp')) {
								return 'dino-hippoclamp';
							}
							if (id.includes('gorilloz')) {
								return 'dino-gorilloz';
							}
							if (id.includes('wanwan')) {
								return 'dino-wanwan';
							}
							if (id.includes('santaz')) {
								return 'dino-santaz';
							}
							if (id.includes('feross')) {
								return 'dino-feross';
							}
							if (id.includes('kabuki')) {
								return 'dino-kabuki';
							}
							if (id.includes('mahamuti')) {
								return 'dino-mahamuti';
							}
							if (id.includes('soufflet')) {
								return 'dino-soufflet';
							}
							if (id.includes('toufufu')) {
								return 'dino-toufufu';
							}
							if (id.includes('quetzu')) {
								return 'dino-quetzu';
							}
							if (id.includes('smog')) {
								return 'dino-smog';
							}
							if (id.includes('triceragon')) {
								return 'dino-triceragon';
							} else return 'anim-dino';
						}
						if (id.includes('dinoAnimation/src/display')) {
							return 'anim-display';
						}
						if (id.includes('dinoAnimation/src/fight')) {
							return 'anim-fight';
						}
						if (id.includes('dinoAnimation/src/gfx')) {
							if (id.includes('fx')) {
								return 'gfx-fx';
							}
							if (id.includes('invocations')) {
								return 'gfx-invocations';
							}
							if (id.includes('notify')) {
								return 'gfx-notify';
							}
							if (id.includes('parts')) {
								return 'gfx-parts';
							}
							if (id.includes('worker')) {
								return 'gfx-worker';
							} else return 'anim-gfx';
						}
						if (id.includes('dinoAnimation')) {
							return 'dino-animation';
						}
					}
				}
			}
		},
		assetsInclude: '**/*.swf'
	};
});
