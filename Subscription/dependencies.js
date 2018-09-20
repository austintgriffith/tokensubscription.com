const fs = require('fs');
module.exports = {
  'openzeppelin-solidity/contracts/cryptography/ECDSA.sol': fs.readFileSync('openzeppelin-solidity/contracts/cryptography/ECDSA.sol', 'utf8'),
  'openzeppelin-solidity/contracts/math/SafeMath.sol': fs.readFileSync('openzeppelin-solidity/contracts/math/SafeMath.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol': fs.readFileSync('openzeppelin-solidity/contracts/token/ERC20/ERC20.sol', 'utf8'),
  'openzeppelin-solidity/contracts/token/ERC20/IERC20.sol': fs.readFileSync('openzeppelin-solidity/contracts/token/ERC20/IERC20.sol', 'utf8'),
}
