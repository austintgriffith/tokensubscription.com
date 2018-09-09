import React, { Component } from 'react';

class PublisherDeploy extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    let {deployingAddress,deployedAddress} = this.props

    let contractAddress = deployingAddress
    let deployed = ""
    if(deployedAddress){
      contractAddress=deployedAddress
      deployed=(
        <div>DEPLOYED!</div>
      )
    }

    let url = window.location.origin+"/"+contractAddress
    return (
      <div>
        <h1>Congratulations, your contract is setup</h1>
        <h3>You you are now ready to start accepting subscriptions!</h3>
        <p>Follow the instructions below to setup your method for people to start subscribing</p>
        <div>
          {contractAddress} {deployed}
        </div>
        <div>
          <p>You can put a simple button on your website by copying the html code below.</p>
          <div className="code"><pre><a href="{url}" target="_blank">Subscribe Now</a></pre></div>
          ~~ url, qr code, embed stuff here ~~
          <pre>{url}</pre>
        </div>
      </div>
    );
  }
}

export default PublisherDeploy;
