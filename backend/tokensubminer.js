"use strict";
const EventParser = require('./modules/eventParser.js');
const LiveParser = require('./modules/liveParser.js');
const express = require('express');
const helmet = require('helmet');
const app = express();
const fs = require('fs');
const Redis = require('ioredis');
const ContractLoader = require('./modules/contractLoader.js');

var twilio = require('twilio');

var twilioClient
try{
  twilioClient = new twilio(fs.readFileSync("twilio.sid").toString().trim(), fs.readFileSync("twilio.token").toString().trim());
}catch(e){}

var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(helmet());
var cors = require('cors')
app.use(cors())
let contracts;
let tokens = [];
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://0.0.0.0:8545'));

var mysql = require('mysql')
let DBCONFIG = JSON.parse(fs.readFileSync("db.creds"))
DBCONFIG.connectionLimit = 10
var mysqlPool  = mysql.createPool(DBCONFIG)

const DESKTOPMINERACCOUNT = 4 //index in geth
const APIKEY = fs.readFileSync("../api.key").toString().trim()
const APPPORT = 10003

let accounts
web3.eth.getAccounts().then((_accounts)=>{
  accounts=_accounts
  console.log("ACCOUNTS",accounts)
})

const NETWORK = parseInt(fs.readFileSync("../deploy.network").toString().trim())
if(!NETWORK){
  console.log("No deploy.network found exiting...")
  process.exit()
}
console.log("NETWORK:",NETWORK)

let subscriptionListKey = "subscriptionListTokenSubDotCom"+NETWORK


let redisHost = 'localhost'
let redisPort = 57300

let LOOPTIME = 15000

if(NETWORK>0&&NETWORK<9){
 redisHost = 'cryptogsnew.048tmy.0001.use2.cache.amazonaws.com'
 redisPort = 6379
 LOOPTIME = 300000
}
let redis = new Redis({
  port: redisPort,
  host: redisHost,
})

console.log("LOADING CONTRACTS")
contracts = ContractLoader(["WasteCoin","Subscription"],web3);

//my local geth node takes a while to spin up so I don't want to start parsing until I'm getting real data
function checkForGeth() {
  contracts["Subscription"].methods.author().call({}, function(error, result){
      console.log("AUTHOR (GETH CHECK) ",error,result)
      if(error){
        setTimeout(checkForGeth,15000);
      }else{
        startParsers()
      }
  });
}
checkForGeth()

function startParsers(){
  web3.eth.getBlockNumber().then((blockNumber)=>{
    setInterval(()=>{
      console.log("::: SUBSCRIPTION CHECKER :::: loading subscriptions from cache...")
      redis.get(subscriptionListKey, async (err, result) => {
        let subscriptions
        try{
          subscriptions = JSON.parse(result)
        }catch(e){contracts = []}
        if(!subscriptions) subscriptions = []
        console.log("current subscriptions:",subscriptions.length)
        for(let t in subscriptions){
          try{
            console.log("Check Sub Signature:",subscriptions[t].signature)
            let contract = new web3.eth.Contract(contracts.Subscription._jsonInterface,subscriptions[t].subscriptionContract)
            console.log("loading hash...")
            let doubleCheckHash = await contract.methods.getSubscriptionHash(subscriptions[t].parts[0],subscriptions[t].parts[1],subscriptions[t].parts[2],subscriptions[t].parts[3],subscriptions[t].parts[4],subscriptions[t].parts[5]).call()
            console.log("doubleCheckHash:",doubleCheckHash)
            console.log("checking if ready...")
            let ready = await contract.methods.isSubscriptionReady(subscriptions[t].parts[0],subscriptions[t].parts[1],subscriptions[t].parts[2],subscriptions[t].parts[3],subscriptions[t].parts[4],subscriptions[t].parts[5],subscriptions[t].signature).call()
            console.log("READY:",ready)
            if(ready){
              console.log("subscription says it's ready...........")
              doSubscription(contract,subscriptions[t])
            }
          }catch(e){console.log(e)}
        }
      });
    },LOOPTIME)
  })
}

