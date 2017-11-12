declare const Buffer;
import {Component} from '@angular/core';
import Web3 from 'web3';
import contract from 'truffle-contract';
import * as UserHolder from '../../../truffle/build/contracts/UserHolder.json';
import Tx from 'ethereumjs-tx';
import Wallet from 'ethereumjs-wallet';
import request from 'request-promise';
import config from '../config'
import url from 'url';
import _ from 'lodash';
import promisify from 'es6-promisify';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  privateKey = '';
  wallet = null;
  isValidPrivateKey = false;
  isValidProfileUrl = false;
  chosenYear = null;
  calculatedCost = 0;
  savedCost = 0;
  userProfileURL = null;
  web3Provider = null;
  userHolderInstance = null;

  onPrivateKeyInput(ev) {
    try {
      this.wallet = (<any>Wallet).fromPrivateKey(Buffer.from(this.privateKey, 'hex'));
      this.isValidPrivateKey = true;
    } catch (e) {
      this.isValidPrivateKey = false;
    }
  }


  onProfileInput(ev) {
    try {
      let result = url.parse(this.userProfileURL);
      this.isValidProfileUrl = result && !!result.hostname;
    } catch (e) {
      this.isValidProfileUrl = false;
    }
  }



  constructor() {
    this.web3Provider = new Web3.providers.HttpProvider((<any>config).rpc);
    let userHolder = contract(UserHolder);
    userHolder.setProvider(this.web3Provider);

    userHolder.deployed().then(instance => {
      this.userHolderInstance = instance;
    });
  }


  async calculate() {
    let cogCoefs = await request({
      method: 'GET',
      uri: `${config.rest}/cognitive/0x${this.wallet.getAddress().toString('hex')}/calculate?profile_url=${this.userProfileURL}`,
      json: true
    });

    let coef = _.chain(cogCoefs)
      .get('coefs', [])
      .map(coef=>coef.weight * coef.score)
      .sum()
      .value();

    let rate = await request({
      method: 'GET',
      uri: `${config.rest}/prediction/${this.chosenYear}/rub`,
      json: true
    });


    this.calculatedCost = _.get(rate, 'expected_rate', 60) * (this.chosenYear - new Date().getFullYear() + 1) * 365 * (1 - 0.2 * coef);

  }

  async savePreference(cost, year) {

    let web3 = new Web3(this.web3Provider);
    let contract = web3.eth.contract((<any>UserHolder).abi);
    let data = contract.at(this.userHolderInstance.address).addClient.getData(cost, year);
    const gasPrice = web3.eth.gasPrice;
    const gasPriceHex = web3.toHex(gasPrice);
    const gasLimitHex = web3.toHex(3000000);

    const nonce = web3.eth.getTransactionCount(`0x${this.wallet.getAddress().toString('hex')}`);
    const nonceHex = web3.toHex(nonce);

    const rawTx = {
      nonce: nonceHex,
      gasPrice: gasPriceHex,
      gasLimit: gasLimitHex,
      data: data,
      from: `0x${this.wallet.getAddress().toString('hex')}`,
      to: this.userHolderInstance.address
    };

    const tx = new Tx(rawTx);
    tx.sign(this.wallet.getPrivateKey());
    const serializedTx = tx.serialize();
    await promisify(web3.eth.sendRawTransaction)(serializedTx.toString('hex'));
    this.savedCost = this.calculatedCost;

  }

  async onSetYear(year) {
    this.chosenYear = year;
    this.savedCost = await this.getContractCostByYear(year);
  }

  async getContractCostByYear(year) {
    let cost = await this.userHolderInstance.getCost.call(year, {from: `0x${this.wallet.getAddress().toString('hex')}`});
    return parseInt(cost.toString());
  }

}
