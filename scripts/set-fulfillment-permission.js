const { Oracle } = require("@chainlink/contracts/truffle/v0.6/Oracle");
const HDWalletProvider = require("@truffle/hdwallet-provider");

const deployer = new HDWalletProvider();
Oracle.setProvider(deployer.provider);

// Testing https://docs.chain.link/docs/fulfilling-requests#add-your-node-to-the-oracle-contract
Oracle.deployed()
  .then((oracle) =>
    oracle.setFulfillmentPermission(
      "0x207E8313A52FA1Fe9Be71fe2A0d4Bf93a151b1af"
    )
  )
  .then(console.log)
  .catch(console.error);
