import axios from "axios";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { dateOf, getContractModules, redirect, toFormat } from "./utils";

const { web3, flightContractFactory } = getContractModules();

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
    const covidTracker = await axios.get(`https://api.covidtracking.com/v1/states/${this.props.flight.endState}/current.json`);
    const covidCases = covidTracker && covidTracker.data.hospitalizedCurrently;
    if (this.mounted) {
      this.setState({ isLoading: false });
      if (covidCases)
        this.setState({ covidCases, desiredCovidCases: covidCases });
    }
  };

  onChange = async event => {
    const field = event.target.name;
    const value = Number(event.target.value);
    this.setState({ [field]: value, isLoading: true });
    const covidCases = this.state.covidCases
    let price = this.props.flight.price;
    if (value < covidCases) price = Math.round(price * (1 + (covidCases - value) / covidCases), 0);
    if (this.mounted) {
      this.setState({ isLoading: false });
      if (price) this.setState({ price });
    }
  };

  setAccount = address => this.setState({ address });

  setFactoryInstance = factoryInstance => this.setState({ factoryInstance });

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
      if (e.code !== 4001) console.error(e.message);
      if (this.mounted) this.setState({ isSaving: false });
    }
  };

  redirect = (link) => () => {
    this.props.actions.redirect(link);
  };

  render() {
    const flight = this.props.flight;
    const isLoading = this.state.isLoading;
    const isSaving = this.state.isSaving;
    const covidCases = this.state.covidCases;
    const contract = this.state.contract;
    return (
      <div className="FlightPage">
        {this.state.address && <div>Signed in as address: {this.state.address}</div>}
        <button onClick={this.redirect("/")}>Back</button>
        <br />
        <br />
        <div>From: {flight.startCity}, {flight.startState}</div>
        <div>To: {flight.endCity}, {flight.endState}</div>
        <div>Departing: {toFormat(dateOf(flight.startTime))}</div>
        <div>Arriving: {toFormat(dateOf(flight.endTime))}</div>
        <div>Price: ${flight.price}</div>
        <br />
        <br />
        {contract ? (
          <div>
            Success! If the number of Covid cases in {flight.endState}
            are below {contract.desiredCovidCases} on {toFormat(dateOf(flight.endTime).subtract(1, 'week'))}
            you will be flying there for only ${contract.price}! The contract is
            stored at {this.state.contractAddress}!
          </div>
        ) : covidCases ? (
          <div>
            {covidCases && <div>Number of people currently hospitalized in {flight.endState}: {covidCases}</div>}
            <br />
            What would the number of people hospitalized need to be 
            in {flight.endState} on {toFormat(dateOf(flight.endTime).subtract(1, 'week'))} need to be
            for you to feel comfortable flying to {flight.endCity}, {flight.endState}?
            <br />
            <input
              type="number"
              min="0"
              name="desiredCovidCases"
              value={this.state.desiredCovidCases}
              onChange={this.onChange}
              disabled={isLoading || isSaving}
            />
            <br />
            <br />
            You pay: ${this.state.price}
            <br />
            <br />
            <button onClick={this.onSave} disabled={isLoading || isSaving}>
              Submit
            </button>
          </div>
        ) : null}
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
