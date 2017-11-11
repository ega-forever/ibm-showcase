pragma solidity ^0.4.4;


contract UserHolder {

    struct Item {
    mapping (uint => uint) cost;
    }

    mapping (address => Item) balances;


    event NewClient(address _user, uint256 _cost, uint256 _year);

    function UserHolder() {}

    function addClient(uint cost, uint year) returns (bool sufficient) {

        Item balance = balances[msg.sender];
        if (balance.cost[year] != 0) {
            return false;
        }

        balances[msg.sender].cost[year] = cost;
        NewClient(msg.sender, cost, year);
        return true;
    }


    function getCost(uint year) returns (uint) {
        return balances[msg.sender].cost[year];
    }

    function getCostByAddress(address addr, uint year) returns (uint) {
        return balances[addr].cost[year];
    }

}
