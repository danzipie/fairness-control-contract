/** A nodejs program that can interact with FairnessControl smart contract. It permits to simulate
 * a set of agents that periodically send a random amout of currency to the contract.
 * The contract returns its entire balance to one agent.
 **/

// Require the contract
var json = require("../build/contracts/FairnessControl.json");

// Use also truffle-contract package
var contract = require("truffle-contract");

// Set up Web3
var Web3 = require('web3');
web3 = new Web3();

var FairnessControl = contract(json);
var provider = new web3.providers.HttpProvider('http://localhost:8545');

web3.setProvider(provider);
FairnessControl.setProvider(provider);

// Interact with the contract
var accounts = web3.eth.accounts;   // the list of accounts
var Ttc = 10000;                    // the control period
var w, payment_info;                // useful vars
var DEFAULT_GAS = 2000000;

// print my wallets
console.log('Initial wallets state');
for (var a=0; a<accounts.length; a++) {
    console.log('Agent ' + a + ' credit: ' +
        web3.fromWei(web3.eth.getBalance(accounts[a]), 'ether'), 'ether');
}

FairnessControl.deployed().then(function (instance) {

    var contract_address = instance.address;
    console.log('Balance of the contract: ' +
        web3.toWei(web3.eth.getBalance(contract_address), 'ether').toNumber());


    console.log('------------------------------------\nStart the routine.');

    setInterval(function () {

            for (var a=0; a < accounts.length; a++) { // each agent

                // pay the contract
                var myBalance = web3.eth.getBalance(accounts[a]);
                w = 0.8 * Math.random() * myBalance; // is in wei
                payment_info = {from: accounts[a], value: w, gas: DEFAULT_GAS};

                instance.sendWeight(payment_info).catch(

                    console.log(error)
                );

            }

            // The contract is locked with a period of Ttc
            setTimeout(function () {

                // @TODO: the lock is triggered by accounts[0], replace with Ethereum Alarm Clock
                instance.decideNextController({from: accounts[0], gas: DEFAULT_GAS}).then(function (result) {

                    instance.getStates.call().then(function (result) {

                        // print the result output in CSV format
                        var states_string = "";
                        result.forEach(function(entry) {
                            states_string += entry.c[0];
                            states_string += ','
                        });
                        states_string = states_string.slice(0, -1);
                        console.log(states_string + ';');

                        // now the agent that won the turn can require the payment.
                        // @TODO: it is always accounts[0] right now..
                        setTimeout(function () {
                            instance.payController({from: accounts[0], gas: DEFAULT_GAS}).catch(function (error) {
                                console.log(error);
                            });

                        }, 1000);


                    }).catch(function(error) {

                        console.log(error)

                    });

                }).catch(function(error) {

                    console.log(error);

                });

            }, 1000);


        }, Ttc);

});
