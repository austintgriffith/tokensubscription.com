import React, { Component } from 'react';
import './App.css';
import { Metamask, Gas, ContractLoader, Transactions, Events, Scaler, Blockie, Address, Button } from "dapparatus"
import Web3 from 'web3';
import Subscriber from './components/subscriber.js'
import Publisher from './components/publisher.js'
import PublisherDeploy from './components/publisherDeploy.js'
import Coins from './contracts/coins.js'
import queryString from 'query-string';
var RLP = require('rlp');

class App extends Component {
  constructor(props) {
    super(props);
    let contract = window.location.pathname.replace("/","")
    let startMode = ""
    if(contract){
      startMode = "subscriber"
    }
    this.state = {
      web3: false,
      account: false,
      gwei: 4,
      doingTransaction: false,
      contract: contract,
      mode: startMode
    }
  }

  async deploySubscription(toAddress,tokenName,tokenAmount,timeType,timeAmount,gasPrice) {
    console.log("deploySubscription",this.state)
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
      for(let i = 0; i < Coins.length; i++){
        if(tokenName == Coins[i].name){
          requiredTokenAddress = Coins[i].address
          foundToken = Coins[i]
        }
      }
    }

    let requiredTokenAmount=0
    if(tokenAmount && foundToken){
      //don't forget decimals.. you do a number * (10**##DECIMALS##)
      requiredTokenAmount = tokenAmount * (10**foundToken.decimals)
    }

    let requiredPeriodSeconds=0
    if(timeAmount){
      //translate timeAmount&timeType to requiredPeriodSeconds
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
    }

    let requiredGasPrice=0
    if(gasPrice && foundToken){
      //don't forget decimals.. you do a number * (10**##DECIMALS##)
      requiredGasPrice = gasPrice * (10**foundToken.decimals)
    }

    console.log("we can guess what the contract address is going to be, this let's us get the UI going without it being deployed yet...")
    let txCount = await this.state.web3.eth.getTransactionCount(this.state.account,'pending')
    let deployingAddress = "0x"+this.state.web3.utils.keccak256(RLP.encode([this.state.account,txCount])).substr(26)
    this.setState({deployingAddress:deployingAddress})

    console.log("Deploying Subscription Contract...")
    let code = require("./contracts/Subscription.bytecode.js")
    console.log(code)
    console.log(contracts)

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
           this.setState({contracts:contracts},async ()=>{
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

      if(contracts&&mode){

        let body
        if(mode=="subscriber"){

          if(deployingAddress||deployedAddress){
            body = (
              <div>
                subscriber deploy page {deployingAddress} => {deployedAddress}
              </div>
            )
          }else{
            body = (
              <Subscriber {...this.state} deploySubscription={this.deploySubscription.bind(this)}/>
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
