pragma solidity >=0.5.0;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FlightContractFactory is ChainlinkClient {
  address[] public contracts;
  uint contractId = 0;
  bytes32 private jobId;
  uint256 private fee;

  constructor(address _link, address _oracle) public {
    if (_link == address(0)) {
      setPublicChainlinkToken();
    } else {
      setChainlinkToken(_link);
    }
    setChainlinkOracle(_oracle);
    jobId = "b6602d14e4734c49a5e1ce19d45a4632"; // Get, Parse, Multi, UInt256, Transact
    fee = 0.1 * 10 ** 18; // 0.1 LINK
  }

  function getContractCount() 
    public 
    view 
    returns(uint contractCount) 
  {
    return contracts.length;
  }

  function newFlightContract(
    uint256 price,
    uint256 flightId,
    uint256 condition
  )
    public
    returns(address newContract)
  {
    FlightContract f = new FlightContract(chainlinkTokenAddress(), chainlinkOracleAddress(), price, flightId, condition);
    address addr = address(f);
    contracts.push(addr);
    return addr;
  }
}

contract FlightContract is ChainlinkClient {
  bytes32 private jobId;
  uint256 private fee;

  uint256 price;
  uint256 flightId;
  uint256 condition;
  bool refund;

  constructor(address _link, address _oracle, uint256 _price, uint256 _flightId, uint256 _condition) public {
    if (_link == address(0)) {
      setPublicChainlinkToken();
    } else {
      setChainlinkToken(_link);
    }
    setChainlinkOracle(_oracle);
    jobId = "b6602d14e4734c49a5e1ce19d45a4632"; // Get, Parse, Multi, UInt256, Transact
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
    requestId = sendChainlinkRequestTo(chainlinkOracleAddress(), req, _payment);
  }

  function fulfill(bytes32 _requestId, uint256 positiveCases)
    public
    recordChainlinkFulfillment(_requestId)
  {
    refund = positiveCases > condition;
  }
}
