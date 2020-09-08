pragma solidity >=0.5.0;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";

contract GithubIssueContract is ChainlinkClient {
  bool public state;

  address private oracle;
  bytes32 private jobId;
  uint256 private fee;

  constructor(address _link) public {
    if (_link == address(0)) {
      setPublicChainlinkToken();
    } else {
      setChainlinkToken(_link);
    }
    oracle = 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e;
    jobId = "6d914edc36e14d6c880c9c55bda5bc04"; // Get, Parse, Bool
    fee = 0.1 * 10 ** 18; // 0.1 LINK
  }

  /**
   * @param _url The URL to fetch data from, passed from the frontend to avoid string concatenation on contract
   * @param _payment The payment
   */
  function createGithubIssueRequest(
    uint256 _payment,
    string memory _url
  ) public returns (bytes32 requestId)
  {
    Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
    req.add("url", _url);
    req.add("path", "state");
    requestId = sendChainlinkRequestTo(oracle, req, _payment);
  }

  /**
   * @notice The fulfill method from requests created by this contract
   * @dev The recordChainlinkFulfillment protects this function from being called
   * by anyone other than the oracle address that the request was sent to
   * @param _requestId The ID that was generated for the request
   * @param _state The answer provided by the oracle
   */
  function fulfill(bytes32 _requestId, bool _state)
    public
    recordChainlinkFulfillment(_requestId)
  {
    state = _state;
  }
}
