pragma solidity ^0.4.8;

contract FairnessControl
{

    uint iterations;
    uint totReceived;
    mapping(address => uint) public balances;
    address [] controllers;
    uint [] states;
    uint [] vals;
    uint found;
    uint minIdx;

    event ReceivedWeight(uint _rew);
    event Execute(uint _rew);
    event PayReward(address _to, uint256 _value);

    // init
    function FairnessControl() {
        iterations = 0;
        totReceived = 0;
        found = 0;
        minIdx = 0;
    }

    // receive weights
    function sendWeight() payable public returns (bool success) {

        ReceivedWeight(msg.value);

        if (msg.value > 0) {
            balances[msg.sender] = msg.value; // save payment
            totReceived += msg.value;
            controllers.push(msg.sender); // save DER ID @TODO: verify if already exists

        } else
            throw;

        return true;

    }

    // find minimum weight (no need to verify constrains)
    function decideNextController() public returns (uint success) {

        uint i;

        uint minVal;
        minIdx = 0;

        if (found > 0) // check if contract is locked
            throw;

        // safety check
        if (!(controllers.length > 0))
            throw;

        // find argmin @TODO: random... in principle! but the agents are picking randomly (in Wei)
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

        //uint256 reward = 0;

        // compute reward
        //for (var i=0; i<controllers.length; i++) {
         //   reward += balances[controllers[i]];
        //}

        Execute(minIdx);

        // pay controller with minimum
        //PayReward(controllers[minIdx], reward);
        if (!controllers[minIdx].send(this.balance))
            throw;

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

    // returns the value of global variable 'iterations'
    function getIterations() returns (uint result) {
        return iterations;
    }

    function getTotReceived() returns (uint result) {
        return totReceived;
    }

    function getStates() returns (uint[] result) {
        return states;
    }

    function getControllers() returns (address[] result) {
        return controllers;
    }

    function printMapping() returns (uint [] v) {
        uint i = 0;
        for (i=0; i<controllers.length; i++) {
            vals.push(balances[controllers[i]]);
        }
        return vals;
    }



}