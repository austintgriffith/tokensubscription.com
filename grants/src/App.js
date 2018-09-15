import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Metamask, Gas, ContractLoader, Transactions, Button, Scaler } from "dapparatus"
import Web3 from 'web3';
import './App.css';

import Home from './components/Home';
import GrantsList from './components/GrantsList';
import CreateGrants from './components/CreateGrants';
import GrantDetails from './components/GrantDetails';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      web3: false,
      account: false,
      gwei: 4,
    }
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
