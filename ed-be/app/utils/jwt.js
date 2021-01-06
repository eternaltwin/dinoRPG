import expressJwt from 'express-jwt';
import jsonwebtoken from 'jsonwebtoken';
import context from './context.js';
import fs from 'fs';
import toml from 'toml';

const environnement = context.getEnvironnement();

const configuration = toml.parse(fs.readFileSync('./config_' + environnement + '.toml', 'utf-8'));

const jwt = {
    jwtConfig: () => {
        const secret = configuration.jwt.secretKey;
        return expressJwt({ secret, algorithms: ['HS256'] }).unless({
            path: [
                '/api/oauth/authenticate/eternal-twin'
            ]
        })
    },

    forgeJWT: (player) => {
        return jsonwebtoken.sign({ playerId: player.playerId }, configuration.jwt.secretKey, { expiresIn: '7d' });
    }
}

export default jwt;