function removeSubscription(sig){
  redis.get(subscriptionListKey, function (err, result) {
    let subscriptions
    try{
      subscriptions = JSON.parse(result)
    }catch(e){subscriptions = []}
    if(!subscriptions) subscriptions = []
    let newSubscriptions = []
    for(let t in subscriptions){
      if(subscriptions[t].signature!=sig){
        newSubscriptions.push(subscriptions[t])
      }
    }
    redis.set(subscriptionListKey,JSON.stringify(newSubscriptions),'EX', 60 * 60 * 24 * 7);
  });
}

app.get('/clear/:key', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if(req.params.key == APIKEY){
    console.log("/clear")
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({hello:"world"}));
    redis.set(subscriptionListKey,JSON.stringify([]),'EX', 60 * 60 * 24 * 7);
  }else{
    res.end(JSON.stringify({hello:"world"}));
  }

});

app.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/")
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({hello:"world"}));
});

app.get('/miner', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/miner")
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({address:accounts[DESKTOPMINERACCOUNT]}));
});

app.get('/subscriptions', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/subscriptions")
  redis.get(subscriptionListKey, function (err, result) {
    res.set('Content-Type', 'application/json');
    res.end(result);
  })
});

app.get('/subscription/:subscriptionHash', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/subscription/"+req.params.subscriptionHash)
  let sigsKey = req.params.contract+"sigs"
  redis.get(subscriptionListKey, function (err, result) {
    res.set('Content-Type', 'application/json');

    let subscriptions
    try{
      subscriptions = JSON.parse(result)
    }catch(e){subscriptions = []}
    for(let t in subscriptions){
      if(subscriptions[t].subscriptionHash==req.params.subscriptionHash){
        res.end(JSON.stringify(subscriptions[t]));
      }
    }

    res.end(JSON.stringify(false));
  })
});

app.post('/sign', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/sign",req.body)
  let account = web3.eth.accounts.recover(req.body.message,req.body.sig)
  console.log("RECOVERED:",account)
  if(account.toLowerCase()==req.body.account.toLowerCase()){
    console.log("Correct sig... log them into the contract...")
    let sigsKey = req.body.address+"sigs"
    redis.get(sigsKey, function (err, result) {
      let sigs
      try{
        sigs = JSON.parse(result)
      }catch(e){sigs = []}
      if(!sigs) sigs = []
      console.log("current sigs:",sigs)
      if(sigs.indexOf(req.body.account.toLowerCase())<0){
        sigs.push(req.body.account.toLowerCase())
        console.log("saving sigs:",sigs)
        redis.set(sigsKey,JSON.stringify(sigs),'EX', 60 * 60 * 24 * 7);
      }
    });
  }
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({hello:"world"}));
});

app.post('/deploysub', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/deploysub ",req.body)
  let deployingAddress = req.body.deployingAddress
  let deployedContractsKey = "deployedtokensubscriptioncontracts"+NETWORK
  redis.get(deployedContractsKey, function (err, result) {
    let contracts
    try{
      contracts = JSON.parse(result)
    }catch(e){contracts = []}
    if(!contracts) contracts = []
    console.log("current contracts:",contracts)
    if(contracts.indexOf(deployingAddress)<0){
      contracts.push(deployingAddress)
    }
    console.log("saving contracts:",contracts)
    redis.set(deployedContractsKey,JSON.stringify(contracts),'EX', 60 * 60 * 24 * 7);
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({contract:deployingAddress}));
    if(NETWORK==1){
      twilioClient.messages.create({
          to:'+13038345151',
          from:'+17206059912',
          body:'TokenSubscription Deployed '+deployingAddress
      }, function(error, message) {
          if (!error) {
              console.log('Success! The SID for this SMS message is:');
              console.log(message.sid);
              console.log('Message sent on:');
              console.log(message.dateCreated);
          } else {
              console.log('Oops! There was an error.');
          }
      });
    }

  });
})

