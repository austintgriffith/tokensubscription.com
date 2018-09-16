import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Metamask, Gas, ContractLoader, Transactions, Button, Scaler } from "dapparatus"
import RLP from 'rlp';
import axios from 'axios'
import Web3 from 'web3';
import './App.css';

import Coins from './coins.js'
import Home from './components/Home';
import GrantsList from './components/GrantsList';
import CreateGrants from './components/CreateGrants';
import GrantDetails from './components/GrantDetails';

let backendUrl = "http://localhost:10003/"
if(window.location.href.indexOf("tokensubscription.com")>=0)
{
  backendUrl = "https://relay.tokensubscription.com/"
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toAddress:"0x0000000000000000000000000000000000000000",
      author:"0x0000000000000000000000000000000000000000",
      web3: false,
      account: false,
      gwei: 4,
      title: '',
      pitch: '',
      desc: '# This is a preview',
      deploying: false,
      contractAddress: false,
      deployingGrantContract: false,
      ///SUBSCRIBE DEFUALTS:
      tokenAmount: 10,
      timeAmount: 1,
      timeType:"months",
      tokenAddress:"0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
      gasPrice:0.25,
      tokenName:"DAI",
    }

    this.handleInput = this.handleInput.bind(this)
    this.deployGrantContract = this.deployGrantContract.bind(this)
    this.sendSubscription = this.sendSubscription.bind(this)
    this.submitGrant = this.submitGrant.bind(this)
  }

  async sendSubscription(){
    let {backendUrl,web3,account,contract} = this.props
    let {toAddress,timeType,tokenAmount,tokenAddress,gasPrice} = this.state

    let subscriptionContract = this.props.customContractLoader("Subscription",this.props.contract)

    let value = 0
    let txData = "0x02" //something like this to say, hardcoded VERSION 2, we're sending approved tokens
    let gasLimit = 120000

    let periodSeconds = this.state.timeAmount;
    if(timeType=="minutes"){
      periodSeconds*=60
    }else if(timeType=="hours"){
      periodSeconds*=3600
    }else if(timeType=="days"){
      periodSeconds*=86400
    }else if(timeType=="months"){
      periodSeconds*=2592000
    }

    if(!gasPrice) gasPrice = 0


    //TODO know decimals and convert here
    let realTokenAmount = tokenAmount*10**18
    let realGasPrice = gasPrice*10**18
    /*
    address from, //the subscriber
    address to, //the publisher
    address tokenAddress, //the token address paid to the publisher
    uint256 tokenAmount, //the token amount paid to the publisher
    uint256 periodSeconds, //the period in seconds between payments
    uint256 gasPrice, //the amount of tokens or eth to pay relayer (0 for free)
     */

    const parts = [
      account,
      toAddress,
      tokenAddress,
      web3.utils.toTwosComplement(realTokenAmount),
      web3.utils.toTwosComplement(periodSeconds),
      web3.utils.toTwosComplement(realGasPrice),
    ]
    /*web3.utils.padLeft("0x"+nonce,64),*/
    console.log("PARTS",parts)

    const subscriptionHash = await subscriptionContract.getSubscriptionHash(...parts).call()
    console.log("subscriptionHash",subscriptionHash)

    let signature = await web3.eth.personal.sign(""+subscriptionHash,account)
    console.log("signature",signature)
    let postData = {
      subscriptionContract:subscriptionContract._address,
      parts:parts,
      subscriptionHash: subscriptionHash,
      signature:signature,
    }

    console.log("postData",postData)
    axios.post(backendUrl+'saveSubscription', postData, {
      headers: {
          'Content-Type': 'application/json',
      }
    }).then((response)=>{
      console.log("TX RESULT",response.data.subscriptionHash)
      window.location = "/"+response.data.subscriptionHash
    })
    .catch((error)=>{
      console.log(error);
    });
  }


  async deployGrantContract(toAddress,tokenName,tokenAmount,timeType,timeAmount,gasPrice,email) {
    let {web3,tx,contracts} = this.state

    if(!web3){
      alert("Please install and unlock web3. (MetaMask, Trust, etc)")
    }else{



      //requiredToAddress,requiredTokenAddress,requiredTokenAmount,requiredPeriodSeconds,requiredGasPrice
      let requiredToAddress = "0x0000000000000000000000000000000000000000"
      if(toAddress){
        requiredToAddress = toAddress
      }

      let foundToken
      let requiredTokenAddress = "0x0000000000000000000000000000000000000000"
      if(tokenName){
        //translate tokenName to tokenAddress
        for(let i = 0; i < this.state.coins.length; i++){
          if(tokenName == this.state.coins[i].address){
            requiredTokenAddress = this.state.coins[i].address
            foundToken = this.state.coins[i]
          }
        }
      }

      let requiredPeriodSeconds=0
      if(timeAmount){
        //translate timeAmount&timeType to requiredPeriodSeconds
        let periodSeconds = timeAmount;
        if(timeType=="minutes"){
          periodSeconds*=60
        }else if(timeType=="hours"){
          periodSeconds*=3600
        }else if(timeType=="days"){
          periodSeconds*=86400
        }else if(timeType=="months"){
          periodSeconds*=2592000
        }
        if(periodSeconds){
          requiredPeriodSeconds=periodSeconds
        }
      }

      let requiredTokenAmount=0
      let requiredGasPrice=0
      if(tokenAmount && foundToken){
        //don't forget decimals.. you do a number * (10**##DECIMALS##)
        requiredTokenAmount = tokenAmount * (10**foundToken.decimals)
        if(gasPrice && foundToken){
          //don't forget decimals.. you do a number * (10**##DECIMALS##)
          requiredGasPrice = gasPrice * (10**foundToken.decimals)
          requiredTokenAmount -= requiredGasPrice
        }
      }


      console.log("we can guess what the contract address is going to be, this let's us get the UI going without it being deployed yet...")
      let txCount = await this.state.web3.eth.getTransactionCount(this.state.account,'pending')
      let deployingAddress = "0x"+this.state.web3.utils.keccak256(RLP.encode([this.state.account,txCount])).substr(26)
      this.setState({deployingAddress:deployingAddress})

      console.log("Deploying Subscription Contract...")
      let code = require("./contracts/Subscription.bytecode.js")

      let args = [
        requiredToAddress,
        requiredTokenAddress,
        web3.utils.toTwosComplement(requiredTokenAmount),
        web3.utils.toTwosComplement(requiredPeriodSeconds),
        web3.utils.toTwosComplement(requiredGasPrice)
      ]

      console.log("ARGS",args)

      this.setState({deployingGrantContract:true})

      tx(contracts.Subscription._contract.deploy({data:code,arguments:args}),1000000,(receipt)=>{
        console.log("~~~~~~ DEPLOY FROM DAPPARATUS:",receipt)
        if(receipt.contractAddress){
          console.log("CONTRACT DEPLOYED:",receipt.contractAddress)
          this.setState({deployedAddress:receipt.contractAddress,deployingGrantContract:false})
        }
      })

      axios.post(backendUrl+'deploysub',{arguments:args,email:email,deployingAddress:deployingAddress}, {
        headers: {
            'Content-Type': 'application/json',
        }
      }).then((response)=>{
        console.log("SAVED INFO",response.data)
      })
      .catch((error)=>{
        console.log(error);
      });
    }
  }




  submitGrant(hash,sig){
    let {title,pitch,deployedAddress,desc} = this.state
    axios.post(backendUrl+'grants/create',{hash,sig,title,pitch,deployedAddress,desc}, {
      headers: {
          'Content-Type': 'application/json',
      }
    }).then((response)=>{
      console.log("SAVED INFO",response.data)
    })
    .catch((error)=>{
      console.log(error);
    });
  }

  handleInput(e,data){
    let update = {}
    if(data){
      update[data.name] = data.value
    }else{
      let value = e.target.value
      if(e.target.name=="title") value = value.substring(0,82) //limit title characters
      if(e.target.name=="pitch") value = value.substring(0,230) //limit pitch characters
      update[e.target.name] = value
    }
    this.setState(() => (update));
  }

  save(state){
    this.setState(state)
  }

  render() {
    console.log(this.state.title)
    let {web3,account,contracts,tx,gwei,block,avgBlockTime,etherscan} = this.state
    console.log(this.state)
    let extraRoutes = ""
    let connectedDisplay = []
    if(web3){
      extraRoutes = (
        <div>
          <Route path="/create/:id?" render={(props) => {
            return <CreateGrants
              {...props}
              {...this.state}
              handleInput={this.handleInput}
              submitGrant={this.submitGrant}
              backendUrl={backendUrl}
              save={this.save.bind(this)}
              deployGrantContract={this.deployGrantContract}
            />
          }} />
          <Route path="/view/:id" render={(props) => {
            return <GrantDetails
              {...props}
              {...this.state}
              backendUrl={backendUrl}
              handleInput={this.handleInput}
              save={this.save.bind(this)}
              sendSubscription={this.sendSubscription}
            />
          }} />
        </div>
      )
      connectedDisplay.push(
       <Gas
         key="Gas"
         onUpdate={(state)=>{
           console.log("Gas price update:",state)
           this.setState(state,()=>{
             console.log("GWEI set:",this.state)
           })
         }}
       />
      )
      connectedDisplay.push(
        <ContractLoader
         key="ContractLoader"
         config={{DEBUG:false}}
         web3={web3}
         require={path => {return require(`${__dirname}/${path}`)}}
         onReady={(contracts,customLoader)=>{
           console.log("contracts loaded",contracts)
           this.setState({contractLink:contracts.Subscription._address,contracts:contracts,customContractLoader:customLoader,coins:Coins},async ()=>{
             console.log("Contracts Are Ready:",this.state.contracts)
           })
         }}
        />
      )
      connectedDisplay.push(
        <Transactions
          key="Transactions"
          config={{DEBUG:false}}
          account={account}
          gwei={gwei}
          web3={web3}
          block={block}
          avgBlockTime={avgBlockTime}
          etherscan={etherscan}
          onReady={(state)=>{
            console.log("Transactions component is ready:",state)
            this.setState(state)
          }}
          onReceipt={(transaction,receipt)=>{
            // this is one way to get the deployed contract address, but instead I'll switch
            //  to a more straight forward callback system above
            console.log("Transaction Receipt",transaction,receipt)
          }}
        />
      )
    }
    return (
      <Router>
        <div className="wrapper">
          <Metamask
            config={{
              requiredNetwork:['Unknown','Rinkeby','Mainnet'],
              boxStyle: {
                paddingRight:75,
                marginTop:0,
                paddingTop:10,
                zIndex:10,
                textAlign:"right",
                width:300,
              }
            }}
            onUpdate={(state)=>{
             console.log("metamask state update:",state)
             this.setState({toAddress:state.account},()=>{
               console.log("TOADDRESS:",this.state.toAddress)
             })
             if(state.web3Provider) {
               state.web3 = new Web3(state.web3Provider)
               this.setState(state)
             }
            }}
          />
          {connectedDisplay}

          <ul className="nav">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/list">Fund A Grant</Link></li>
            <li><Link to="/create">Create A Grant</Link></li>
          </ul>

          <Route exact path="/" component={Home} />
          <Route path="/list" render={(props) => <GrantsList {...props} backendUrl={backendUrl} />} />
          {extraRoutes}
        </div>
      </Router>
    )
  }
}

export default App;
