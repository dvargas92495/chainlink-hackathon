import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { redirect } from './utils';
import { withRouter } from 'react-router-dom';

class FlightsPage extends Component {
  redirect = link => () => {
    this.props.actions.redirect(link);
  }

  render() {
    const flights = this.props.flights;
    return (
      <div className="FlightsPage">
        <ul>
        {flights.map(f => (
          <li
            key={f.id}
            onClick={this.redirect(`/${f.id}`)}
          >
            From: {f.startLoc}
            To: {f.endLoc}
            Departing: {f.startTime}
            Arriving: {f.endTime}
            Price: ${f.price}
          </li>
        ))}
        </ul>
      </div>
    );
  }
}

FlightsPage.propTypes = {
  actions: PropTypes.object.isRequired,
  flights: PropTypes.array.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    flights: state.flights
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ redirect }, dispatch)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FlightsPage));
