const config = require('./config'),
  express = require('express'),
  routes = require('./routes'),
  cors = require('cors');

/**
 * @module entry point
 * @description expose an express web server for txs
 * and addresses manipulation
 */


let app = express();

app.use(cors());
routes(app);

app.listen(config.rest.port);
