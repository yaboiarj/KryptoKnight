pragma solidity ^0.4.24;

import "./SafeMath.sol";
import "./KnightHelper.sol";

contract KnightAdventure is KnightHelper {
    
    using SafeMath8 for uint8;
    using SafeMath16 for uint16;
    using SafeMath32 for uint32;
    
    uint maxLevel = 250;
    event KnightLeveledUp(uint indexed knightId);
    
    uint dungeonCompleteRuntime = 5 seconds;
    uint lootSuccessProbability = 50;
    uint lootSuccessRate;
    
    function _pseudoRandom(uint _start, uint _end) private view returns (uint) {
        bytes32 randseed = keccak256(abi.encodePacked(randseed, block.timestamp, blockhash(block.number-1), block.coinbase, block.difficulty, block.number));
        uint range = _end - _start + 1;
        uint randVal = _start + uint256(randseed) % range;
        return randVal;
    }
    
    function _isReady(Knight storage _knight) internal view returns (bool) {
        return (_knight.ReadyTime <= now);
    }

    function _triggerCooldown(Knight storage _knight) internal {
        _knight.ReadyTime = now + dungeonCompleteRuntime;
    }

    //add exp based on gate number
    function _expReward(Knight storage _knight, Ticket storage _ticket) private {
        if (_ticket.Gate == 1) {
            _knight.CurrentExp = _knight.CurrentExp.add(75);
        }
        else if (_ticket.Gate == 2) {
            _knight.CurrentExp = _knight.CurrentExp.add(150);
        }
        else if (_ticket.Gate == 3) {
            _knight.CurrentExp = _knight.CurrentExp.add(225);
        }
    }
    
    //add 1 level to the knight
    function _levelUp(Knight storage _knight) private {
        _knight.Level++;
        //set CurrentExp by subtracting the CurrentExp by ExpNeededForNextLevel
        _knight.CurrentExp = _knight.CurrentExp.sub(_knight.ExpNeededForNextLevel);
        //add 100exp for next ExpNeededForNextLevel
        _knight.ExpNeededForNextLevel = _knight.ExpNeededForNextLevel.add(50);
    }
    
    function _loot(uint8 _upto) private {
        //lootSuccessRate for knight
        if (lootSuccessRate >= 50 && lootSuccessRate <= 80) {
            uint8 level = _upto * 10;
            _createKnight("New Knight Acquired", level);
        }
        
        //lootSuccessRate for ticket
        if (lootSuccessRate >= 70 && lootSuccessRate <= 100) {
            _createTicket(uint8(_pseudoRandom(1, _upto)));
        }
    }
    
    function enterDungeon(uint _knightId, uint _ticketId) onlyOwnerOf(_knightId) public {
        Knight storage knight = knights[_knightId];
        Ticket storage ticket = tickets[_ticketId];
        
        //require that knight must ready or available
        require(_isReady(knight));
        //require that ticket has still UseLimit
        require(ticket.UseLimit >= 1);
        //reduce the UseLimit of ticket by 1
        ticket.UseLimit--;

        if (ticket.UseLimit == 0) {
            ownerTicketCount[msg.sender] = ownerTicketCount[msg.sender].sub(1);
        }

        if (knight.Level < maxLevel) {
            _expReward(knight, ticket);
            //check if knight is ready to level up
            while (knight.CurrentExp >= knight.ExpNeededForNextLevel) {
                _levelUp(knight);
                emit KnightLeveledUp(_knightId);
            }
        }
        
        lootSuccessRate = _pseudoRandom(0, 100);
        if (lootSuccessRate >= lootSuccessProbability) {
            _loot(ticket.Gate);
        }
        
        _triggerCooldown(knight);
    }
}