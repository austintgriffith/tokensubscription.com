pragma solidity ^0.4.24;

/*
  Super Simple Token Subscriptions - https://tokensubscription.com

  //// Breakin’ Through @ University of Wyoming ////

  Austin Thomas Griffith - https://austingriffith.com

  Building on previous works:
    https://github.com/austintgriffith/token-subscription
    https://gist.github.com/androolloyd/0a62ef48887be00a5eff5c17f2be849a
    https://media.consensys.net/subscription-services-on-the-blockchain-erc-948-6ef64b083a36
    https://medium.com/gitcoin/technical-deep-dive-architecture-choices-for-subscriptions-on-the-blockchain-erc948-5fae89cabc7a
    https://github.com/ethereum/EIPs/pull/1337
    https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1077.md
    https://github.com/gnosis/safe-contracts

  Earlier Meta Transaction Demo:
    https://github.com/austintgriffith/bouncer-proxy

  Huge thanks to, as always, to OpenZeppelin for the rad contracts:
 */

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract Subscription is Ownable {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    constructor() public {}

    event ExecuteSubscription(
        address indexed from, //the subscriber
        address indexed to, //the publisher
        address tokenAddress, //the token address paid to the publisher
        uint256 tokenAmount, //the token amount paid to the publisher
        uint256 periodSeconds, //the period in seconds between payments
        uint256 gasPrice //the amount of tokens to pay relayer (0 for free)
    );

    // similar to a nonce that avoids replay attacks this allows a single execution
    // every x seconds for a given subscription
    // subscriptionHash  => next valid block number
    mapping(bytes32 => uint256) public nextValidTimestamp;

    // this is used by external smart contracts to verify on-chain that a
    // particular subscription is "paid" and "active"
    // there must be a small grace period added to allow the publisher
    // or desktop miner to execute
    function isSubscriptionActive(
        bytes32 subscriptionHash,
        uint256 gracePeriodSeconds
    )
        external
        view
        returns (bool)
    {
        return (block.timestamp >=
                    nextValidTimestamp[subscriptionHash].sub(gracePeriodSeconds)
        );
    }

    // given the subscription details, generate a hash and try to kind of follow
    // the eip-191 standard and eip-1077 standard from my dude @avsa
    function getSubscriptionHash(
        address from, //the subscriber
        address to, //the publisher
        address tokenAddress, //the token address paid to the publisher
        uint256 tokenAmount, //the token amount paid to the publisher
        uint256 periodSeconds, //the period in seconds between payments
        uint256 gasPrice //the amount of tokens or eth to pay relayer (0 for free)
    )
        public
        view
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                byte(0x19),
                byte(0),
                address(this),
                from,
                to,
                tokenAddress,
                tokenAmount,
                periodSeconds,
                gasPrice
        ));
    }

    //ecrecover the signer from hash and the signature
    function getSubscriptionSigner(
        bytes32 subscriptionHash, //hash of subscription
        bytes signature //proof the subscriber signed the meta trasaction
    )
        public
        pure
        returns (address)
    {
        return subscriptionHash.toEthSignedMessageHash().recover(signature);
    }

    //check if a subscription is signed correctly and the timestamp is ready for
    // the next execution to happen
    function isSubscriptionReady(
        address from, //the subscriber
        address to, //the publisher
        address tokenAddress, //the token address paid to the publisher
        uint256 tokenAmount, //the token amount paid to the publisher
        uint256 periodSeconds, //the period in seconds between payments
        uint256 gasPrice, //the amount of the token to incentivize the relay network
        bytes signature //proof the subscriber signed the meta trasaction
    )
        public
        view
        returns (bool)
    {
        bytes32 subscriptionHash = getSubscriptionHash(
            from, to, tokenAddress, tokenAmount, periodSeconds, gasPrice
        );
        address signer = getSubscriptionSigner(subscriptionHash, signature);
        uint256 allowance = ERC20(tokenAddress).allowance(from, address(this));
        return (
            signer == from &&
            block.timestamp >= nextValidTimestamp[subscriptionHash] &&
            allowance >= tokenAmount.add(gasPrice)
        );
    }

    // you don't really need this if you are using the approve/transferFrom method
    // because you control the flow of tokens by approving this contract address,
    // but to make the contract an extensible example for later user I'll add this
    function cancelSubscription(
        address from, //the subscriber
        address to, //the publisher
        address tokenAddress, //the token address paid to the publisher
        uint256 tokenAmount, //the token amount paid to the publisher
        uint256 periodSeconds, //the period in seconds between payments
        uint256 gasPrice, //the amount of tokens or eth to pay relayer (0 for free)
        bytes signature //proof the subscriber signed the meta trasaction
    )
        public
        returns (bool success)
    {
        bytes32 subscriptionHash = getSubscriptionHash(
            from, to, tokenAddress, tokenAmount, periodSeconds, gasPrice
        );
        address signer = subscriptionHash.toEthSignedMessageHash().recover(signature);

        //the signature must be valid
        require(signer == from, "Invalid Signature for subscription cancellation");

        //nextValidTimestamp should be a timestamp that will never
        //be reached during the brief window human existence
        nextValidTimestamp[subscriptionHash]=uint256(-1);

        return true;
    }

    // execute the transferFrom to pay the publisher from the subscriber
    // the subscriber has full control by approving this contract an allowance
    function executeSubscription(
        address from, //the subscriber
        address to, //the publisher
        address tokenAddress, //the token address paid to the publisher
        uint256 tokenAmount, //the token amount paid to the publisher
        uint256 periodSeconds, //the period in seconds between payments
        uint256 gasPrice, //the amount of tokens or eth to pay relayer (0 for free)
        bytes signature //proof the subscriber signed the meta trasaction
    )
        public
        returns (bool success)
    {
        // make sure the subscription is valid and ready
        // pulled this out so I have the hash, should be exact code as "isSubscriptionReady"
        bytes32 subscriptionHash = getSubscriptionHash(
            from, to, tokenAddress, tokenAmount, periodSeconds, gasPrice
        );
        address signer = getSubscriptionSigner(subscriptionHash, signature);

        //the signature must be valid
        require(signer == from, "Invalid Signature");
        //timestamp must be equal to or past the next period
        require(
            block.timestamp >= nextValidTimestamp[subscriptionHash],
            "Subscription is not ready"
        );

        nextValidTimestamp[subscriptionHash] = block.timestamp.add(periodSeconds);

        // now, let make the transfer from the subscriber to the publisher
        require(
          ERC20(tokenAddress).transferFrom(from,to,tokenAmount),
          "Transfer Failed"
        );

        emit ExecuteSubscription(
            from, to, tokenAddress, tokenAmount, periodSeconds, gasPrice
        );

        return true;
    }
}