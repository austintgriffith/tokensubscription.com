import React, { Component } from 'react';
import GrantBox from './GrantBox';
import axios from 'axios';

export default class GrantsList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      grants: []
    }
  }

  componentDidMount() {
    this.getGrants();
  }

  getGrants = async () => {
    try {
      const response = await axios.get(`${this.props.backendUrl}grants`);
      this.setState(() => ({
        isLoaded: true,
        grants: response.data
      }));
    } catch (error) {
      this.setState(() => ({ error }))
    }
  }

  render() {
    const { error, isLoaded, grants } = this.state;
    if (error) {
      return <div className="container">{error.message}</div>;
    } else if (!isLoaded) {
      return <div className="container">Loading Grants...</div>;
    } else {
      return (
        <div>
          <div className="container">
            {grants.map((grant) => {
              return <GrantBox key={grant.id} {...grant} />
            })}
          </div>
        </div>
      )
    }
  }
}
