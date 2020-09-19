pragma solidity >=0.5.0;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FlightContractFactory is ChainlinkClient {
  address[] public contracts;
  uint contractId = 0;

  constructor(address _link) public {
    if (_link == address(0)) {
      setPublicChainlinkToken();
    } else {
      setChainlinkToken(_link);
    }
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
    FlightContract f = new FlightContract(chainlinkTokenAddress(), price, flightId, condition);
    address addr = address(f);
    contracts.push(addr);
    return addr;
  }
}

contract FlightContract is ChainlinkClient {
  uint256 price;
  uint256 flightId;
  uint256 condition;
  event FlightContractRefunded(
    bytes32 indexed requestId,
    bool indexed refund
  );

  constructor(address _link, uint256 _price, uint256 _flightId, uint256 _condition) public {
    if (_link == address(0)) {
      setPublicChainlinkToken();
    } else {
      setChainlinkToken(_link);
    }

    price = _price;
    flightId = _flightId;
    condition = _condition;
  }

  function createCheckFlightConditionRequest(address _oracle, string memory _jobId) public returns (bytes32 requestId)
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), address(this), this.fulfill.selector);
    req.add("url", 'https://api.covidtracking.com/v1/states/NY/current.json');
    req.add("path", "positive");
    requestId = sendChainlinkRequestTo(_oracle, req, LINK);
  }

  function fulfill(bytes32 _requestId, uint256 positiveCases)
    public
    recordChainlinkFulfillment(_requestId)
  {
    bool refund = positiveCases > condition;
    emit FlightContractRefunded(_requestId, refund);
  }

  // this was straight copy-paste
  function stringToBytes32(string memory source) private pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
      return 0x0;
    }

    assembly {
      result := mload(add(source, 32))
    }
  }
}
