var FairnessControl = artifacts.require("./FairnessControl.sol");

module.exports = function(deployer) {
  deployer.deploy(FairnessControl);
};
