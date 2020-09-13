import PropTypes from "prop-types";
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { dateOf, getContractModules, redirect, toFormat } from "./utils";

const { web3, flightContractFactory } = getContractModules();

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
        {this.state.address && <div>Signed in as address: {this.state.address}</div>}
        <ul>
          {flights.map((f) => (
            <li key={f.id} onClick={this.redirect(`/${f.id}`)} className="flightItem">
              {f.startCity}, {f.startState} {'->'} {f.endCity}, {f.endState}
              <br />
              Departing: {toFormat(dateOf(f.startTime))}
              &nbsp;&nbsp;&nbsp;
              Arriving: {toFormat(dateOf(f.endTime))}
              <br />
              ${f.price}
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
