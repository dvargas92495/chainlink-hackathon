import PropTypes from "prop-types";
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { refreshWallet, flightContract } from "./utils";

const CurrentFlightContract = ({
  addr,
  flightId,
  price,
  condition,
  refund,
  refresh,
  sender,
}) => (
  <div style={{ border: "1px solid gray", display: "flex" }}>
    <div style={{ flexGrow: 1 }}>
      <div className="subText">{addr}</div>
      <div className="subText">
        ${price}: Flight {flightId} flying with covid cases under {condition}.
      </div>
      <div className="subText">{refund ? "REFUNDED" : "ACTIVE"}</div>
    </div>
    <button
      style={{ margin: 8 }}
      onClick={async () => {
        const instance = await flightContract.at(addr);
        window.instance = instance;
        const req = await instance.createCheckFlightConditionRequest(
          "0xe7306B3965C9cF2995a0b06170A2007B0d778f0A",
          "123aae603d0e4197b284608879b3078f",
          {
            ...sender,
          }
        );
        await refresh();
        window.req = req;
      }}
    >
      Check Refund
    </button>
  </div>
);

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
    window.factoryInstance = app.factoryInstance;
    const sender = {from: address};
    return address ? (
      <div className="WalletStatus">
        <div>Your wallet address:</div>
        <div className="subText">{address}</div>
        {contractCount ? (
          <div>Total number of flight contracts: {contractCount}</div>
        ) : (
          <div>No current flight contracts</div>
        )}
        {app.contracts &&
          app.contracts.map((props, i) => (
            <CurrentFlightContract
              {...props}
              key={i}
              refresh={this.props.actions.refreshWallet}
              sender={sender}
            />
          ))}
        <button onClick={this.props.actions.refreshWallet}>Refresh</button>
        <button onClick={async () => {
          await app.factoryInstance.clearContracts(sender);
          await this.props.actions.refreshWallet();
          }}>Clear</button>
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
