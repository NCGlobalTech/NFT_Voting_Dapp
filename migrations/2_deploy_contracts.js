const NFTtoken = artifacts.require("NFTtoken");
const ERC20token = artifacts.require("ERC20Token")
let _totalSupply = 20000;

module.exports = function(deployer) {
    deployer.deploy(ERC20token, _totalSupply, web3.utils.toWei('0.01', 'ether'), [web3.utils.asciiToHex('Rama'), web3.utils.asciiToHex('Nick'), web3.utils.asciiToHex('Jose')]); 
    deployer.deploy(NFTtoken);
};