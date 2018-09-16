import React from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';

import logo from '../assets/img/logo-icon.png';

const Disclaimer = styled.div`
display: inline-block;
padding: 1.5rem;
background: rgba(0,0,0,0.6);
border: 1px solid #111;
opacity:0.8;
font-size: 14px;
@media (min-width: 768px) {
    margin-top: 10rem;
    font-size: 16px;
}
`

const Home = () => (
  <div className="container text-center">
    <p><img src={logo} alt="ETH Grants"></img></p>
    <h1>ETH Grants</h1>
    <p className="lead mb-5">Recurring Ethereum funding via token subscriptions powered by meta transactions</p>
    <p className="mb-5"><Link className="btn btn-lg btn-outline-primary mx-3" to="/create">Create A Grant</Link> <Link className="btn btn-lg btn-outline-primary mx-3" to="/list">Fund A Grant</Link></p>
    <Disclaimer>
        <p className="mb-1">Disclaimer: We built this in a weekend!</p>
        <p className="mb-1">You should inspect <a href="https://etherscan.io/address/0x49748b0380d9370795CbD6809E52C927072107dC" target="blank">our smart contract</a> before using.</p>
        <p className="mb-1">100% free and open source! Please <a href="https://github.com/austintgriffith/tokensubscription.com" target="blank">contribute</a>!</p>
    </Disclaimer>
  </div>
)

export default Home;
