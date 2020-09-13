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

export function dateOf(d) {
  return moment(d, 'MM/DD/YYYY');
}

export function toFormat(d) {
  return d.format('ddd D MMM YYYY');
}

export function getContractModules() {
  return { web3, flightContractFactory };
}