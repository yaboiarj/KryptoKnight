pragma solidity ^0.4.24;

import "./TicketMarket.sol";

contract KnightMarket is TicketMarket {

    struct MarketKnight {
        address Seller;
        uint256 KnightId;
        uint128 Price;
        bool isSold;
    }

    MarketKnight[] marketKnights;
    uint totalKnightsInMarket = 0;
    
    function sellKnight(uint _knightId, uint128 _price) onlyOwnerOf(_knightId) public {
        require(_isReady(knights[_knightId]));
        MarketKnight memory market = MarketKnight({
            Seller: msg.sender,
            KnightId: _knightId,
            Price: _price,
            isSold: false
        });
        marketKnights.push(market);
        knights[_knightId].isInMarket = true;
        //reduce owner knight count by 1 so when function getKnightsByOwner call, it will return the new int array of index
        ownerKnightCount[msg.sender] = ownerKnightCount[msg.sender].sub(1);
        totalKnightsInMarket = totalKnightsInMarket.add(1);
    }
    
    function buyKnight(uint _marketId) public payable {
        MarketKnight storage marketKnight = marketKnights[_marketId];
        require(marketKnight.Price == msg.value);
        require(marketKnight.isSold == false);
        marketKnight.Seller.transfer(msg.value);
        _transferKnightToBuyer(marketKnight.Seller, marketKnight.KnightId);
        //mark sold knight
        marketKnight.isSold = true;
        //subtract totalKnightsInMarket by 1
        totalKnightsInMarket = totalKnightsInMarket.sub(1);
        //set knight isInMarket to false so it can be sell again in the market
        knights[marketKnight.KnightId].isInMarket = false;
    }
    
    function _transferKnightToBuyer(address _to, uint _knightId) private {
        ownerKnightCount[msg.sender] = ownerKnightCount[msg.sender].add(1);
        knightIndexToOwner[_knightId] = msg.sender;
    }
    
    function getMarketKnights() public view returns(uint[]) {
        uint[] memory result = new uint[](totalKnightsInMarket);
        uint counter;
        for (uint i = 0; i < marketKnights.length; i++) {
            if (marketKnights[i].isSold == false) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }
    
    function getMarketKnightDetails(uint _marketId) public view returns(address, uint, uint, bool) {
        require(_marketId >= 0);
        require(_marketId < marketKnights.length);
        MarketKnight memory marketKnight = marketKnights[_marketId];
        return (marketKnight.Seller, marketKnight.KnightId, marketKnight.Price, marketKnight.isSold);
    }
}