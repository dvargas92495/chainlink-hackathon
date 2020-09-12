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

class FlightPage extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      price: props.flight.price,
      address: "",
      contractAddress: "",
      factoryInstance: null,
    };
    this.mounted = true;
  }

  componentDidMount = () => {
    this.loadCovidCases();
    window.ethereum
      .enable()
      .then(() => web3.eth.getAccounts())
      .then((accounts) => {
        this.setAccount(accounts[0]);
        return flightContractFactory.deployed();
      })
      .then((factoryInstance) => this.setFactoryInstance(factoryInstance));
  };

  componentWillUnmount = () => {
    this.mounted = false;
  };

  onError = (error) => {
    this.setState({ error: error.message });
  };

  loadCovidCases = async () => {
    this.setState({ isLoading: true });
    const covidCases = 20; // Load covid cases using this.props.flight.endLoc
    if (this.mounted) {
      this.setState({ isLoading: false });
      if (covidCases)
        this.setState({ covidCases, desiredCovidCases: covidCases });
    }
  };

  onChange = async (event) => {
    const field = event.target.name;
    const value = Number(event.target.value);
    this.setState({ [field]: value, isLoading: true });
    const price = 240; // Get price based on this.props.flightId and desired covid cases
    if (this.mounted) {
      this.setState({ isLoading: false });
      if (price) this.setState({ price });
    }
  };

  setAccount = (address) => this.setState({ address });

  setFactoryInstance = (factoryInstance) => this.setState({ factoryInstance });

  onSave = async () => {
    this.setState({ isSaving: true });
    const contract = {
      flightId: this.props.flightId,
      desiredCovidCases: this.state.desiredCovidCases,
      price: this.state.price,
    }; // Submit contract based on this.props.flightId and desired covid cases
    try {
      window.myInstance = this.state.factoryInstance;
      const contractAddress = await this.state.factoryInstance.newFlightContract(
        this.state.address,
        contract.price,
        contract.flightId,
        contract.desiredCovidCases,
        { from: this.state.address }
      );
      if (this.mounted) {
        this.setState({
          isSaving: false,
          contract,
          contractAddress: contractAddress.tx,
        });
      }
    } catch (e) {
      if (e.code !== 4001) {
        console.error(e.message);
      }
      if (this.mounted) {
        this.setState({ isSaving: false });
      }
    }
  };

  redirect = (link) => () => {
    this.props.actions.redirect(link);
  };

  render() {
    const flight = this.props.flight;
    const isLoading = this.state.isLoading;
    const isSaving = this.state.isSaving;
    const contract = this.state.contract;
    return (
      <div className="FlightPage">
        {this.state.address && <div>Signed in as {this.state.address}</div>}
        <button onClick={this.redirect("/")}>Back</button>
        <br />
        <br />
        <div>From: {flight.startLoc}</div>
        <div>To: {flight.endLoc}</div>
        <div>Departing: {flight.startTime}</div>
        <div>Arriving: {flight.endTime}</div>
        <div>Price: ${flight.price}</div>
        <br />
        <br />
        {contract ? (
          <div>
            Success! If the number of Covid cases in {flight.endLoc}
            are below {contract.desiredCovidCases} a week before{" "}
            {flight.endTime}
            you will be flying there for only ${contract.price}! The contract is
            stored at {this.state.contractAddress}!
          </div>
        ) : (
          <div>
            Current new cases per day in {flight.endLoc}:{" "}
            {this.state.covidCases}
            <br />
            <input
              type="number"
              min="0"
              max="100"
              name="desiredCovidCases"
              value={this.state.desiredCovidCases}
              onChange={this.onChange}
              disabled={isLoading || isSaving}
            />
            <br />
            You pay: ${this.state.price}
            <br />
            <button onClick={this.onSave} disabled={isLoading || isSaving}>
              Submit
            </button>
          </div>
        )}
      </div>
    );
  }
}

FlightPage.propTypes = {
  actions: PropTypes.object.isRequired,
  flightId: PropTypes.string.isRequired,
  flight: PropTypes.object.isRequired,
};

function mapStateToProps(state, ownProps) {
  const flightId = ownProps.match.params.flightId;
  return {
    flightId,
    flight: state.flights.find((f) => f.id === flightId),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ redirect }, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(FlightPage)
);
