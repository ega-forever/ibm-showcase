import request from 'request-promise';
import config from "../config";
import _ from "lodash";

export class CalcService {


  async calculate(wallet, year, age, horsepower, accident, profileUrl) {
    let cogCoefs = await request({
      method: 'GET',
      uri: `${config.rest}/cognitive/0x${wallet.getAddress().toString('hex')}/calculate?profile_url=${profileUrl}`,
      json: true
    });

    let coef = _.chain(cogCoefs)
      .get('coefs', [])
      .map(coef => coef.weight * coef.score)
      .sum()
      .value();

    let rate = await request({
      method: 'GET',
      uri: `${config.rest}/prediction/${year}/rub`,
      json: true
    });


    return (1980 * _.get(rate, 'expected_rate', 60)) / 60 *
      (year - new Date().getFullYear() + 1) * (1 - 0.2 * coef) *
      age * horsepower * accident;

  }


}
