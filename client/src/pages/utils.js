import contractFactory from "../contracts/FlightContractFactory.json";
import moment from "moment";
import TruffleContract from "@truffle/contract";
import Web3 from "web3";
import { push } from "connected-react-router";

const web3 = window.ethereum
  ? new Web3(window.ethereum)
  : new Web3("ws://localhost:7545");
const flightContractFactory = TruffleContract(contractFactory);
flightContractFactory.setProvider(web3.currentProvider);

export function redirect(link) {
  return dispatch => dispatch(push(link));
}

export function refreshWallet() {
  return async dispatch => {
    try {
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      if (!(accounts && accounts.length)) return;
      dispatch({ type: 'UPDATE_APP', address: accounts[0] });
      const factoryInstance = await flightContractFactory.deployed().catch(err => console.log(err));
      console.log(factoryInstance);
      if (!factoryInstance) return;
      dispatch({ type: 'UPDATE_APP', factoryInstance });
      const contractCount = await factoryInstance.getContractCount();
      if (contractCount) dispatch({ type: 'UPDATE_APP', contractCount: contractCount.toNumber() });
    } catch (err) {
      // No Wallet
    }
  };
}

export function dateOf(d) {
  return moment(d, 'MM/DD/YYYY');
}

export function toFormat(d) {
  return d.format('ddd D MMM YYYY');
}

export function getContractModules() {
  return { web3, flightContractFactory };
}