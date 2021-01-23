import expressJwt from 'express-jwt';
import jsonwebtoken from 'jsonwebtoken';
import context from './context.js';

const jwt = {
    jwtConfig: () => {
        const config = context.getConfig();
        const secret = config.jwt.secretKey;
        return expressJwt({ secret, algorithms: ['HS256'] }).unless({
            path: [
                '/api/oauth/authenticate/eternal-twin'
            ]
        })
    },

    forgeJWT: (player) => {
        const config = context.getConfig();
        return jsonwebtoken.sign({ playerId: player.playerId }, config.jwt.secretKey);
    }
}

export default jwt;