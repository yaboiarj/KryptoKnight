var KnightContract = artifacts.require("./KnightMarket.sol");

module.exports = function(deployer) {
  deployer.deploy(KnightContract);
};