app.get('/contracts/:key', (req, res) => {
  if(req.params.key == APIKEY){
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("/contracts")
    let deployedContractsKey = "deployedtokensubscriptioncontracts"+NETWORK
    redis.get(deployedContractsKey, function (err, result) {
      res.set('Content-Type', 'application/json');
      res.end(result);
    })
  }else{
    res.end("no");
  }
});

app.get('/abi/:address', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/abi",req.params)
  let abiString = false
  for(let c in contracts){
    if(contracts[c]._address.toLowerCase()==req.params.address.toLowerCase()){
      res.set('Content-Type', 'application/json');
      console.log("Found matching address:",contracts[c])
      try{
        abiString = JSON.stringify(contracts[c]._jsonInterface)
      }catch(e){
        console.log(e)
      }
    }
  }
  if(abiString){
    res.end(JSON.stringify({status: "1", message: "OK", result:abiString}));
  }else{
    res.end(JSON.stringify({status: "0", message: "UNKNOWN ADDRESS"}));
  }


})

app.post('/saveSubscription', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("/saveSubscription",req.body)
  let account = web3.eth.accounts.recover(req.body.subscriptionHash,req.body.signature)////instead of trusting the hash you pass them you should really go get it yourself once the parts look good
  console.log("RECOVERED:",account)
  if(account.toLowerCase()==req.body.parts[0].toLowerCase()){
    console.log("Correct sig... relay subscription to contract... might want more filtering here, but just blindly do it for now")
    redis.get(subscriptionListKey, function (err, result) {
      let subscriptions
      try{
        subscriptions = JSON.parse(result)
      }catch(e){contracts = []}
      if(!subscriptions) subscriptions = []
    //  console.log("current subscriptions:",subscriptions)
      subscriptions.push(req.body)
    //  console.log("saving subscriptions:",subscriptions)
      redis.set(subscriptionListKey,JSON.stringify(subscriptions),'EX', 60 * 60 * 24 * 7);
    });
  }
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({subscriptionHash:req.body.subscriptionHash}));

  if(NETWORK==1){
    twilioClient.messages.create({
        to:'+13038345151',
        from:'+17206059912',
        body:'TokenSubscription Subscribe '+req.body.subscriptionHash
    }, function(error, message) {
        if (!error) {
            console.log('Success! The SID for this SMS message is:');
            console.log(message.sid);
            console.log('Message sent on:');
            console.log(message.dateCreated);
        } else {
            console.log('Oops! There was an error.');
        }
    });
  }

});





///////////////////------------------------------------------------------------------------------------ JER's API

/**
 * Get all Grants
 */
app.get('/grants', (req, res) => {
  console.log('/grants',req.params)
  // @TODO need to implement pagination
  mysqlPool.query('SELECT * FROM EthGrants', function (error, results, fields) {
    if (error) throw error
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
  })
})

/**
 * Find a grant by ID
 */
app.get('/grants/:id', (req, res) => {
  console.log('/grands/:id',req.params.id)
  mysqlPool.query('SELECT * FROM EthGrants WHERE id = ?', req.params.id, function (error, results, fields) {
    if (error) throw error
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
  })
})

/**
 * Create a new Grant
 */
app.post('/grants/create', (req, res) => {
  console.log('/grants/create', req.body)

  // TODO will need to recover a sig from the hash of the details to make sure the signer matches the deployed contract's author
  // let signer = web3.eth.accounts.recover(req.body.message,req.body.sig)

  mysqlPool.query('INSERT INTO EthGrants SET ?', req.body, function (error, results, fields) {
    if (error) throw error
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
  })
})

/**
 * Update a Grant
 */
