pragma solidity ^0.4.24;

/*
  TEST token for tokensubscription.com
 */

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

contract WasteCoin is ERC20Mintable {

  string public name = "WasteCoin";
  string public symbol = "WC";
  uint8 public decimals = 18;

  constructor() public { }

}
