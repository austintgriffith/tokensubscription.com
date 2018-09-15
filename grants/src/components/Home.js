import React from 'react';

const Home = () => (
  <div className="container text-center">
    <h2>ETH Grants</h2>
    <p>Recurring Ethereum funding via token subscriptions powered by meta transactions</p>

    <div style={{marginTop:200,opacity:0.7,fontSize:15}}>
        <div>Disclaimer: <span style={{color:"#FFFFFF"}}>We built this in a weekend!</span></div>
        <div>You should inspect <a style={{color:"#dddddd"}} href={"https://etherscan.io/address/0x49748b0380d9370795CbD6809E52C927072107dC"}>our smart contract</a> before using.</div>
        <div>100% free and open source! Please <a style={{color:"#dddddd"}} href="https://github.com/austintgriffith/tokensubscription.com">contribute</a>!</div>
    </div>
  </div>
)

export default Home;