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
      <div className="container">
        Publisher Deploy Page
        <div>
          {contractAddress} {deployed}
        </div>
        <div>
          ~~ url, qr code, embed stuff here ~~
          <pre>{url}</pre>
        </div>
      </div>
    );
  }
}

export default PublisherDeploy;
