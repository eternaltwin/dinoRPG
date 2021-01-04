import { HttpEtwinClient } from "@eternal-twin/etwin-client-http";
import { RfcOauthClient } from "@eternal-twin/oauth-client-http/lib/rfc-oauth-client.js";
import { URL } from "url";
import Context from '../utils/context.js';
import fs from 'fs';
import toml from 'toml';
import request from 'request';

const environment = Context.getEnvironnement();

const configuration = toml.parse(fs.readFileSync('./config_' + environment + '.toml', 'utf-8'));

const oauthClient = new RfcOauthClient({
    authorizationEndpoint: new URL(configuration.oauth.authorizationURI),
    tokenEndpoint: new URL(configuration.oauth.tokenURI),
    callbackEndpoint: new URL(configuration.oauth.callbackURI),
    clientId: configuration.oauth.client_id,
    clientSecret: configuration.oauth.client_secret
});

const oauthController = {

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
        doAuthenticationRequestToET(req.body).then(response => {
            res.send(response);
        }).catch(err => {
            res.status(500).send({
                message: err || 'Incorrect login or password.'
            });
        });
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