app.put('/grants/update/:id', (req, res) => {
  console.log('/grants/update', req.body)

  // TODO will need to recover a sig from the hash of the details to make sure the signer matches the deployed contract's author
  // let signer = web3.eth.accounts.recover(req.body.message,req.body.sig)

  // @TODO need to figure out what fields are updateable
  /*
  mysqlPool.query('UPDATE EthGrants SET ', req.body, function (error, results, fields) {
    if (error) throw error
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
  })
  */
  res.end(JSON.stringify('endpoint not implemented'))
})
///////////////////------------------------------------------------------------------------------------ END JER's API


app.listen(APPPORT);
console.log(`http listening on `,APPPORT);


function doTransaction(contract,txObject){
  //console.log(contracts.BouncerProxy)
  console.log("Forwarding tx to ",contract._address," with local account ",accounts[3])
  let txparams = {
    from: accounts[DESKTOPMINERACCOUNT],
    gas: txObject.gas,
    gasPrice:Math.round(4 * 1000000000)
  }
  //const result = await clevis("contract","forward","BouncerProxy",accountIndexSender,sig,accounts[accountIndexSigner],localContractAddress("Example"),"0",data,rewardAddress,reqardAmount)
  console.log("TX",txObject.sig,txObject.parts[1],txObject.parts[2],txObject.parts[3],txObject.parts[4],txObject.parts[5],txObject.parts[6],txObject.parts[7])
  console.log("PARAMS",txparams)
  contract.methods.forward(txObject.sig,txObject.parts[1],txObject.parts[2],txObject.parts[3],txObject.parts[4],txObject.parts[5],txObject.parts[6],txObject.parts[7]).send(
  txparams ,(error, transactionHash)=>{
    console.log("TX CALLBACK",error,transactionHash)
  })
  .on('error',(err,receiptMaybe)=>{
    console.log("TX ERROR",err,receiptMaybe)
  })
  .on('transactionHash',(transactionHash)=>{
    console.log("TX HASH",transactionHash)
  })
  .on('receipt',(receipt)=>{
    console.log("TX RECEIPT",receipt)
  })
  /*.on('confirmation', (confirmations,receipt)=>{
    console.log("TX CONFIRM",confirmations,receipt)
  })*/
  .then((receipt)=>{
    console.log("TX THEN",receipt)
  })
}

function doSubscription(contract,subscriptionObject){
  //console.log(contracts.BouncerProxy)
  console.log("!!!!!!!!!!!!!!!!!!!        ------------ Running subscription on contract ",contract._address," with local account ",accounts[3])
  let txparams = {
    from: accounts[DESKTOPMINERACCOUNT],
    gas: 1000000,
    gasPrice:Math.round(4 * 1000000000)
  }

  //const result = await clevis("contract","forward","BouncerProxy",accountIndexSender,sig,accounts[accountIndexSigner],localContractAddress("Example"),"0",data,rewardAddress,reqardAmount)
  console.log("subscriptionObject",subscriptionObject.parts[0],subscriptionObject.parts[1],subscriptionObject.parts[2],subscriptionObject.parts[3],subscriptionObject.parts[4],subscriptionObject.parts[5],subscriptionObject.signature)
  console.log("PARAMS",txparams)
  console.log("---========= EXEC ===========-----")
  console.log(subscriptionObject)
  contract.methods.executeSubscription(subscriptionObject.parts[0],subscriptionObject.parts[1],subscriptionObject.parts[2],subscriptionObject.parts[3],subscriptionObject.parts[4],subscriptionObject.parts[5],subscriptionObject.signature).send(
  txparams ,(error, Hash)=>{
    console.log("TX CALLBACK",error,Hash)
  })
  .on('error',(err,receiptMaybe)=>{
    console.log("TX ERROR",err,receiptMaybe)
  })
  .on('subscriptionHash',(subscriptionHash)=>{
    console.log("TX HASH",subscriptionHash)
  })
  .on('receipt',(receipt)=>{
    console.log("TX RECEIPT",receipt)
  })
  /*.on('confirmation', (confirmations,receipt)=>{
    console.log("TX CONFIRM",confirmations,receipt)
  })*/
  .then((receipt)=>{
    console.log("TX THEN",receipt)
  })
}
