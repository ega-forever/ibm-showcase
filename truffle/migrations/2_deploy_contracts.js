var UserHolder = artifacts.require("./UserHolder.sol");

module.exports = function(deployer) {
  deployer.deploy(UserHolder);
};
