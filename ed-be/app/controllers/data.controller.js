'use strict';

const fetch = require('node-fetch');
const fs = require('fs');
const toml = require('toml');
const request = require('request');
const cheerio = require('cheerio');

// Get data from Twinoid API
exports.getApiData = async (req, res) => {
    let code = req.params.code;
    // Get token from Twinoid API (use to communicate with API)
    let token = await getToken(code);
    // Get data from DinoRPG API
    let data = await getAllApiData(token);

    let cookieToSend = 'hcw=1; sid=MIaSWUPkdPMVlyPEnAahuMaZ4XAm0XVz';

    // Récupération des ingrédients du joueur
    /* await doIngredientsRequest(data, cookieToSend);
    
    // Récupération des compétences, assauts, défenses et attaques spéciales des dinoz
    for (const dino of data.dinos) {
        await doDinozSkillsRequest(data, cookieToSend, dino.id);
    }

    // Si le joueur a le petit missionnaire illustré, on récupère les missions des dinoz
    if (data.collections.find(rec => rec.oid === 'pmi') !== undefined) {
        await doMissionRequest(data, cookieToSend);
    }

    // Récupération des dinoz de la boutique démoniaque
    await doDeamonShopRequest(data, cookieToSend);

    // Récupération des ingrédients donnés au clan
    await doIngredientsFromClanRequest(data, cookieToSend);*/

    // Récupération des pages du clan
    let pagesIdArray = [];
    pagesIdArray = await getClanPagesId(data, cookieToSend, pagesIdArray);

    // Récupération du contenu de toutes les pages une à une
    for (const pageId of pagesIdArray) {
        await getPageContent(data, cookieToSend, pageId);
    }

    console.log(pagesIdArray);

    createFile(data);

    res.send(data);
};

async function getToken(code) {
    let config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));
    let url = 'https://twinoid.com/oauth/token';
	let params = new URLSearchParams();

	params.append('client_id', config.api.client_id);
	params.append('client_secret', config.api.client_secret);
	params.append('redirect_uri', 'http://localhost:8080/api');
	params.append('code', code);
	params.append('grant_type', 'authorization_code');

    let response = await fetch(url, { method: 'POST', body: params });
    let json = await response.json();
    return json.access_token;
}

async function getAllApiData(token) {
    var url = 'http://www.dinorpg.com/tid/graph/me';

	/*var params = '?fields=dinos.fields(display,life,maxLife,pos,canAct,canGather,xp,elements,equip.fields(desc,name,icon,locked,max,family),status,effects.fields(name,desc,icon,hidden)),' +
	'objects.fields(count,desc,name,icon,locked,max,family),' +
	'collections.fields(id,uid,name,desc),' +
	'money,' +
	'scenarios,' +
	'clanUser.fields(clan.fields(ally,announce,announceText,battle,war,money,castle),money,title,attackCount,attackDamages,defenseCount,defenseDamages)' +
    '&access_token=' + token;*/
    
    var params = '?fields=dinos.fields(display),' +
	'clanUser.fields(clan.fields(ally,announce,announceText,battle,war,money,castle),money,title,attackCount,attackDamages,defenseCount,defenseDamages)' +
    '&access_token=' + token;

    let response = await fetch(url + params);
    let json = await response.json();
    return json;
}

function doIngredientsRequest(data, cookieToSend) {
    let ingrName;
    let ingrQuantity;
    data.ingredients = [];

    return new Promise(function(resolve, reject) {
        request({
            url: 'http://www.dinorpg.com/user/ingr',
            method: 'GET',
            headers: {
                'Cookie': cookieToSend
            }
        }, function(err, response, html) {
            if (!err) {
                var $ = cheerio.load(html);
                $('[class=table]')[0].children[1].children.forEach(ingr => {
                    if (ingr.attribs) {
                        if (Object.keys(ingr.attribs).length !== 0) {
                            ingrName = ingr.children[3].children[0].data;
                            ingrQuantity = ingr.children[5].children[0].data.substring(5, ingr.children[5].children[0].data.length-4);
                            data.ingredients.push({ name: ingrName, quantity: ingrQuantity });
                            resolve(data);
                        }
                    }
                });
            }
        });   
    });
}

