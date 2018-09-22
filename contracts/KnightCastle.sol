pragma solidity ^0.4.24;

import "./SafeMath.sol";
import "./Ownable.sol";

contract KnightCastle is Ownable {
    
    struct Knight {
        string Name;
        uint8 Level;
        uint32 CurrentExp;
        uint32 ExpNeededForNextLevel;
        string Title;
        uint ReadyTime;
    }
    
    Knight[] knights;

    mapping (uint => address) public knightIndexToOwner;
    mapping (address => uint) ownerKnightCount;
    
    using SafeMath for uint;
    
    event NewKnight(uint indexed knightId, string indexed name);

    constructor() internal {
        _createKnight("Genesis");
        _createKnight("Another 1");
        owner = msg.sender;
    }
    
    function _createKnight(string _name) internal {
        Knight memory knight = Knight({
            Name: _name,
            Level: 1,
            CurrentExp: 0,
            ExpNeededForNextLevel: 50,
            Title: "Adventurer",
            ReadyTime: now
        });
        uint id = knights.push(knight) - 1;
        knightIndexToOwner[id] = msg.sender;
        ownerKnightCount[msg.sender] = ownerKnightCount[msg.sender].add(1);
        emit NewKnight(id, _name);
    }
}