'use strict';

var fetch = require('node-fetch');

// Get data from Twinoid API
exports.getApiData = async (req, res) => {
    let code = req.params.code;
    // Get token from Twinoid API (use to communicate with API)
    let token = await getToken(code);
    // Get data from DinoRPG API
    let response = await getAllApiData(token);
    res.send(response);
};

async function getToken(code) {
    let url = 'https://twinoid.com/oauth/token';
	let params = new URLSearchParams();

	params.append('client_id', '373');
	params.append('client_secret', '');
	params.append('redirect_uri', 'http://localhost:8080/api');
	params.append('code', code);
	params.append('grant_type', 'authorization_code');

    let response = await fetch(url, {method: 'POST', body: params});
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

    let response = await fetch(url + params);
    let json = await response.json();
    return json;
}