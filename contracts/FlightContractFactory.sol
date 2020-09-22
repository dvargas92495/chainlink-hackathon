pragma solidity >=0.5.0;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FlightContractFactory {
  mapping(address => address[]) public contracts;
  address link;

  constructor(address _link) public {
    link = _link;
  }

  function getContractCount() 
    public 
    view 
    returns(uint contractCount) 
  {
    address user = msg.sender;
    return contracts[user].length;
  }

  function getContractAt(uint _contractId) 
    public 
    view 
    returns(address) 
  {
    address user = msg.sender;
    return contracts[user][_contractId];
  }

  function clearContracts()
  public
  {
    address user = msg.sender;
    delete contracts[user]; 
  }

  function newFlightContract(
    uint256 price,
    uint256 flightId,
    uint256 condition
  )
    public
    returns(address)
  {
    address from = msg.sender;
    FlightContract f = new FlightContract(link, price, flightId, condition);
    address addr = address(f);
    contracts[from].push(addr);
    return addr;
  }
}

contract FlightContract is ChainlinkClient {
  uint256 public price;
  uint256 public flightId;
  uint256 public condition;
  bool public refund;
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
    refund = positiveCases > condition;
    emit FlightContractRefunded(_requestId, refund);
  }

  function getChainlinkToken() public view returns (address) {
    return chainlinkTokenAddress();
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
