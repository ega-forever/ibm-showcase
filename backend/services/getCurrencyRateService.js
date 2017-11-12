const request = require('request-promise'),
  Promise = require('bluebird'),
  config = require('../config'),
  moment = require('moment'),
  shaman = require('shaman'),
  _ = require('lodash');

module.exports = async (req, res) => {

  let dates = _.chain(new Array(12))
    .fill(new Date())
    .map((date, i) =>
      moment(date).add(-i, 'month').format('YYYY-MM-DD')
    )
    .value();

  let currencies = await Promise.all(
    dates.map(async function (date) {
      let resp = await request({
        uri: `http://www.apilayer.net/api/live?access_key=${config.apilayer.api_kay}&format=1&currencies=${req.params.currency}&date=${date}`,
        json: true
      });
      return {
        date: date,
        value: _.get(resp, `quotes.USD${req.params.currency.toUpperCase()}`)
      }
    })
  );

  let Y = currencies.map(c => c.value);
  let X = currencies.map(c => new Date(c.date).getTime());
  let lr = new shaman.LinearRegression(X, Y);

  let prediction = await new Promise((res, rej) =>
    lr.train(err =>
      err ? rej({}) :
        res(
          lr.predict(
            moment(Date.now())
              .year(req.params.year)
              .toDate()
              .getTime()
          )
        )
  ));

  res.send({expected_rate: prediction});

};