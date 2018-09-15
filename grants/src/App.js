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
    super(props)
    this.state = {
      web3: false,
      account: false,
      gwei: 4,
    }
  }
  async deploySubscription(toAddress,tokenName,tokenAmount,timeType,timeAmount,gasPrice,email) {
    let {web3,tx,contracts} = this.state

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

    tx(contracts.Subscription._contract.deploy({data:code,arguments:args}),1000000,(receipt)=>{
      console.log("~~~~~~ DEPLOY FROM DAPPARATUS:",receipt)
      if(receipt.contractAddress){
        console.log("CONTRACT DEPLOYED:",receipt.contractAddress)
        this.setState({deployedAddress:receipt.contractAddress})
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
  render() {
    let {web3,account,contracts,tx,gwei,block,avgBlockTime,etherscan} = this.state
    console.log(this.state)
    let connectedDisplay = []
    if(web3){
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
         config={{DEBUG:true}}
         web3={web3}
         require={path => {return require(`${__dirname}/${path}`)}}
         onReady={(contracts,customLoader)=>{
           console.log("contracts loaded",contracts)
           this.setState({contractLink:contracts.Subscription._address,contracts:contracts,customContractLoader:customLoader},async ()=>{
             console.log("Contracts Are Ready:",this.state.contracts)
           })
         }}
        />
      )
      connectedDisplay.push(
        <Transactions
          key="Transactions"
          config={{DEBUG:true}}
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
            <li><Link to="/view/1">Grant Details</Link></li>
          </ul>

          <Route exact path="/" component={Home} />
          <Route path="/list" component={GrantsList} />
          <Route path="/create" component={CreateGrants} />
          <Route path="/view/:id" component={GrantDetails} />
        </div>
      </Router>
    )
  }
}

export default App;
