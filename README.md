# fairness-control-contract
Ethereum smart contract that establishes periodic and fair work shifts among a set of agents

The project is created using Truffle framework.

I test it using [Ethereumjs testrpc](https://github.com/ethereumjs/testrpc) launched with commands:
```
testrpc -a 16 -g 20
```

This contract is just receiving the transactions and returns them to a unique agent.
Since the work shift is assigned to the agent that pays less, they are incouraged to pay as much as possible. Therefore they are forced to do the work shift -from time to time- to accumulate some credit.

```
contracts/FairnessControl.sol => Solidity contract
app/periodic_control.js => node.js script that interacts with the contract
```
