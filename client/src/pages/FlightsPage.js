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
  }

  redirect = (link) => () => {
    this.props.actions.redirect(link);
  };

  render() {
    const flights = this.props.flights;
    return (
      <>
        <WalletStatus />
        <div className="FlightsPage">
          {flights.map((f) => (
            <div key={f.id} onClick={this.redirect(`/${f.id}`)} className="FlightItem">
              <div>
                <div>{f.startCity}, {f.startState} {'->'} {f.endCity}, {f.endState}</div>
                <div className="subText">
                  Departing: {toFormat(dateOf(f.startTime))}
                  &nbsp;&nbsp;&nbsp;
                  Arriving: {toFormat(dateOf(f.endTime))}
                </div>
              </div>
              <div>
                ${f.price}
              </div>
            </div>
          ))}
        </div>
      </>
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
