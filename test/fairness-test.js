/**
 * Unit test for the FairnessControl smart contract.
 */

var FairnessControl = artifacts.require("./FairnessControl.sol");

contract('FairnessControl', function(accounts) {
    it("should match the initial configuration", function () {
        return FairnessControl.deployed().then(function (instance) {
            return instance.getIterations.call();
        }).then(function (reward) {
            assert.equal(reward.valueOf(), 0, "0 wans't the default value");
        });
    });
    it("should receive payment from agent 1", function () {

        var contract;      // contract
        var account_one = accounts[0];

        return FairnessControl.deployed().then(function(instance) {

            contract = FairnessControl.at(instance.address);
            initialBalance = web3.eth.getBalance(contract.address).toNumber();
            // pay 2 ETH to the contract
            var money = web3.toWei(2, "ether");

            return instance.sendWeight({from: account_one, value: money });

        }).then(function () {

            var newBalance = web3.eth.getBalance(contract.address).toNumber();
            assert.equal((newBalance - initialBalance)/Math.pow(10, 18), 2, "Difference should be what it sent");

        });
    });
    it("should receive payment from agent 2", function () {

        var contract;
        var account_two = accounts[1];

        return FairnessControl.deployed().then(function(instance) {

            contract = FairnessControl.at(instance.address);
            initialBalance = web3.eth.getBalance(contract.address).toNumber();
            // pay 1 ETH to the contract
            var money = web3.toWei(1, "ether");

            return instance.sendWeight({from: account_two, value: money });

        }).then(function (result) {

            var newBalance = web3.eth.getBalance(contract.address).toNumber();
            assert.equal((newBalance - initialBalance)/Math.pow(10, 18), 1, "Difference should be what it sent");

        });
    });
    it("should decide the next control slot", function () {

        return FairnessControl.deployed().then(function(instance) {

            contract = FairnessControl.at(instance.address);

            return instance.decideNextController();

        }).then(function (result) {

            //for (var r=0; r<result.logs.length; r++)
            //  console.log(result.logs[r].args);
            assert.equal(1, 1, "Impossible"); // @TODO: check the result


        });
    });
    it("should match the expected internal state", function () {

        return FairnessControl.deployed().then(function(instance) {

            contract = FairnessControl.at(instance.address);
            return instance.getStates.call();

        }).then(function (result) {

            var state;
            var u = 0;

            result.forEach(function(entry) {
                state = Number(entry.toString());
                assert.equal(u, state, "agent is in the wrong state");
                u++;
            });

        });
    });
    it("should pay back agent 1 and reset", function () {

        var meta;
        return FairnessControl.deployed().then(function(instance) {
            meta = instance;
            return instance.payController();

        }).then(function (instance) {

            contract = FairnessControl.at(meta.address);
            theBalance = web3.eth.getBalance(contract.address).toNumber();
            assert.equal(theBalance, 0, "Should be zero now");

        });
    });
    it("should reset internal variables", function () {

        var meta;
        return FairnessControl.deployed().then(function (instance) {
            meta = instance;
            return instance.getStates.call();

        }).then(function (result) {

            assert.equal(result.length, 0, "States is not empty.");
            return meta.getTotReceived.call();

        }).then(function (result) {

            assert.equal(result, 0, "Total received is not zero.");
            return meta.getControllers.call();

        }).then(function (result) {

            assert.equal(result, 0, "Is not empty");

        })
    });
})