function doDinozSkillsRequest(data, cookieToSend, dinozId) {
    let compArray = [];
    let assauts = [];
    let defenses = [];
    let competenceSpe = [];
    let element;
    let valeur;

    return new Promise(function(resolve, reject) {
        request({
            url: 'http://www.dinorpg.com/dino/' + dinozId + '/setTab?t=details',
            method: 'GET',
            headers: {
                'Cookie': cookieToSend
            }
        }, function(err, response, html) {
            if (!err) {
                var $ = cheerio.load(html);
                // Récupération des compétences
                if ($('[class=table]')[0] !== undefined) {
                    $('[class=table]')[0].children[1].children.forEach(comp => {
                        if (comp.children) {
                            if (comp.children[1].children[1]) {
                                compArray.push(comp.children[1].children[1].attribs.onmouseover.split('<h1>')[1].split('</h1>')[0]);
                            }
                        }
                    });

                    // Récupération des assauts
                    $('[class=details]')[0].children[5].children[3].children.forEach(assaut => {
                        if (assaut.attribs) {
                            // Récupération du nom de l'élément
                            element = assaut.attribs.onmouseover.split('<strong>')[1].split('</strong>')[0];
                            // Récupération de la valeur de l'élément
                            valeur = assaut.children[2].data.substring(2);
                            assauts.push({ element: element, valeur: valeur });
                        }
                    });

                    // Récupération des défenses
                    $('[class=details]')[0].children[7].children[3].children.forEach(defense => {
                        if (defense.attribs) {
                            // Récupération du nom de l'élément
                            element = defense.attribs.onmouseover.split('<strong>')[1].split('</strong>')[0];
                            // Récupération de la valeur de l'élément
                            valeur = defense.children[2].data.substring(2);
                            defenses.push({ element: element, valeur: valeur });
                        }
                    });

                    // Récupération des valeurs spéciales
                    $('[class=details]')[0].children[9].children[3].children.forEach(compSpe => {
                        if (compSpe.attribs) {
                            // Récupération du nom de l'élément
                            element = compSpe.attribs.onmouseover.split('class=')[1].split('</div>')[0].substring(12)
                            if (element.includes('<em>')) {
                                element = element.split('<em>')[0]
                            }
                            // Récupération de la valeur de l'élément
                            valeur = compSpe.children[2].data.substring(1, compSpe.children[2].data.length - 4);
                            competenceSpe.push({ element: element, valeur: valeur });
                        }
                    });

                    // Retrouve le dinoz dans le json donné par l'API
                    let dinoz = data.dinos.find(dino => 
                        dino.id === dinozId
                    );

                    // Ajoute les compétences du dinoz dans le json
                    dinoz.skills = compArray;
                    dinoz.assauts = assauts;
                    dinoz.defenses = defenses;
                    dinoz.competenceSpe = competenceSpe;

                    resolve(data);
                // On throw une erreur si la fiche d'un dinoz n'est pas accessible
                } else {
                    console.log('Erreur dans la récupération des données du dinoz. Êtes-vous sûr que la fiche de tous vos dinoz est accessible ?');
                    reject(data);
                }
            }
        });   
    });
}

