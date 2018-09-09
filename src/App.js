import React, { Component } from 'react';
import './App.css';
import { Metamask, Gas, ContractLoader, Transactions, Events, Scaler, Blockie, Address, Button } from "dapparatus"
import Web3 from 'web3';
import Subscriber from './components/subscriber.js'
import Publisher from './components/publisher.js'
import PublisherDeploy from './components/publisherDeploy.js'
import SubscriberApprove from './components/subscriberApprove.js'
import Coins from './coins.js'
import queryString from 'query-string';
var RLP = require('rlp');

let backendUrl = "http://localhost:10003/"

class App extends Component {
  constructor(props) {
    super(props);
    let contract
    let subscription
    let path = window.location.pathname.replace("/","")
    if(path.length==42){
      contract = path
    }else if(path.length==66){
      subscription = path
    }else{
      console.log("PATH LENGTH UNKNWON",path,path.length)
    }
    let startMode = ""
    if(contract||subscription){
      startMode = "subscriber"
    }

    this.state = {
      web3: false,
      account: false,
      gwei: 4,
      doingTransaction: false,
      contract: contract,
      subscription: subscription,
      mode: startMode,
      coins:false
    }
  }

  async deploySubscription(toAddress,tokenName,tokenAmount,timeType,timeAmount,gasPrice) {
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


  }
  handleInput(e){
    let update = {}
    update[e.target.name] = e.target.value
    this.setState(update)
  }
  render() {
    const { error, isLoaded, items } = this.state;
    let {web3,account,contracts,tx,gwei,block,avgBlockTime,etherscan,mode,deployingAddress,deployedAddress} = this.state
    let connectedDisplay = []
    let contractsDisplay = []
    let noWeb3Display = ""
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
           this.setState({contracts:contracts,customContractLoader:customLoader},async ()=>{
             console.log("Contracts Are Ready:",this.state.contracts)
             Coins.unshift(
               {
                   address:this.state.contracts.TokenExampleSubscriptionToken._address,
                   name:"TEST",
                   symbol:"TEST",
                   decimals:18,
                   imageUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png"
               },
               {
                   address:"0x0000000000000000000000000000000000000000",
                   name:"ANY",
                   symbol:"*",
                   decimals:18,
                   imageUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png"
               }
             )
             this.setState({coins:Coins})
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

      if(contracts&&mode){

        let body
        if(mode=="subscriber"){
          if(this.state.subscription){
            body = (
              <SubscriberApprove
                {...this.state}
                backendUrl={backendUrl}
              />
            )
          }else if(deployingAddress||deployedAddress){
            body = (
              <div>
                subscriber deploy page {deployingAddress} => {deployedAddress}
              </div>
            )
          }else{
            body = (
              <Subscriber
                {...this.state}
                backendUrl={backendUrl}
                deploySubscription={this.deploySubscription.bind(this)}
              />
            )
          }

        }else{
          if(deployingAddress||deployedAddress){
            body = (
              <PublisherDeploy {...this.state}
                deployingAddress={deployingAddress}
                deployedAddress={deployedAddress}
              />
            )
          }else{
            body = (
              <Publisher {...this.state} deploySubscription={this.deploySubscription.bind(this)}/>
            )
          }
        }

        contractsDisplay.push(
          <div key="UI" style={{padding:30}}>
            <a href="/"><h4>tokensubscription.com</h4></a>
            <div>
              {body}
            </div>
          </div>
        )
      }else{
        connectedDisplay.push(
          <div key="mainUI">

            <h1>tokensubscription.com</h1>
                {this.state.contract}

            <Button size="2" onClick={()=>{
                this.setState({mode:"subscriber"})
              }}>
              Send Tokens on Subscription
            </Button>
            <Button size="2" onClick={()=>{
                this.setState({mode:"publisher"})
              }}>
              Accept Tokens on Subscription
            </Button>

          </div>
        )
      }
    }else{
      noWeb3Display = (
        <div key="mainUI">

          <h1>tokensubscription.com</h1>

          <Button size="2" onClick={()=>{
              alert("Please connect and unlock web3 to send tokens.")
            }}>
            Send Tokens on Subscription
          </Button>
          <Button size="2" onClick={()=>{
              alert("Please connect and unlock web3 to accept tokens.")
            }}>
            Accept Tokens on Subscription
          </Button>

        </div>
      )
    }
    return (
      <div className="App">
        <Metamask
          config={{requiredNetwork:['Unknown','Rinkeby','Mainnet']}}
          onUpdate={(state)=>{
           console.log("metamask state update:",state)
           if(state.web3Provider) {
             state.web3 = new Web3(state.web3Provider)
             this.setState(state)
           }
          }}
        />
        {connectedDisplay}
        {contractsDisplay}
        {noWeb3Display}
      </div>
    );
  }
}

export default App;
