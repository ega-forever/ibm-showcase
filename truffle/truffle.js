const bip39 = require("bip39"),
  hdkey = require('ethereumjs-wallet/hdkey'),
  ProviderEngine = require("web3-provider-engine"),
  WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js'),
  Web3Subprovider = require("web3-provider-engine/subproviders/web3.js"),
  Web3 = require("web3"),
  FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');

// Get our mnemonic and create an hdwallet
let mnemonic = "couch solve unique spirit wine fine occur rhythm foot feature glory away";
let hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));

// Get the first account using the standard hd path.
let wallet_hdpath = "m/44'/60'/0'/0/";
let wallet = hdwallet.derivePath(wallet_hdpath + "0").getWallet();
let address = "0x" + wallet.getAddress().toString("hex");
let providerUrl = "https://rinkeby.infura.io";
let engine = new ProviderEngine();
// filters
engine.addProvider(new FilterSubprovider());

engine.addProvider(new WalletSubprovider(wallet, {}));
engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(providerUrl)));
engine.start(); // Required by the provider engine.

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 500000
    },
    rinkeby: {
      network_id: 4,
      provider: engine,
      from: address
    }
  }
};
