import PropTypes from "prop-types";
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { redirect } from "./utils";
import { withRouter } from "react-router-dom";
import Web3 from "web3";
import contractFactory from "../contracts/FlightContractFactory.json";
import TruffleContract from "@truffle/contract";

const web3 = window.ethereum
  ? new Web3(window.ethereum)
  : new Web3("ws://localhost:7545");
const flightContractFactory = TruffleContract(contractFactory);
flightContractFactory.setProvider(web3.currentProvider);

class FlightsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: "",
      contractCount: 0,
    };
  }

  componentDidMount = () => {
    window.ethereum
      .enable()
      .then(() => web3.eth.getAccounts())
      .then((accounts) => {
        this.setAccount(accounts[0]);
        return flightContractFactory.deployed();
      })
      .then((factoryInstance) => factoryInstance.getContractCount())
      .then((count) => this.setContractCount(count.toNumber()));
  };

  setAccount = (address) => this.setState({ address });

  setContractCount = (contractCount) => this.setState({ contractCount });

  redirect = (link) => () => {
    this.props.actions.redirect(link);
  };

  render() {
    const flights = this.props.flights;
    return (
      <div className="FlightsPage">
        {this.state.address && <div>Signed in as {this.state.address}</div>}
        <ul>
          {flights.map((f) => (
            <li key={f.id} onClick={this.redirect(`/${f.id}`)}>
              From: {f.startLoc}
              To: {f.endLoc}
              Departing: {f.startTime}
              Arriving: {f.endTime}
              Price: ${f.price}
            </li>
          ))}
        </ul>
        <div>
          Total number of flight contracts:{" "}
          {this.state.contractCount}
        </div>
      </div>
    );
  }
}

FlightsPage.propTypes = {
  actions: PropTypes.object.isRequired,
  flights: PropTypes.array.isRequired,
};

function mapStateToProps(state, ownProps) {
  return {
    flights: state.flights,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ redirect }, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(FlightsPage)
);
