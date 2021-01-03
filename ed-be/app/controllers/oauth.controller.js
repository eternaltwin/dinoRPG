import { HttpEtwinClient } from "@eternal-twin/etwin-client-http";
import { RfcOauthClient } from "@eternal-twin/oauth-client-http/lib/rfc-oauth-client.js";
import { URL } from "url";

const oauthClient = new RfcOauthClient({
    authorizationEndpoint: new URL("http://localhost:50320/oauth/authorize"),
    tokenEndpoint: new URL("http://localhost:50320/oauth/token"),
    callbackEndpoint: new URL("http://localhost:8081/oauth/callback"),
    clientId: "dinorpg@clients",
    clientSecret: "dev_secret"
});

const apiClient = new HttpEtwinClient(new URL('http://localhost:50320/'));

const oauthController = {

    getAuthorizationUri: () => {
        return oauthClient.getAuthorizationUri('base', 'authenticate');
    },

    getAccessToken: async (req, res) => {
        const code = req.query.code;
        const token = await oauthClient.getAccessToken(code);
        console.log(token);

        const self = await apiClient.getAuthSelf(token.accessToken);
        // const self2 = await apiClient.getUserById(null, self.user.clientId);

        console.log(JSON.stringify(self2));

        res.send(self);
    }

}

export default oauthController;

