pragma solidity ^0.4.8;

contract FairnessControl
{

    uint public iterations;
    uint public totReceived;
    mapping(address => uint) public balances;
    address [] public controllers;
    uint [] public states;
    uint [] vals;
    uint found;
    uint minIdx;

    event ReceivedWeight(uint _rew);
    event Execute(uint _rew);
    event PayReward(address _to, uint256 _value);

    // constructor
    constructor () payable public {
        iterations = 0;
        totReceived = 0;
        found = 0;
        minIdx = 0;
    }

    // sendWeight is used by DERs to send their weight
    function sendWeight() payable public returns (bool success) {

        ReceivedWeight(msg.value);

        if (msg.value > 0) {
            balances[msg.sender] = msg.value;
            totReceived += msg.value;
            controllers.push(msg.sender); // save DER ID @TODO: verify if already exists

        } else
            revert();

        return true;

    }

    // find minimum weight (no need to verify constrains)
    function decideNextController() public returns (uint success) {

        uint i;
        uint minVal;
        minIdx = 0;

        if (found > 0) // check if contract is locked
            revert();

        // safety check
        if (!(controllers.length > 0))
            revert();

        // find argmin
        for (i=0; i<controllers.length; i++) {
            if (i==0) {
                minVal = balances[controllers[i]];
                minIdx = i;
            } else {
                if (balances[controllers[i]] < minVal) {
                    minVal = balances[controllers[i]];
                    minIdx = i;
                }
            }
        }

        // generate the states vector
        for (i=0; i<controllers.length; i++) {
            if (i==minIdx)
                states.push(1);
            else
                states.push(0);
        }

        // lock the contract
        found = 1;
        return success;
    }

    function reset() public returns (uint success) {

        // clear structures for next round
        controllers.length = 0;
        states.length = 0;
        totReceived = 0;
        found = 0;
        minIdx = 0;
        iterations++;

        // check if there is still something in the contract...
        return 1;
    }

    function payController() public returns (uint success) {

        Execute(minIdx);

        // pay controller with minimum
        //PayReward(controllers[minIdx], reward);
        if (!controllers[minIdx].send(this.balance))
            revert();

        // clear structures for next round
        controllers.length = 0;
        states.length = 0;
        totReceived = 0;
        found = 0;
        minIdx = 0;
        iterations++;

        // check if there is still something in the contract...
        return 1;
    }

    function printMapping() public returns (uint [] v) {
        uint i = 0;
        for (i=0; i<controllers.length; i++) {
            vals.push(balances[controllers[i]]);
        }
        return vals;
    }

}