function doMissionRequest(data, cookieToSend) {
    let characterName;
    let missionName;
    let dinozId;
    let characterArray = [];
    let missionArray = [];

    return new Promise(function(resolve, reject) {
        request({
            url: 'http://www.dinorpg.com/dino/missions',
            method: 'GET',
            headers: {
                'Cookie': cookieToSend
            }
        }, function(err, response, html) {
            if (!err) {
                var $ = cheerio.load(html);

                // On enlève l'entête du tableau
                let table = $('[class=table]')[0].children[1].children.splice(1);
                table.forEach(dino => {
                    if (dino.attribs) {
                        characterArray = [];

                        // On récupère l'id du dinoz
                        dinozId = dino.children[1].children[1].attribs.id.substring(16);

                        // On parcourt la liste des personnages pour qui le dinoz a fait des missions
                        dino.children[3].children[1].children.forEach(character => {
                            if (character.attribs) {
                                if (character.attribs.onmouseover !== undefined) {
                                    // On récupère le nom du personnage
                                    characterName = character.attribs.onmouseover.split('<h1>')[1].split('</h1>')[0]
                                    
                                    // Les noms obtenus sont sous la forme : Missions de "Personnage"
                                    // On enlève les guillemets
                                    characterName = characterName.replace('"', '');
                                    characterName = characterName.replace('"', '');

                                    // On récupère les missions terminées pour ce personnage
                                    let missionList = character.attribs.onmouseover.split('</h1>')[1].split('<li>').slice(1);
                                    missionArray = [];

                                    // On sépare les missions une à une et on parcourt le tableau obtenu
                                    missionList.forEach(mission => {
                                        missionName = mission.substring(11).split('\\r\\n')[0];
                                        // Lorsqu'il y a une apostrophe dans le titre de la mission, on obtient : "L\'épouvantarchelion"
                                        // On enlève le double slash
                                        if (missionName.includes('\\')) {
                                           missionName = missionName.replace('\\', ''); 
                                        }

                                        missionArray.push(missionName);
                                    });

                                    characterArray.push({ characterName: characterName, missions: missionArray });
                                }
                            }
                        });

                        // On retrouve le dinoz dans le json fournit par l'API
                        let dinoz = data.dinos.find(dino => 
                            dino.id == dinozId
                        );

                        // On ajoute les missions du dinoz dans le json
                        dinoz.missions = characterArray;

                        resolve(data);
                    }
                });
            }
        });   
    });
}

function doDeamonShopRequest(data, cookieToSend) {
    let dinozDisplay;
    let dinozName;
    let dinozLevel;
    let elementName;
    let elementValue;
    let elements = [];
    let competences;
    let skillArray = [];
    let dinozSacrifiedData = [];

    return new Promise(function(resolve, reject) {
        request({
            url: 'http://www.dinorpg.com/shop/demon',
            method: 'GET',
            headers: {
                'Cookie': cookieToSend
            }
        }, function(err, response, html) {
            if (!err) {
                var $ = cheerio.load(html);

                // On fait une liste de tous les dinoz sacrifiés
                let dinozSacrifiedList = $('#centerContent')[0].children[1].children;

                // On enlève les entêtes et les sections d'aide qui ne nous servent pas
                dinozSacrifiedList = dinozSacrifiedList.slice(9, dinozSacrifiedList.length - 26);

                // On parcourt la liste des dinoz sacrifiés pour récupérer leurs données
                dinozSacrifiedList.forEach(dinoz => {
                    if (dinoz.attribs) {
                        if (dinoz.attribs.class === 'sheet') {
                            // On récupère l'affichage du dinoz
                            dinozDisplay = dinoz.children[3].children[0].data.split('data=')[1].split('&amp;chk=')[0];

                            // On récupère le nom du dinoz
                            dinozName = dinoz.children[5].children[5].children[0].data.substring(13, dinoz.children[5].children[5].children[0].data.length - 13);

                            // On récupère le niveau du dinoz
                            dinozLevel = dinoz.children[5].children[5].children[1].children[0].data.substring(7);

                        } else if (dinoz.attribs.class === 'skills') {
                            elements = [];

                            // On récupère les éléments du dinoz
                            dinoz.children[1].children.forEach(elem => {
                                if (elem.attribs) {
                                    // On récupère le nom de l'élément
                                    elementName = elem.attribs.onmouseover.split('<strong>')[1].split('</strong>')[0]

                                    // On récupère la valeur de l'élément
                                    elementValue = elem.children[2].data.substring(2);

                                    elements.push({ elementName: elementName, elementValue, elementValue });

                                    // On récupère toutes les compétences du dinoz
                                    competences = dinoz.children[3].children[1].children;

                                    // On enlève l'entête du tableau;
                                    competences = competences.slice(1);

                                    skillArray = [];

                                    // On parcourt le tableau de compétences du dinoz
                                    competences.forEach(comp => {
                                        if (comp.attribs) {
                                            skillArray.push(comp.children[1].children[1].attribs.onmouseover.split('<h1>')[1].split('</h1>')[0]);
                                        }
                                    });
                                }
                            });

                            // On ajoute le dinoz dans un json
                            dinozSacrifiedData.push({
                                dinozDisplay: dinozDisplay,
                                dinozName: dinozName,
                                dinozLevel: dinozLevel,
                                elements: elements,
                                skills: skillArray
                            });
                        }
                    }
                });

                // On ajoute le tableau de dinoz sacrifiés au json
                data.dinozSacrified = dinozSacrifiedData;

                resolve(data);
            }
        });   
    });
}

