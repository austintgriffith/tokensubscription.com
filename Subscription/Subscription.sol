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

  Huge thanks, as always, to OpenZeppelin for the rad contracts:
 */

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract Subscription {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    //who deploys the contract
    address public author;

    // the publisher may optionally deploy requirements for the subscription
    // so only meta transactions that match the requirements can be relayed
    address public requiredToAddress;
    address public requiredTokenAddress;
    uint256 public requiredTokenAmount;
    uint256 public requiredPeriodSeconds;
    uint256 public requiredGasPrice;

    // similar to a nonce that avoids replay attacks this allows a single execution
    // every x seconds for a given subscription
    // subscriptionHash  => next valid block number
    mapping(bytes32 => uint256) public nextValidTimestamp;

    //we'll use a nonce for each from but because transactions can go through
    //multiple times, we allow anything but users can use this as a signal for
    //uniqueness
    mapping(address => uint256) public extraNonce;

    event ExecuteSubscription(
        address indexed from, //the subscriber
        address indexed to, //the publisher
        address tokenAddress, //the token address paid to the publisher
        uint256 tokenAmount, //the token amount paid to the publisher
        uint256 periodSeconds, //the period in seconds between payments
        uint256 gasPrice, //the amount of tokens to pay relayer (0 for free)
        uint256 nonce // to allow multiple subscriptions with the same parameters
    );

    constructor(
        address _toAddress,
        address _tokenAddress,
        uint256 _tokenAmount,
        uint256 _periodSeconds,
        uint256 _gasPrice
    ) public {
        requiredToAddress=_toAddress;
        requiredTokenAddress=_tokenAddress;
        requiredTokenAmount=_tokenAmount;
        requiredPeriodSeconds=_periodSeconds;
        requiredGasPrice=_gasPrice;
        author=msg.sender;
    }

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
        if(nextValidTimestamp[subscriptionHash]==uint256(-1)){
          return false;
        }
        return (block.timestamp <=
                nextValidTimestamp[subscriptionHash].add(gracePeriodSeconds)
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
        uint256 gasPrice, //the amount of tokens or eth to pay relayer (0 for free)
        uint256 nonce // to allow multiple subscriptions with the same parameters
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
                gasPrice,
                nonce
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
        uint256 nonce,// to allow multiple subscriptions with the same parameters
        bytes signature //proof the subscriber signed the meta trasaction
    )
        external
        view
        returns (bool)
    {
        bytes32 subscriptionHash = getSubscriptionHash(
            from, to, tokenAddress, tokenAmount, periodSeconds, gasPrice, nonce
        );
        address signer = getSubscriptionSigner(subscriptionHash, signature);
        uint256 allowance = ERC20(tokenAddress).allowance(from, address(this));
        uint256 balance = ERC20(tokenAddress).balanceOf(from);

        return (
            ( requiredToAddress == address(0) || to == requiredToAddress ) &&
            ( requiredTokenAddress == address(0) || tokenAddress == requiredTokenAddress ) &&
            ( requiredTokenAmount == 0 || tokenAmount == requiredTokenAmount ) &&
            ( requiredPeriodSeconds == 0 || periodSeconds == requiredPeriodSeconds ) &&
            ( requiredGasPrice == 0 || gasPrice == requiredGasPrice ) &&
            signer == from &&
            from != to &&
            block.timestamp >= nextValidTimestamp[subscriptionHash] &&
            allowance >= tokenAmount.add(gasPrice) &&
            balance >= tokenAmount.add(gasPrice)
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
        uint256 nonce, //to allow multiple subscriptions with the same parameters
        bytes signature //proof the subscriber signed the meta trasaction
    )
        external
        returns (bool success)
    {
        bytes32 subscriptionHash = getSubscriptionHash(
            from, to, tokenAddress, tokenAmount, periodSeconds, gasPrice, nonce
        );
        address signer = getSubscriptionSigner(subscriptionHash, signature);

        //the signature must be valid
        require(signer == from, "Invalid Signature for subscription cancellation");

        //make sure it's the subscriber 
        require(from == msg.sender, 'msg.sender is not the subscriber');

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
        uint256 nonce, // to allow multiple subscriptions with the same parameters
        bytes signature //proof the subscriber signed the meta trasaction
    )
        public
        returns (bool success)
    {
        // make sure the subscription is valid and ready
        // pulled this out so I have the hash, should be exact code as "isSubscriptionReady"
        bytes32 subscriptionHash = getSubscriptionHash(
            from, to, tokenAddress, tokenAmount, periodSeconds, gasPrice, nonce
        );
        address signer = getSubscriptionSigner(subscriptionHash, signature);

        //make sure they aren't sending to themselves
        require(to != from, "Can not send to the from address");
        //the signature must be valid
        require(signer == from, "Invalid Signature");
        //timestamp must be equal to or past the next period
        require(
            block.timestamp >= nextValidTimestamp[subscriptionHash],
            "Subscription is not ready"
        );

        // if there are requirements from the deployer, let's make sure
        // those are met exactly
        require( requiredToAddress == address(0) || to == requiredToAddress );
        require( requiredTokenAddress == address(0) || tokenAddress == requiredTokenAddress );
        require( requiredTokenAmount == 0 || tokenAmount == requiredTokenAmount );
        require( requiredPeriodSeconds == 0 || periodSeconds == requiredPeriodSeconds );
        require( requiredGasPrice == 0 || gasPrice == requiredGasPrice );

        //increment the timestamp by the period so it wont be valid until then
        nextValidTimestamp[subscriptionHash] = block.timestamp.add(periodSeconds);

        //check to see if this nonce is larger than the current count and we'll set that for this 'from'
        if(nonce > extraNonce[from]){
          extraNonce[from] = nonce;
        }

        // now, let make the transfer from the subscriber to the publisher
        uint256 startingBalance = ERC20(tokenAddress).balanceOf(to);
        ERC20(tokenAddress).transferFrom(from,to,tokenAmount);
        require(
          (startingBalance+tokenAmount) == ERC20(tokenAddress).balanceOf(to),
          "ERC20 Balance did not change correctly"
        );


        require(
            checkSuccess(),
            "Subscription::executeSubscription TransferFrom failed"
        );

        emit ExecuteSubscription(
            from, to, tokenAddress, tokenAmount, periodSeconds, gasPrice, nonce
        );

        // it is possible for the subscription execution to be run by a third party
        // incentivized in the terms of the subscription with a gasPrice of the tokens
        //  - pay that out now...
        if (gasPrice > 0) {
            //the relayer is incentivized by a little of the same token from
            // the subscriber ... as far as the subscriber knows, they are
            // just sending X tokens to the publisher, but the publisher can
            // choose to send Y of those X to a relayer to run their transactions
            // the publisher will receive X - Y tokens
            // this must all be setup in the constructor
            // if not, the subscriber chooses all the params including what goes
            // to the publisher and what goes to the relayer
            ERC20(tokenAddress).transferFrom(from, msg.sender, gasPrice);
            require(
                checkSuccess(),
                "Subscription::executeSubscription Failed to pay gas as from account"
            );
        }

        return true;
    }

    // because of issues with non-standard erc20s the transferFrom can always return false
    // to fix this we run it and then check the return of the previous function:
    //    https://github.com/ethereum/solidity/issues/4116
    /**
     * Checks the return value of the previous function. Returns true if the previous function
     * function returned 32 non-zero bytes or returned zero bytes.
     */
    function checkSuccess(
    )
        private
        pure
        returns (bool)
    {
        uint256 returnValue = 0;

        /* solium-disable-next-line security/no-inline-assembly */
        assembly {
            // check number of bytes returned from last function call
            switch returndatasize

            // no bytes returned: assume success
            case 0x0 {
                returnValue := 1
            }

            // 32 bytes returned: check if non-zero
            case 0x20 {
                // copy 32 bytes into scratch space
                returndatacopy(0x0, 0x0, 0x20)

                // load those bytes into returnValue
                returnValue := mload(0x0)
            }

            // not sure what was returned: dont mark as success
            default { }
        }

        return returnValue != 0;
    }

    //we would like a way for the author to completly destroy the subscription
    // contract to prevent further transfers
    function endContract()
        external
    {
      require(msg.sender==author);
      selfdestruct(author);
    }

    // let's go ahead and revert any ETH send directly to the contract too
    function () public payable {
       revert ();
    }
}
