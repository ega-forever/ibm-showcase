import config from "../config";
import _ from "lodash";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class CalcService {

  constructor(public http: HttpClient) {
  }


  async calculate(wallet, year, age, horsepower, accident, profileUrl) {

    let cogCoefs = await this.http.get<any>(`${config.rest}/cognitive/0x${wallet.getAddress().toString('hex')}/calculate?profile_url=${profileUrl}`)
      .toPromise();

    let coef = _.chain(cogCoefs)
      .get('coefs', [])
      .map(coef => coef.weight * coef.score)
      .sum()
      .value();

    let rate = await this.http.get<any>(`${config.rest}/prediction/${year}/rub`)
      .toPromise();

    return (1980 * _.get(rate, 'expected_rate', 60)) / 60 *
      (year - new Date().getFullYear() + 1) * (1 - 0.2 * coef) *
      age * horsepower * accident;

  }


}