// Récupère les ingrédients du clan du joueur
function doIngredientsFromClanRequest(data, cookieToSend) {
    let ingredientName;
    let ingredientQuantity;
    let ingredientArray = [];

    return new Promise(function(resolve, reject) {
        request({
            url: 'http://www.dinorpg.com/clan/' + data.clanUser.clan.id + '/treasure',
            method: 'GET',
            headers: {
                'Cookie': cookieToSend
            }
        }, function(err, response, html) {
            if (!err) {
                var $ = cheerio.load(html);
                $('[class=ingr]')[0].children.forEach(ingr => {
                    if (ingr.attribs) {
                        // On récupère le nom de l'ingrédient
                        ingredientName = ingr.children[1].attribs.onmouseover.split('<h1>')[1].split('</h1>')[0];

                        // On récupère la quantité de l'ingrédient
                        ingredientQuantity = ingr.children[4].data.substring(4, ingr.children[4].data.length - 3);

                        ingredientArray.push({ name: ingredientName, quantity: ingredientQuantity });
                    }
                });

                // On ajoute le résultat au json
                data.clanUser.clan.ingredients = ingredientArray;

                resolve(data);
            }
        });   
    });
}

function getClanPagesId(data, cookieToSend, pagesIdArray) {
    return new Promise(function(resolve, reject) {
        request({
            url: 'http://www.dinorpg.com/clan/' + data.clanUser.clan.id + '/view',
            method: 'GET',
            headers: {
                'Cookie': cookieToSend
            }
        }, function(err, response, html) {
            if (!err) {
                var $ = cheerio.load(html);
                let pages = $('[class=pageMenu]')[0].children

                // On retire la première page qui est la page d'accueil (pad d'id récupérable)
                pages = pages.slice(2, pages.length - 2);

                // On parcourt le nom de toutes pages existantes
                pages.forEach(page => {
                    if (page.attribs) {
                        // On récupère l'ID de la page et on la met dans le tableau
                        pagesIdArray.push(page.attribs.href.split('page=')[1]);
                    }
                });

                // Récupération des pages privées
                pages = $('[class=centre]')[0].children[7].children;

                // On retire la dernière page qui n'en est pas une
                pages = pages.slice(0, pages.length - 2);

                pages.forEach(page => {
                    if (page.attribs) {
                        // On récupère l'ID de la page et on la met dans le tableau
                        pagesIdArray.push(page.attribs.href.split('page=')[1]);
                    }
                });

                resolve(pagesIdArray);
            }
        });   
    });
}

function getPageContent(data, cookieToSend, pageId) {
    return new Promise(function(resolve, reject) {
        request({
            url: 'http://www.dinorpg.com/clan/' + data.clanUser.clan.id + '/view?page=' + pageId,
            method: 'GET',
            headers: {
                'Cookie': cookieToSend
            }
        }, function(err, response, html) {
            if (!err) {
                var $ = cheerio.load(html);

                // TODO : récupérer contenu des pages
                // $('[class=centre]')[0].children[9].children
                resolve(data);
            }
        });   
    });
}

// Crée le fichier avec les données du joueur s'il n'existe pas déjà
function createFile(data){
	var path = 'app/playerData/' + data.name + '.txt'
	if (!fs.existsSync(path)){
		fs.appendFile(path, JSON.stringify(data), (err) => {
			if (err) throw err;
		});
	} else {
		console.log('file already exists');
	}
}