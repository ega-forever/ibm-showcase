const messages = require('../factories/messages/genericMessageFactory'),
  express = require('express'),
  services = require('../services');

module.exports = (app) => {

  let routerCognitive = express.Router();
  let routerPrediction = express.Router();

  app.get('/', (req, res) => {
    res.send(messages.success);
  });

  routerCognitive.get('/:addr/calculate', services.getUserProfileCoefService);
  routerPrediction.get('/:year/:currency/', services.getCurrencyRateService);

  app.use('/cognitive', routerCognitive);
  app.use('/prediction', routerPrediction);

};
