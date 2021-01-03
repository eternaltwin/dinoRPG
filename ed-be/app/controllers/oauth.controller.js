import { HttpEtwinClient } from "@eternal-twin/etwin-client-http";
import { RfcOauthClient } from "@eternal-twin/oauth-client-http/lib/rfc-oauth-client.js";
import { URL } from "url";
import fs from 'fs';
import toml from 'toml';

const oauthController = {

    // Get authorization URI
    getAuthorizationUri: () => {
        const oauthClient = getOauthClient();
        return oauthClient.getAuthorizationUri('base', 'authenticate');
    },

    // Get token to access EternalTwin API
    getAccessToken: async (code) => {
        const oauthClient = getOauthClient();
        const token = await oauthClient.getAccessToken(code);
        return token;
    },

    // Get some information about one user
    getUserDetails: async (token) => {
        const configuration = toml.parse(fs.readFileSync('./config_' + config + '.toml', 'utf-8'));

        const apiClient = new HttpEtwinClient(new URL(configuration.oauth.eternalTwinURI));

        const self = await apiClient.getAuthSelf(token.accessToken);
        const userDetails = await apiClient.getUserById(null, self.user.id);
        return userDetails;
    }
}

function getOauthClient() {
    const configuration = toml.parse(fs.readFileSync('./config_' + config + '.toml', 'utf-8'));

    return new RfcOauthClient({
        authorizationEndpoint: new URL(configuration.oauth.eternalTwinURI + 'oauth/authorize'),
        tokenEndpoint: new URL(configuration.oauth.eternalTwinURI + 'oauth/token'),
        callbackEndpoint: new URL(configuration.oauth.publicUri + 'oauth/callback'),
        clientId: configuration.oauth.client_id,
        clientSecret: configuration.oauth.client_secret
    });
}

export default oauthController;

