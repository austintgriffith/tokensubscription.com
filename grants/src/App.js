import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import './App.css';

import GrantsList from './components/GrantsList';
import CreateGrants from './components/CreateGrants';
import GrantDetails from './components/GrantDetails';

const App = () => (
  <Router>
    <div className="wrapper">

      <ul className="nav">
        <li><Link to="/">Grants List</Link></li>
        <li><Link to="/create">Create Grants</Link></li>
        <li><Link to="/details">Grant Details</Link></li>
      </ul>

      <Route exact path="/" component={GrantsList} />
      <Route exact path="/create" component={CreateGrants} />
      <Route exact path="/details" component={GrantDetails} />
    </div>
  </Router>
)

export default App;
