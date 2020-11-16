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

    var cookieToSend = 'hcw=1; sid=rA817GT5eACrSTxvyxZESSzesTcm5qbo';

    await doIngredientsRequest(data, cookieToSend);
    for (const dino of data.dinos) {
        await doDinozSkillsRequest(data, cookieToSend, dino.id);
    }

    // Si le joueur a le petit missionnaire illustré, on récupère les missions des dinoz
    if (data.collections.find(rec => rec.oid === 'pmi') !== undefined) {
        await doMissionRequest(data, cookieToSend);
    }

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

	var params = '?fields=dinos.fields(display,life,maxLife,pos,canAct,canGather,xp,elements,equip.fields(desc,name,icon,locked,max,family),status,effects.fields(name,desc,icon,hidden)),' +
	'objects.fields(count,desc,name,icon,locked,max,family),' +
	'collections.fields(id,uid,name,desc),' +
	'money,' +
	'scenarios,' +
	'clanUser.fields(clan.fields(ally,announce,announceText,battle,war,money,castle),money,title,attackCount,attackDamages,defenseCount,defenseDamages)' +
    '&access_token=' + token;
    
    /*var params = '?fields=dinos.fields(display),' +
	'collections.fields(id,uid,name,desc)' +
    '&access_token=' + token;*/

    let response = await fetch(url + params);
    let json = await response.json();
    return json;
}

function doIngredientsRequest(data, cookieToSend) {
    var ingrName;
    var ingrQuantity;
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

                        // On récupère les missions du dinoz
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

                        // Ajoute les missions du dinoz dans le json
                        dinoz.missions = characterArray;

                        resolve(data);
                    }
                });
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