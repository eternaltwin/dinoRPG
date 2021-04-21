"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dinoz_routes_1 = __importDefault(require("./src/routes/dinoz.routes"));
const oauth_routes_1 = __importDefault(require("./src/routes/oauth.routes"));
const player_routes_1 = __importDefault(require("./src/routes/player.routes"));
const shop_routes_1 = __importDefault(require("./src/routes/shop.routes"));
const context_1 = require("./src/utils/context");
const jwt_1 = require("./src/utils/jwt");
//import { resetDinozShopAtMidnight } from './src/cron/resetDinozShop';
const sequelize_1 = require("./src/sequelize");
const app = express_1.default();
// Load TOML configuration file
context_1.loadConfigFile();
// Database connection
// { alter: true } -> Si besoin
// { force: true } -> S'il n'y a plus d'espoir
sequelize_1.sequelize
    .sync()
    .then(() => {
    console.log("Database sync");
})
    .catch(() => {
    console.error("Error while doing database synchronisation");
});
const corsOptions = {
    origin: ["http://localhost:8080"],
};
app.use(cors_1.default(corsOptions));
// parse requests of content-type - application/json
app.use(body_parser_1.default.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(body_parser_1.default.urlencoded({ extended: true }));
// To send static files to client when '/data' is in URL
const dirname = path_1.default.resolve();
app.use("/api/data", express_1.default.static(dirname + "/src/data"));
// Use JWT authentication to secure the API
app.use(jwt_1.jwtConfig());
// Routes declaration
app.use(dinoz_routes_1.default);
app.use(oauth_routes_1.default);
app.use(player_routes_1.default);
app.use(shop_routes_1.default);
// Launch Cron
// resetDinozShopAtMidnight();
// Initiate controllers
// oauthController.init();
// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
//# sourceMappingURL=server.js.map