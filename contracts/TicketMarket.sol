pragma solidity ^0.4.24;

import "./KnightAdventure.sol";

contract TicketMarket is KnightAdventure {

    struct MarketTicket {
        address Seller;
        uint256 TicketId;
        uint128 Price;
        bool isSold;
    }

    MarketTicket[] marketTickets;
    uint totalTicketsInMarket = 0;
    
    function sellTicket(uint _ticketId, uint128 _price) public {
        require(msg.sender == ticketIndexToOwner[_ticketId]);
        require(tickets[_ticketId].isInMarket == false);
        MarketTicket memory market = MarketTicket({
            Seller: msg.sender,
            TicketId: _ticketId,
            Price: _price,
            isSold: false
        });
        marketTickets.push(market);
        tickets[_ticketId].isInMarket = true;
        totalTicketsInMarket = totalTicketsInMarket.add(1);
    }
    
    function buyTicket(uint _marketId) public payable {
        MarketTicket storage marketTicket = marketTickets[_marketId];
        require(marketTicket.Price == msg.value);
        require(marketTicket.isSold == false);
        marketTicket.Seller.transfer(msg.value);
        _transferTicketToBuyer(marketTicket.Seller, marketTicket.TicketId);
        //mark sold ticket
        marketTicket.isSold = true;
        //subtract totalTicketsInMarket by 1
        totalTicketsInMarket = totalTicketsInMarket.sub(1);
        //set ticket isInMarket to false so it can be sell again in the market
        tickets[marketTicket.TicketId].isInMarket = false;
    }
    
    function _transferTicketToBuyer(address _to, uint _ticketId) private {
        ownerTicketCount[_to] = ownerTicketCount[_to].sub(1);
        ownerTicketCount[msg.sender] = ownerTicketCount[msg.sender].add(1);
        ticketIndexToOwner[_ticketId] = msg.sender;
    }
    
    function getMarketTickets() public view returns(uint[]) {
        uint[] memory result = new uint[](totalTicketsInMarket);
        uint counter;
        for (uint i = 0; i < marketTickets.length; i++) {
            if (marketTickets[i].isSold == false) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }
    
    function getMarketTicketDetails(uint _marketId) public view returns(address, uint, uint, bool) {
        require(_marketId >= 0);
        require(_marketId < marketTickets.length);
        MarketTicket memory marketTicket = marketTickets[_marketId];
        return (marketTicket.Seller, marketTicket.TicketId, marketTicket.Price, marketTicket.isSold);
    }
}