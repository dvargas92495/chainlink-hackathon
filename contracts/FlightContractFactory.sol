pragma solidity >=0.5.0;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FlightContractFactory {
  address[] public contracts;
  uint contractId = 0;

  function getContractCount() 
    public 
    view 
    returns(uint contractCount) 
  {
    return contracts.length;
  }

  function newFlightContract(
    address chainLinkToken,
    uint256 price,
    uint256 flightId,
    string memory condition
  )
    public
    returns(address newContract)
  {
    FlightContract f = new FlightContract(chainLinkToken, price, flightId, condition);
    address addr = address(f);
    contracts.push(addr);
    return addr;
  }
}

contract FlightContract is ChainlinkClient {
  address private oracle;
  bytes32 private jobId;
  uint256 private fee;

  uint256 price;
  uint256 flightId;
  string condition;
  bool refund;

  constructor(address _link, uint256 _price, uint256 _flightId, string memory _condition) public {
    if (_link == address(0)) {
      setPublicChainlinkToken();
    } else {
      setChainlinkToken(_link);
    }
    oracle = 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e;
    jobId = "6d914edc36e14d6c880c9c55bda5bc04"; // Get, Parse, Bool
    fee = 0.1 * 10 ** 18; // 0.1 LINK

    price = _price;
    flightId = _flightId;
    condition = _condition;
    refund = false;
  }

  /**
   * @param _payment The payment
   */
  function createCheckFlightConditionRequest(
    uint256 _payment
  ) public returns (bytes32 requestId)
  {
    Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
    req.add("url", 'https://covidtracking.com/api/states');
    req.add("path", "[0].positive");
    requestId = sendChainlinkRequestTo(oracle, req, _payment);
  }

  function fulfill(bytes32 _requestId, uint256 positiveCases)
    public
    recordChainlinkFulfillment(_requestId)
  {
    refund = positiveCases > 10000;
  }
}
