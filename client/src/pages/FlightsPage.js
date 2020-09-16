import PropTypes from "prop-types";
import React, { Component } from "react";
import WalletStatus from "./WalletStatus";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { dateOf, redirect, toFormat } from "./utils";

class FlightsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  redirect = (link) => () => {
    this.props.actions.redirect(link);
  };

  render() {
    const flights = this.props.flights;
    return (
      <div className="FlightsPage">
        <WalletStatus />
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
      </div>
    );
  }
}

FlightsPage.propTypes = {
  actions: PropTypes.object.isRequired,
  app: PropTypes.object.isRequired,
  flights: PropTypes.array.isRequired,
};

function mapStateToProps(state, ownProps) {
  return {
    app: state.app,
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
