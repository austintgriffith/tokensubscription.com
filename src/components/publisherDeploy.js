import React, { Component } from 'react';
import Loader from '../loader.gif';
var QRCode = require('qrcode.react');

class PublisherDeploy extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    let {deployingAddress,deployedAddress} = this.props

    let contractAddress = deployingAddress


    let url = window.location.origin+"/"+contractAddress


    let deployed = ""
    if(deployedAddress){
      contractAddress=deployedAddress
      url = window.location.origin+"/"+contractAddress
      return (
        <div>
          <h1>Congratulations, your contract is ready.</h1>
          <h3>You can now accept subscriptions!</h3>
          <p>Follow the instructions below to share your 'Subscribe' link:</p>
          <div>
            {contractAddress} {deployed}
          </div>
          <div>
            <p>You can put a simple button on your website by copying the html code below.</p>
            <pre>{"<a href='"+url+"' target='_blank'>Subscribe Now</a>"}</pre>
            <div>Share Url:</div>
            <pre>{url}</pre>
            <QRCode value={url} />
            <div>Embed Script:</div>
            <pre>{"<script type='text/javascript' src='https://tokensubscription.com/coinsubscription.js' id='coinsubscription'></script>\n<script type='text/javascript'>COINSUBSCRIPTION.init(['we2334asdf34asdfasdr32']);</script>"}</pre>
          </div>
        </div>
      );
    }else{
      return (
        <div>
          <img src={Loader}/>
          <h3>Once your contract deploys you can accept subscriptions:</h3>
          <p>Follow the instructions below to share your 'Subscribe' link:</p>
          <div>
            {contractAddress}
          </div>
          <div>
            <p>You can put a simple button on your website by copying the html code below.</p>
            <pre>{"<a href='"+url+"' target='_blank'>Subscribe Now</a>"}</pre>
            <div>Share Url:</div>
            <pre>{url}</pre>
            <QRCode value={url} />
            <div>Embed Script:</div>
            <pre>{"<script type='text/javascript' src='https://tokensubscription.com/coinsubscription.js' id='coinsubscription'></script>\n<script type='text/javascript'>COINSUBSCRIPTION.init(['we2334asdf34asdfasdr32']);</script>"}</pre>
          </div>
        </div>
      );
    }
  }
}

export default PublisherDeploy;
