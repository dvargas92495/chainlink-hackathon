import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { redirect } from './utils';
import { withRouter } from 'react-router-dom';

class FlightPage extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      price: props.flight.price
    };
    this.mounted = true;
  }

  componentDidMount = () => {
    this.loadCovidCases();
  }

  componentWillUnmount = () => {
    this.mounted = false;
  }

  onError = error => {
    this.setState({ error: error.message });
  }

  loadCovidCases = async () => {
    this.setState({ isLoading: true });
    const covidCases = 20; // Load covid cases using this.props.flight.endLoc
    if (this.mounted) {
      this.setState({ isLoading: false });
      if (covidCases) this.setState({ covidCases, desiredCovidCases: covidCases });
    }
  }

  onChange = async event => {
    const field = event.target.name;
    const value = Number(event.target.value);
    this.setState({ [field]: value, isLoading: true });
    const price = 240; // Get price based on this.props.flightId and desired covid cases 
    if (this.mounted) {
      this.setState({ isLoading: false });
      if (price) this.setState({ price });
    }
  }

  onSave = () => {
    this.setState({ isSaving: true });
    const contract = { 
      flightId: this.props.flightId, 
      desiredCovidCases: this.state.desiredCovidCases,
      price: this.state.price
    }; // Submit contract based on this.props.flightId and desired covid cases
    if (this.mounted) {
      this.setState({ isSaving: false });
      if (contract) this.setState({ contract });
    }
  }

  redirect = link => () => {
    this.props.actions.redirect(link);
  }

  render() {
    const flight = this.props.flight;
    const isLoading = this.state.isLoading;
    const isSaving = this.state.isSaving;
    const contract = this.state.contract;
    return (
      <div className="FlightPage">
        <button onClick={this.redirect('/')}>Back</button>
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
            are below {contract.desiredCovidCases} a week before {flight.endTime}
            you will be flying there for only ${contract.price}!
          </div>
        ) : (
          <div>
            Current new cases per day in {flight.endLoc}: {this.state.covidCases}
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
            <button 
              onClick={this.onSave}
              disabled={isLoading || isSaving}
            >
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
  flight: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  const flightId = ownProps.match.params.flightId;
  return {
    flightId,
    flight: state.flights.find(f => f.id === flightId)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ redirect }, dispatch)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FlightPage));
