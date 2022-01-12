

// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import voting_artifacts from '../../build/contracts/ERC20Token.json'
import voting_artifacts2 from '../../build/contracts/NFTtoken.json'

var Voting = contract(voting_artifacts);
var NFTContract = contract(voting_artifacts2);

var candidates = {};
var NFTs = {};

var tokenPrice = null;


window.App = {
 start: function() {
  var self = this;

  Voting.setProvider(web3.currentProvider);
  NFTContract.setProvider(web3.currentProvider);
  self.populateCandidates();
  self.populateNFTs();
 },

 populateCandidates: function() {
  var self = this;
   
  Voting.deployed().then(function(contractInstance) {
   contractInstance.allCandidates.call().then(function(candidateArray) {
    for(let i=0; i < candidateArray.length; i++) {
     /* We store the candidate names as bytes32 on the blockchain. We use the
      * handy toUtf8 method to convert from bytes32 to string
      */
     candidates[web3.toUtf8(candidateArray[i])] = "candidate-" + i;
    }
    console.log("candidate Array = " + JSON.stringify(candidates));
    self.setupCandidateRows();
    self.populateCandidateVotes();
    self.populateTokenData();
   });
  });
 },
 
 populateNFTs: function() {
  var self = this;

  NFTContract.deployed().then(function(contractInstance) {
    contractInstance.allNFTs.call().then(function(NFTArray) {
      console.log("NFTArray first = " + JSON.stringify(NFTArray));
      for(let i=0; i < NFTArray.length; i++) {
        NFTs[NFTArray[i]] = "tokenID-" + i;
      }
      console.log("NFT Array = " + JSON.stringify(NFTs));
      self.setupNFTRows();
      //self.populateNFTIDs();
      self.populateNFTNames();
      //self.populateCreators();
    })
  })
  
 },

 setupCandidateRows: function() {
  console.log("candidate = " + Object.keys(candidates))
  Object.keys(candidates).forEach(function (candidate) { 
   $("#candidate-rows").append("<tr><td>" + candidate + "</td><td id='" + candidates[candidate] + "'></td></tr>");
  });
 },

 setupNFTRows: function() {
  console.log("setupNFTrows NFT Array = " + JSON.stringify(NFTs));
  console.log("NFT = " + Object.keys(NFTs))
  Object.keys(NFTs).forEach(function (NFT) { 
    console.log("inside setupNFTrows");
   $("#NFT-rows").append("<tr><td>" + "NFT_ID_" + NFT + "</td><td id='" + NFTs[NFT] + "'></td></tr>");
  });
 },
 
 populateCandidateVotes: function() {
  let candidateNames = Object.keys(candidates);
  for (var i = 0; i < candidateNames.length; i++) {
   let name = candidateNames[i];
   Voting.deployed().then(function(contractInstance) {
    contractInstance.totalVotesFor.call(name).then(function(v) {
     $("#" + candidates[name]).html(v.toString());
    });
   });
  }
 },


 populateNFTNames: function() {
  console.log("inside populateNFTNames")
  let NFTIDs = Object.keys(NFTs);
  console.log("NFTIDs = " + NFTIDs)
  for(var i=0; i < NFTIDs.length; i++) {
    let nftid = NFTIDs[i];
    NFTContract.deployed().then(function(contractInstance) {
      contractInstance.getNFTname.call(nftid).then(function(v) {
        console.log("1. NFTs[nftid] = " + NFTs[nftid]);
        console.log("2. v.toSting() = " + v.toString());
        $("#" + NFTs[nftid]).html(v.toString());
      })
    })
  }
 },

 populateCreators: function() {
  let NFTIDs = Object.keys(NFTs);
  for(var i=0; i < NFTIDs.length; i++) {
    let nftid = NFTIDs[i];
    NFTContract.deployed().then(function(contractInstance) {
      contractInstance.getCreator.call(nftid).then(function(v) {
        //$("#" + NFTs[nftid]).closest('td').next().find('th').html(v.toString());
        //$("#" + NFTs[nftid]).html(v.toString());
        $("#NFT-rows").append("<tr><td>"+v.toString()+"</td></tr>");
      })
    })
  }
 },

 populateTokenData: function() {
  Voting.deployed().then(function(contractInstance) {

   contractInstance.totalTokens.call().then(function(v) {
    $("#tokens-total").html(v.toString());
   });
   contractInstance.tokensSold.call().then(function(v) {
    $("#tokens-sold").html(v.toString());
   });
   contractInstance.tokenPrice.call().then(function(v) {
    tokenPrice = parseFloat(web3.fromWei(v.toString()));
    $("#token-cost").html(tokenPrice + " Ether");
   });
   web3.eth.getBalance(contractInstance.address, function(error, result) {
    $("#contract-balance").html(web3.fromWei(result.toString()) + " Ether");
   });

  });
 },

 buyTokens: function() {
  var self = this;
  let tokensToBuy = $("#buy").val();
  let price = tokensToBuy * tokenPrice;
  $("#buy-msg").html("Purchase order has been submitted. Please wait.");
  Voting.deployed().then(function(contractInstance) {
   contractInstance.buy({value: web3.toWei(price, 'ether'), from: web3.eth.accounts[0]}).then(function(v) {
    $("#buy-msg").html("");
   })
  });
  self.populateTokenData();
 },

 //function mint(string calldata nftName, string calldata _tokenURI) external payable {
 MintTokens: function() {
  NFTContract.deployed().then(function(contractInstance) {
    let nftName = $("#nft-info").val();
    $("#buy-msg").html("Mint order has been submitted. Please wait.");
    contractInstance.mint(nftName,"http://localhost:8080/#", {gas: 300000, from: web3.eth.accounts[0]}).then(function(v) {
      $("#buy-msg").html("");
    })
  });
},

transferNFT: function() {
  NFTContract.deployed().then(function(contractInstance) {
    let toAddress = $("#to-address").val();
    //    function transferFrom(address _from, address _to, uint256 _tokenId) public payable {
    let NFTid_temp = $("#nft-id").val();
    let NFTid = NFTid_temp.substring(7);
    console.log("to = " + toAddress);
    console.log("nftid = " + NFTid);
    contractInstance.transferNFT(web3.currentProvider.selectedAddress, toAddress, NFTid, {gas: 140000, from: web3.eth.accounts[0]});
  })
},

  /*
  const screenshotTarget = document.getElementById("candidate-rows");
  html2canvas(screenshotTarget).then((canvas) => {
   const base64image = canvas.toDataURL("./screenshots");
   window.location.href = base64image;
  });
  */

 voteForCandidate: function() {
  let candidateName = $("#candidate").val();
  let voteTokens = $("#vote-tokens").val();
  $("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
  $("#candidate").val("");
  $("#vote-tokens").val("");

  Voting.deployed().then(function(contractInstance) {
   contractInstance.voteForCandidate(candidateName, voteTokens, {gas: 140000, from: web3.eth.accounts[0]}).then(function() {
   let div_id = candidates[candidateName];
   return contractInstance.totalVotesFor.call(candidateName).then(function(v) {
    $("#" + div_id).html(v.toString());
    $("#msg").html("");
   });
   });
  });
 },

 lookupVoterInfo: function() {
   let voterAddress = $("#voter-info").val();
   $("#voter-info").val("");

   Voting.deployed().then(function(contractInstance) {
    contractInstance.voterDetails(voterAddress/*, {gas: 140000, from: web3.eth.accounts[0]}*/).then(function(v) {
      $("#tokens-bought").html("NC Tokens bought:" + v[0].toString());
      $("#votes-cast").html("votes-cast [Rama, Nick, Jose]:" + v[1].toString());
    })
   });
 }
};

window.addEventListener('load', async function() {
 if (window.ethereum) {
   await window.ethereum.send('eth_requestAccounts');
   window.web3 = new Web3(window.ethereum);
 }
 else {
  console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
 }

 App.start();
});