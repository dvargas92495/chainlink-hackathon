import PropTypes from "prop-types";
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { refreshWallet } from "./utils";

class WalletStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {
    this.props.actions.refreshWallet();
  };

  render() {
    const app = this.props.app;
    const address = app.address;
    const contractCount = app.contractCount;
    return address ? (
      <div className="WalletStatus">
        <div>Your wallet address:</div>
        <div className="subText">{address}</div>
        {contractCount && (
          <div>Total number of flight contracts: {contractCount}</div>
        )}
        <button onClick={this.props.actions.refreshWallet}>Refresh</button>
      </div>
    ) : null;
  }
}

WalletStatus.propTypes = {
  actions: PropTypes.object.isRequired,
  app: PropTypes.object.isRequired,
};

function mapStateToProps(state, ownProps) {
  return {
    app: state.app,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ refreshWallet }, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(WalletStatus)
);
