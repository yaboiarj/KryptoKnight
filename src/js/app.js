App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("KnightAdventure.json", function(knightAdventure) {
      // instantiate a new truffle contract from the artifact
      App.contracts.KnightAdventure = TruffleContract(knightAdventure);
      // connect provider to interact with contract
      App.contracts.KnightAdventure.setProvider(App.web3Provider);

    return App.render();
    //return App.bindEvents();
    });
  },

  /*
  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },
  */

  render: function() {
    var knightAdventureInstance ;
    var loaderKnight = $("#loader-knight");
    var contentKnight = $("#content-knight");

    var loaderTicket = $("#loader-ticket");
    var contentTicket = $("#content-ticket");

    loaderKnight.show();
    contentKnight.hide();

    loaderTicket.show();
    contentTicket.hide();

    // load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    })

    // load contract data
    App.contracts.KnightAdventure.deployed().then(function(instance) {
      knightAdventureInstance = instance;
 
      var knightsResult = $("#knightsResult");
      knightsResult.empty();

      knightAdventureInstance.getKnightsByOwner(App.account).then(function(intArray) {
        for (var i = 0; i < intArray.length; i++) {
          knightAdventureInstance.getKnightDetails(intArray[i]).then(function(knight) {
            knight = knight.toString();
            knight = knight.split(',');

            var name = knight[0];
            var level = knight[1];
            var currExp = knight[2];
            var neededExp = knight[3];
            var title = knight[4];
            
            // Render knight Result
            var knightTemplate = $("#knightTemplate");
            knightTemplate.find('.panel-title-knight').text(name);
            knightTemplate.find('.knight-level').text(level);
            knightTemplate.find('.knight-exp').text(currExp);
            knightTemplate.find('.knight-title').text(title);
            knightsResult.append(knightTemplate.html());
          })
        }
      })

      loaderKnight.hide();
      contentKnight.show();

      var ticketsResult = $("#ticketsResult");
      ticketsResult.empty();

      knightAdventureInstance.getTicketsByOwner(App.account).then(function(intArray) {
        for (var i = 0; i < intArray.length; i++) {
          knightAdventureInstance.getTicketDetails(intArray[i]).then(function(ticket) {
            ticket = ticket.toString();
            ticket = ticket.split(',');

            var gate = 'Gate Access: ' + ticket[0];
            var useLimit = ticket[1];
            var description = ticket[2];

            // Render ticket result
            var ticketTemplate = $("#ticketTemplate");
            ticketTemplate.find('.panel-title-ticket').text(gate);
            ticketTemplate.find('.ticket-use-limit').text(useLimit);
            ticketTemplate.find('.ticket-description').text(description);
            ticketsResult.append(ticketTemplate.html());
          })
        }
      })

      loaderTicket.hide();
      contentTicket.show();
    })
  },

  markAdopted: function(adopters, account) {
    /*
     * Replace me...
     */
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    /*
     * Replace me...
     */
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
