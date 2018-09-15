import React, { Component } from 'react';
import axios from 'axios';

export default class GrantDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      grantData: []
    }
  }

  componentDidMount() {
    this.getDetails();
  }

  getDetails = async () => {
    try {
      const response = await axios.get(this.props.backendUrl+`grants/${this.props.match.params.id}`);
      this.setState(() => ({
        isLoaded: true,
        grantData: response.data
      }));
    } catch (error) {
      this.setState(() => ({ error }))
    }
  }

  render() {
    const { error, isLoaded, grantData } = this.state;
    const grant = grantData[0];

    if (error) {
      return <div className="container">{error.message}</div>;
    } else if (!isLoaded) {
      return <div className="container">Loading Grants...</div>;
    } else {
      return (
        <div className="container">
          <h1 className="mb-4">{grant.title}</h1>
          <h3 className="mb-4">{grant.pitch}</h3>
          <p className="mb-4">{grant.description}</p>
          <p>Contract Address: {grant.contractAddress}</p>
        </div>
      )
    }
  }
}
