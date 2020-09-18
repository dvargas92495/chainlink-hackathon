const { Oracle } = require("@chainlink/contracts/truffle/v0.6/Oracle");
var Tx = require("ethereumjs-tx");
const Web3 = require("web3");
require('dotenv').config();

const provider = new Web3.providers.HttpProvider(
  `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
);
const web3 = new Web3(provider);

const abi = Oracle._json.abi;
const Contract = require("web3-eth-contract");

const pk = Buffer.from(
  process.env.KOVAN_PRIVATE_KEY,
  "hex"
);
const ORACLE_ADDRESS = process.env.ORACLE_KOVAN_ADDRESS;
const MY_ADDRESS = process.env.MY_KOVAN_ADDRESS;
const CL_ADDRESS = process.env.CL_KOVAN_ADDRESS;
const contract = new Contract(abi, ORACLE_ADDRESS, { from: MY_ADDRESS });
const myData = contract.methods
  .setFulfillmentPermission(CL_ADDRESS, true)
  .encodeABI();

web3.eth.getTransactionCount(MY_ADDRESS, (e, txCount) => {
  console.log(txCount);
  const txObject = {
    nonce: web3.utils.toHex(txCount),
    to: ORACLE_ADDRESS,
    value: web3.utils.toHex(web3.utils.toWei("0", "ether")),
    gasLimit: web3.utils.toHex(2100000),
    gasPrice: web3.utils.toHex(web3.utils.toWei("6", "gwei")),
    data: myData,
  };

  const tx = new Tx(txObject);
  tx.sign(pk);

  const serializedTx = tx.serialize();
  const raw = "0x" + serializedTx.toString("hex");

  // Broadcast the transaction
  web3.eth.sendSignedTransaction(raw, (err, tx) => {
    if (err) {
      console.log(err);
    } else {
      console.error(tx);
    }
  });
});
