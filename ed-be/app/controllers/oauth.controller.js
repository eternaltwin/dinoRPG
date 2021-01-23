import { HttpEtwinClient } from "@eternal-twin/etwin-client-http";
import { RfcOauthClient } from "@eternal-twin/oauth-client-http/lib/rfc-oauth-client.js";
import { URL } from "url";
import context from '../utils/context.js';
import request from 'request';
import jwt from '../utils/jwt.js';
import PlayerRepository from '../repositories/player.repository.js';
import _ from 'lodash';
import constants from '../utils/constants.js';

var configuration;

var oauthClient;

const oauthController = {

    init: () => {
        configuration = context.getConfig();

        oauthClient = new RfcOauthClient({
            authorizationEndpoint: new URL(configuration.oauth.authorizationURI),
            tokenEndpoint: new URL(configuration.oauth.tokenURI),
            callbackEndpoint: new URL(configuration.oauth.callbackURI),
            clientId: configuration.oauth.client_id,
            clientSecret: configuration.oauth.client_secret
        });
    },

    // Get authorization URI
    getAuthorizationUri: () => {
        return oauthClient.getAuthorizationUri('base', 'authenticate');
    },

    // Get token to access EternalTwin API
    getAccessToken: async (code) => {
        return await oauthClient.getAccessToken(code);
    },

    // Get some information about one user
    getUserDetails: async (token) => {
        const apiClient = new HttpEtwinClient(new URL(configuration.general.eternalTwinURI));

        const self = await apiClient.getAuthSelf(token.accessToken);
        const userDetails = await apiClient.getUserById(null, self.user.id);
        return userDetails;
    },

    authenticateToET: async (req, res) => {
        let eternalTwinPlayer;
        // Send authentication to EternalTwin server.
        try {
            eternalTwinPlayer = await doAuthenticationRequestToET(req.body);
        } catch (error) {
            res.status(500).send({
                message: error || 'Incorrect login or password.'
            });
        }

        // Check if player already exists in database
        let player = await PlayerRepository.getPlayerDetails(eternalTwinPlayer.body.id);

        // If player is not found in database, create a new one
        if (_.isNil(player)) {
            player = {
                eternalTwinId: eternalTwinPlayer.body.id,
                name: eternalTwinPlayer.body.display_name.current.value,
                money: constants.initialMoney,
                quetzuBought: 0,
                leader: false,
                engineer: false,
                cooker: false,
                shopKeeper: false,
                merchant: false,
                priest: false,
                teacher: false
            }

            // Create new player in database
            player = await PlayerRepository.create(player);
        }

        // Forge JWT with playerId
        const JWT = await jwt.forgeJWT(player.dataValues);

        res.send(JWT);
    }
}

function doAuthenticationRequestToET(params) {
    return new Promise((resolve, reject) => {
        request({
            url: 'http://localhost:50320/api/v1/auth/self?method=Etwin',
            method: 'PUT',
            json: params
        }, (err, response, html) => {
            if (response.body === 'Internal Server Error') {
                reject(response);
            } else {
                resolve(response);
            }
        });   
    });
}

export default oauthController;

