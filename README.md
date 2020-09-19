# Wings

The platform offering smart contracts between consumers and airlines to allow for more flexible travelling.

## How it works

The platform is reachable at https://wings.davidvargas.me. You must already have an Ethereum wallet set up on your browser to be able to participate in contracts. We recommend using [Metamask](https://metamask.io/).

Consumers often want to reserve seats on flights but due to external circumstances, will want to cancel their spot and receive a full refund. On Wings, consumers can book a flight and add various refund conditions to the contract. For example, if the number of Coronavirus cases reaches an uncomfortable level for the consumer at their destination, then the contract will immediately terminate and refund the consumer. Once the contract reaches past its conditional due date, it will forward the funds to the airline.

## Implementation

Wings is built on the [Kovan](https://kovan.etherscan.io/) Test network, an Ethereum blockchain. There is a main `FlightContractFactory` contract which then creates a separate `FlightContract` for every consumer<>airline agreement. The factory then manages each of those Flight Contracts.

We use a [Chainlink](https://chain.link/) node to query data from APIs based on the contract conditions we support and post a feed of that data on to the block chain. Currently, we support the following conditions:

- COVID Cases - We use https://api.covidtracking.com to feed this data

## Contribution

To run the project locally, fork then clone the repo. Then, run the following steps:

- `npm install`
- `npm run compile`
- `cd client`
- `npm install`
- `npm start`

At this point, you should be automatically brought to your browser with `http://localhost:3000` running on your tab.
