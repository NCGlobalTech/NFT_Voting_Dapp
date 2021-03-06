// Allows us to use ES6 in our migrations and tests.
require('babel-register')
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "coach pole swing inflict setup embody bless mutual fork frequent sight fine"

module.exports = {
  networks: {
    /*
    "ropsten": {
      network_id: 3,    // Official ropsten network id
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/JtZndBkY7B444nvmQGVK ")
      }
      ,gas: 4700000
    },*/
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 6600000
    }
  },
  rpc: {
    // Use the default host and port when not using ropsten
    host: "localhost",
    port: 8545
  },
  compilers: {
    solc: {
      version: "0.7.0"
    }
  }
};


