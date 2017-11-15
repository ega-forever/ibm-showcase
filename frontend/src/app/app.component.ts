import {CarService} from "../services/carService";
import {Component} from "@angular/core";
import Wallet from "ethereumjs-wallet";
import url from "url";
import _ from "lodash";
import {ContractService} from "../services/contractService";
import {CalcService} from "../services/calcService";
import {HttpClient} from "@angular/common/http";
declare const Buffer;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [CarService, ContractService, CalcService]
})
export class AppComponent {
  private form = {
    privateKey: null,
    chosenYear: null,
    userProfileURL: null,
    brand: null,
    model: null,
    accident: null,
    age: null,
    horsepower: null
  };
  wallet = null;
  isValidPrivateKey = false;
  isValidProfileUrl = false;
  calculatedCost = 0;
  savedCost = 0;
  data = {
    brands: [],
    models: [],
    accident: [{name: 'no', value: 1}, {name: 'yes', value: 0}],
    engine: [
      {name: '50-70', value: 0.9},
      {name: '100', value: 1},
      {name: '120', value: 1.2},
      {name: '150', value: 1.4},
      {name: '>160', value: 1.6}
      ],
    age: [
      {name: '1', value: 1.8},
      {name: '2', value: 1.4},
      {name: '3', value: 1.2},
      {name: '>3', value: 1},
    ]
  };
  carPrice: null;

  onPrivateKeyInput(ev) {
    try {
      this.wallet = (<any>Wallet).fromPrivateKey(Buffer.from(this.form.privateKey, 'hex'));
      this.isValidPrivateKey = true;
    } catch (e) {
      this.isValidPrivateKey = false;
    }
  }


  onProfileInput(ev) {
    try {
      let result = url.parse(this.form.userProfileURL);
      this.isValidProfileUrl = result && !!result.hostname;
    } catch (e) {
      this.isValidProfileUrl = false;
    }
  }


  constructor(public carService: CarService, public contractService: ContractService, public calcService: CalcService) {
    this.carService.getBrands()
      .then(brands => this.data.brands = <any>brands);
  }



  async onSetYear(year) {
    this.savedCost = await this.contractService.getContractCostByYear(this.wallet, year);
  }

  async onSetBrand() {
    this.data.models = await <any>this.carService.getModels(this.form.brand);
  }

  async onSetModel() {
    let response = await this.carService.getModelPrice(this.form.brand, this.form.model);
    this.carPrice = _.get(response, 'arithmeticMean', 0);
    console.log(this.carPrice);
  }

  async calculate(){
    this.calculatedCost = await this.calcService.calculate(
      this.wallet,
      this.form.chosenYear,
      this.form.age,
      this.form.horsepower,
      this.form.accident,
      this.form.userProfileURL);
  }

  async save() {
    await this.contractService.savePreference(this.wallet, this.calculatedCost, this.form.chosenYear);
    this.savedCost = this.calculatedCost;
  }

}
