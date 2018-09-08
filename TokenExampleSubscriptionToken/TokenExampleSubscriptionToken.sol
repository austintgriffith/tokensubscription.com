pragma solidity ^0.4.24;

/*
  TEST token for tokensubscription.com
 */

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

contract TokenExampleSubscriptionToken is ERC20Mintable {

  string public name = "TokenExampleSubscriptionToken";
  string public symbol = "TEST";
  uint8 public decimals = 18;

  constructor() public { }

}
