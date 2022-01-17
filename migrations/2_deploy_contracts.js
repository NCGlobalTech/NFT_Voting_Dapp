const MyERC20 = artifacts.require("MyERC20");
const NFTToken = artifacts.require("NFTToken")
const NFTTrade = artifacts.require("NFTTrade")

module.exports = function(deployer) {
    deployer.deploy(NFTToken);
    deployer.deploy(MyERC20).then(function() {
        return deployer.deploy(NFTTrade, MyERC20.address, NFTToken.address)
    })
};