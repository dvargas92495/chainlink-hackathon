import logo from "./logo.svg";
import React from "react";
import { Route, Switch } from "react-router-dom";
import FlightPage from "./FlightPage";
import FlightsPage from "./FlightsPage";
import "./App.css";

const App = () => (
  <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" height={50} width={50} />
      <h6>wings</h6>
      <div>
        <i>book on your terms</i>
      </div>
    </header>
    <Switch>
      <Route path="/:flightId" component={FlightPage} />
      <Route path="/" component={FlightsPage} />
    </Switch>
  </div>
);

export default App;
