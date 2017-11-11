declare const Buffer;
import {Component} from '@angular/core';
import Web3 from 'web3';
import contract from 'truffle-contract';
import * as UserHolder from '../../../truffle/build/contracts/UserHolder.json';
import Tx from 'ethereumjs-tx';
import Wallet from 'ethereumjs-wallet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  privateKey = 'be580bf5d264c40d9eac90540c9d4f8a62c37c28c13b7658cbad11d5d0baec9a';
  isValid = false;
  chosenYear = null;
  calculatedCost = 0;
  savedCost = 0;
  web3Provider = null;
  userHolderInstance = null;
  predictedCharge = 65; //todo remove

  onPrivateKeyInput(ev) {
    try {
      Wallet.fromPrivateKey(Buffer.from(this.privateKey, 'hex'));
      this.isValid = true;
    } catch (e) {
      this.isValid = false;
    }
  }

  constructor() {
    this.web3Provider = new Web3.providers.HttpProvider("http://localhost:8545");
    let userHolder = contract(UserHolder);
    userHolder.setProvider(this.web3Provider);

    userHolder.deployed().then(instance => {
      this.userHolderInstance = instance;
    });
  }


  calculate(){
    this.calculatedCost = this.predictedCharge * (this.chosenYear - new Date().getFullYear() + 1) * 365;
    console.log(this.calculatedCost);
  }

  savePreference(cost, year) {

    let wallet = Wallet.fromPrivateKey(Buffer.from(this.privateKey, 'hex'));


    let web3 = new Web3(this.web3Provider);
    let contract = web3.eth.contract((<any>UserHolder).abi);
    console.log(this.userHolderInstance.address)
    let data = contract.at(this.userHolderInstance.address).addClient.getData(cost, year);
    const gasPrice = web3.eth.gasPrice;
    const gasPriceHex = web3.toHex(gasPrice);
    const gasLimitHex = web3.toHex(3000000);

    const nonce = web3.eth.getTransactionCount(`0x${wallet.getAddress().toString('hex')}`);
    const nonceHex = web3.toHex(nonce);

    const rawTx = {
      nonce: nonceHex,
      gasPrice: gasPriceHex,
      gasLimit: gasLimitHex,
      data: data,
      from: `0x${wallet.getAddress().toString('hex')}`,
      to: this.userHolderInstance.address
    };

    const tx = new Tx(rawTx);
    tx.sign(wallet.getPrivateKey());
    const serializedTx = tx.serialize();

    web3.eth.sendRawTransaction(serializedTx.toString('hex'), (err, hash) => {
      console.log('contract creation tx: ' + hash);
    });


  }

  async onSetYear(year) {
    this.chosenYear = year;
    this.savedCost = await this.getContractCostByYear(year);
  }

  async getContractCostByYear(year) {
    let wallet = Wallet.fromPrivateKey(Buffer.from(this.privateKey, 'hex'));
    let cost = await this.userHolderInstance.getCost.call(year, {from: `0x${wallet.getAddress().toString('hex')}`});
    return cost.toString();
  }

}
