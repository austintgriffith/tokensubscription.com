import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      addressValue: '',
      tokenAmount: '',
      recurringValue: '',
      periodValue: '',
      coin: '',
      error: null,
      isLoaded: false,
      items: []
    };

    this.handleAddressChange = this.handleAddressChange.bind(this)
    this.handleCoinChange = this.handleCoinChange.bind(this)
    this.handleTokenAmountChange = this.handleTokenAmountChange.bind(this)
    this.handleRecurringValueChange = this.handleRecurringValueChange.bind(this)
    this.handlePeriodChange = this.handlePeriodChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleAddressChange(event) {
    this.setState({addressValue: event.target.value});
  }

  handleCoinChange(event) {
    this.setState({coin: event.target.value})
  }

  handleTokenAmountChange(event) {
    this.setState({tokenAmount: event.target.value})
  }

  handleRecurringValueChange(event) {
    this.setState({recurringValue: event.target.value})
  }

  handlePeriodChange(event) {
    this.setState({periodValue: event.target.value})
  }

  handleSubmit(event) {
    alert('Token Address: ' + this.state.addressValue)
    alert('Coin: ' + this.state.coin)
    alert('Token Value: ' + this.state.tokenAmount)
    alert('Recurring: ' + this.state.recurringValue)
    alert('Term: ' + this.state.periodValue)
    event.preventDefault()
  }

  componentDidMount() {
    fetch('https://api.0xtracker.com/tokens')
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result
          })
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render() {
    const { error, isLoaded, items } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      let coins = []
      for(let i in items){
        console.log(items[i].name)
        coins.push(
            items[i].name
        )
      }
      return (
        <form onSubmit={this.handleSubmit}>
          <label>
            Token Address:
            <input type="text" value={this.state.addressValue} onChange={this.handleAddressChange} />
          </label>
          <br />
          <label>
           Coin:
           <select value={this.state.coin} onChange={this.handleCoinChange}>
             {coins.map(coin => (
               <option value={coin}>{coin}</option>
             ))}
             <option value="weely">Weekly</option>
             <option value="monthly">Monthly</option>
           </select>
         </label>
          <br />
          <label>
            Token Amount:
            <input type="number" value={this.state.tokenAmount} onChange={this.handleTokenAmountChange} />
          </label>
          <br />
          <label>
            Recurring:
            <input type="number" value={this.state.recurringValue} onChange={this.handleRecurringValueChange} />
          </label>
          <br />
          <label>
           Term:
           <select value={this.state.periodValue} onChange={this.handlePeriodChange}>
             <option value="weely">Weekly</option>
             <option value="monthly">Monthly</option>
           </select>
         </label>
         <br />
        <input type="submit" value="Create Subscription" />
        </form>
      );
    }
  }
}

export default App;
