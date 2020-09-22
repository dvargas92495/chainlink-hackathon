import contractFactory from "../contracts/FlightContractFactory.json";
import contract from "../contracts/FlightContract.json";
import linkTokenInterface from "../contracts/LinkTokenInterface.json";
import moment from "moment";
import TruffleContract from "@truffle/contract";
import Web3 from "web3";
import { push } from "connected-react-router";

const web3 = window.ethereum
  ? new Web3(window.ethereum)
  : new Web3("ws://localhost:7545");

const flightContractFactory = TruffleContract(contractFactory);
flightContractFactory.setProvider(web3.currentProvider);
export const flightContract = TruffleContract(contract);
flightContract.setProvider(web3.currentProvider);
const linkTokenContract = TruffleContract(linkTokenInterface);
linkTokenContract.setProvider(web3.currentProvider);
const LINK_PAYMENT = "1000000000000000000"; // 1 LINK TOKEN

export function redirect(link) {
  return (dispatch) => dispatch(push(link));
}

export function refreshWallet() {
  return async (dispatch) => {
    try {
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      if (!(accounts && accounts.length)) return;
      const sender = { from: accounts[0] };
      dispatch({ type: "UPDATE_APP", address: accounts[0] });
      const factoryInstance = await flightContractFactory
        .deployed()
        .catch((err) => console.log(err));
      if (!factoryInstance) return;
      dispatch({ type: "UPDATE_APP", factoryInstance });
      const contractCount = (
        await factoryInstance.getContractCount(sender)
      ).toNumber();
      const contracts = [];
      for (var i = 0; i < contractCount; i++) {
        const addr = await factoryInstance.getContractAt(i, sender);
        const contractInstance = await flightContract.at(addr);
        window.contractInstance = contractInstance;
        const flightId = (await contractInstance.flightId()).toNumber();
        const price = (await contractInstance.price()).toNumber();
        const condition = (await contractInstance.condition()).toNumber();
        const refund = await contractInstance.refund();

        contracts.push({ addr, flightId, price, condition, refund });
      }
      if (contractCount)
        dispatch({
          type: "UPDATE_APP",
          contractCount,
          contracts,
        });
    } catch (err) {
      // No Wallet
    }
  };
}

export async function fundFlightContractAt(address, from) {
  const fc = await flightContract.at(address);
  const tokenAddress = await fc.getChainlinkToken();
  const token = await linkTokenContract.at(tokenAddress);
  console.log("Funding contract:", fc.address);
  const tx = await token.transfer(fc.address, LINK_PAYMENT, { from });
  window.tx = tx;
  console.log("Contract funded!", tx.tx);
  return tx.tx;
}

export function dateOf(d) {
  return moment(d, "MM/DD/YYYY");
}

export function toFormat(d) {
  return d.format("ddd D MMM YYYY");
}

export function getContractModules() {
  return { web3, flightContractFactory };
}
