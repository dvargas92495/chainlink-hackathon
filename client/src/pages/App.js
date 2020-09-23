import banner from "../banner.png";
import React from "react";
import { Route, Switch } from "react-router-dom";
import FlightPage from "./FlightPage";
import FlightsPage from "./FlightsPage";
import "./App.css";

const App = () => (
  <div className="App">
    <img id="Banner" src={banner} alt="Wings" />
    <Switch>
      <Route path="/:flightId" component={FlightPage} />
      <Route path="/" component={FlightsPage} />
    </Switch>
  </div>
);

export default App;
