pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract KnightTicket {

    struct Ticket {
        uint8 Gate;
        uint8 UseLimit;
        string Description;
    }

    Ticket[] tickets;

    mapping (uint => address) public ticketIndexToOwner;
    mapping (address => uint) ownerTicketCount;

    using SafeMath for uint;
    
    event NewTicket(uint indexed ticketId);
    
    constructor() internal {
        _createTicket(1);
    }
    
    function _createTicket(uint8 _gate) internal {
        Ticket memory ticket = Ticket({
            Gate: _gate,
            UseLimit: 5,
            Description: "Required to access the dungeon gate."
        });
        uint id = tickets.push(ticket) - 1;
        ticketIndexToOwner[id] = msg.sender;
        ownerTicketCount[msg.sender] = ownerTicketCount[msg.sender].add(1);
        emit NewTicket(id);
    }
}