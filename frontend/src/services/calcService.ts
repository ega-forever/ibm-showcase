import request from 'request-promise';
import config from "../config";
import _ from "lodash";

export class CalcService {


  async calculate(wallet, year, profileUrl) {
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


    //1980 *
    //this.calculatedCost = _.get(rate, 'expected_rate', 60) * (this.form.chosenYear - new Date().getFullYear() + 1) * 365 * (1 - 0.2 * coef);
    return _.get(rate, 'expected_rate', 60) * (year - new Date().getFullYear() + 1) * 365 * (1 - 0.2 * coef);

  }


}
