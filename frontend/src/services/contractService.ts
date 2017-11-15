import Web3 from 'web3';
import contract from 'truffle-contract';
import * as UserHolder from '../../../truffle/build/contracts/UserHolder.json';
import Tx from 'ethereumjs-tx';
import config from '../config'
import promisify from 'es6-promisify';


export class ContractService {

  private web3Provider = null;
  private userHolderInstance = null;

  constructor() {
    this.web3Provider = new Web3.providers.HttpProvider((<any>config).rpc);
    let userHolder = contract(UserHolder);
    userHolder.setProvider(this.web3Provider);

    userHolder.deployed().then(instance => {
      this.userHolderInstance = instance;
    });
  }

  async savePreference(wallet, cost, year) {

    let web3 = new Web3(this.web3Provider);
    let contract = web3.eth.contract((<any>UserHolder).abi);
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
    let hash = await promisify(web3.eth.sendRawTransaction)(`0x${serializedTx.toString('hex')}`);
    localStorage.setItem('hash', hash);
  }


  async getContractCostByYear(wallet, year) {
    let cost = await this.userHolderInstance.getCost.call(year, {from: `0x${wallet.getAddress().toString('hex')}`});
    return parseInt(cost.toString());
  }

}
