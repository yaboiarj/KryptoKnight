App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  knightContractInstance: null,

  init: function () {
    $("#loader").hide();
    $("#account-error").hide();
    $("#alert").hide();
    $("#market-table").hide();
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      const metamaskErrMsg = '<strong>Required MetaMask!</strong> You should install MetaMask browser extension <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en" target="_blank" class="alert-link">here</a>';
      $("#alert").addClass("alert-danger").append(metamaskErrMsg);
      $("#alert").show();
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("KnightMarket.json", function (knightContract) {
      // instantiate a new truffle contract from the artifact
      App.contracts.KnightContract = TruffleContract(knightContract);
      // connect provider to interact with contract
      App.contracts.KnightContract.setProvider(App.web3Provider);

      return App.initAccount();
    });
  },

  initAccount: function () {
    // load account data
    web3.eth.getAccounts(function (err, accounts) {
      if (err !== null) {
        console.error("An error occurred: " + err);
      } else if (accounts.length == 0) {
        const accountErrMsg = '<strong>Login MetaMask!</strong> Login your metamask account to proceed.'
        $("#account-error").addClass("alert-info").append(accountErrMsg);
        $("#account-error").show();
      } else {
        web3.eth.getCoinbase(function (err, account) {
          if (err === null) {
            App.account = account;
            return App.initContractInstance();
          }
        })
      }
    });
  },

  initContractInstance: function () {
    App.contracts.KnightContract.deployed().then(function (instance) {
      knightContractInstance = instance;
      App.loadMarket();
      App.loadInventory();
    });
  },

  initControlFunctions: function () {
    $('#myModal').on('show.bs.modal', function (e) {
      let id = e.relatedTarget.id;
    })
  },

  loadMarket: function () {
    $("#market-knight").empty();
    $("#market-ticket").empty();

    knightContractInstance.getMarketKnights().then(function (intArray) {
      for (let i = 0; i < intArray.length; i++) {

        //market knight index
        let index = intArray[i];

        App.getMarketKnightDetails(index);
      }
    });

    $("#market-table").show();

    knightContractInstance.getMarketTickets().then(function (intArray) {
      for (let i = 0; i < intArray.length; i++) {
        let index = intArray[i];

        App.getMarketTicketDetails(index);
      }
    });
  },

  getMarketKnightDetails: function (index) {
    knightContractInstance.getMarketKnightDetails(index).then(function (marketKnight) {
      marketKnight = marketKnight.toString();
      marketKnight = marketKnight.split(',');

      let seller = marketKnight[0];
      let knightId = marketKnight[1];
      let price = marketKnight[2];

      knightContractInstance.getKnightDetails(knightId).then(function (knight) {

        let name = knight[0];
        let level = knight[1];
        let currExp = knight[2];
        let neededExp = knight[3];
        let title = knight[4];

        // Render knight Result
        let marketKnightTemplate = "<tr><th>" + knightId + "</th><td>" + name + "</td><td>" + level + "</td><td>" + currExp + ' / ' + neededExp + "</td><td>" + title + "</td><td>" + App.weiToEther(price) + "</td><td>" + seller + "</td><td>" + '<button id="buy-knight" value="' + index + ', ' + price + `"type="button" onclick="App.buyKnight(this)" class="btn btn-default">Buy</button> </td></tr>`
        $("#market-knight").append(marketKnightTemplate);
      })
    })
  },

  getMarketTicketDetails: function (index) {
    knightContractInstance.getMarketTicketDetails(index).then(function (marketTicket) {
      marketTicket = marketTicket.toString();
      marketTicket = marketTicket.split(',');

      let seller = marketTicket[0];
      let ticketId = marketTicket[1];
      let price = marketTicket[2];

      knightContractInstance.getTicketDetails(ticketId).then(function (ticket) {
        ticket = ticket.toString();
        ticket = ticket.split(',');

        let gate = ticket[0];
        let useLimit = ticket[1];
        let description = ticket[2];

        // Render knight Result
        App.displayTicketsMarket(ticketId, gate, useLimit, description, price, seller);
      })
    })
  },

  loadInventory: function () {
    let loader = $("#loader");
    let contentKnight = $("#content-knight");
    let contentTicket = $("#content-ticket");

    let knightsResult = $("#knightsResult");

    knightsResult.empty();

    knightContractInstance.getKnightsByOwner(App.account).then(function (intArray) {
      for (let i = 0; i < intArray.length; i++) {

        let index = intArray[i].toNumber();

        knightContractInstance.getKnightDetails(index).then(function (knight) {
          knight = knight.toString();
          knight = knight.split(',');

          let name = knight[0];
          let level = knight[1];
          let currExp = knight[2];
          let neededExp = knight[3];
          let title = knight[4];

          // Render knight Result
          let knightTemplate = "<tr><th>" + index + "</th><td>" + name + "</td><td>" + level + "</td><td>" + currExp + ' / ' + neededExp + "</td><td>" + title + "</td></tr>"
          knightsResult.append(knightTemplate);
        })
      }
    })

    loader.hide();
    contentKnight.show();

    let ticketsResult = $("#ticketsResult");
    ticketsResult.empty();

    knightContractInstance.getTicketsByOwner(App.account).then(function (intArray) {
      for (let i = 0; i < intArray.length; i++) {

        let index = intArray[i].toNumber();

        knightContractInstance.getTicketDetails(index).then(function (ticket) {
          ticket = ticket.toString();
          ticket = ticket.split(',');

          let gate = ticket[0];
          let useLimit = ticket[1];
          let description = ticket[2];

          // Render ticket result
          App.displayTicketsInventory(index, gate, useLimit, description);
        })
      }
      loader.hide();
      contentTicket.show();
    })
  },

  getKnightsByOwner: function () {
    knightContractInstance.getKnightsByOwner(App.account).then(function (intArray) {
      $("#knightsSelect").empty();
      for (let i = 0; i < intArray.length; i++) {
        let knightOption = "<option value='" + intArray[i] + "' >" + intArray[i] + "</ option>"
        $("#knightsSelect").append(knightOption);
      }
    });
  },

  getTicketsByOwner: function () {
    knightContractInstance.getTicketsByOwner(App.account).then(function (intArray) {
      $("#ticketsSelect").empty();
      for (let i = 0; i < intArray.length; i++) {
        let ticketOption = "<option value='" + intArray[i] + "' >" + intArray[i] + "</option>"
        $("#ticketsSelect").append(ticketOption);
      }
    });
  },

  sellKnight: function () {
    let id = $('#knightsSelect').val();
    let price = $('#knightPrice').val();
    let priceInEther = App.etherToWei(price);
    knightContractInstance.sellKnight(id, priceInEther, {
      from: App.account,
      gas: 300000
    }).then(function (result) {
      console.log(result);
    });
  },

  sellTicket: function () {
    let id = $('#ticketsSelect').val();
    let price = $('#ticketPrice').val();
    let priceInEther = App.etherToWei(price);
    knightContractInstance.sellTicket(id, priceInEther, {
      from: App.account,
      gas: 300000
    }).then(function (result) {
      console.log(result);
    });
  },

  buyKnight: function (element) {
    element = element.value.toString();
    let elementVal = element.split(',');
    let marketId = elementVal[0];
    let price = elementVal[1];
    knightContractInstance.buyKnight(marketId, {
      from: App.account,
      gas: 300000,
      value: price
    }).then(function (result) {
      console.log(result);
    });
  },

  buyTicket: function (element) {
    element = element.value.toString();
    let elementVal = element.split(',');
    let marketId = elementVal[0];
    let price = elementVal[1];
    knightContractInstance.buyTicket(marketId, {
      from: App.account,
      gas: 300000,
      value: price
    }).then(function (result) {
      console.log(result);
    });
  },

  enterDungeon: function () {
    let knightId = $('#knightsSelect').val();
    let ticketId = $('#ticketsSelect').val();
    knightContractInstance.enterDungeon(knightId, ticketId, {
      from: App.account,
      gas: 300000,
    }).then(function (result) {
      console.log(result);
    });
  },

  etherToWei: function (amount) {
    return amount * (10 ** 18);
  },

  weiToEther: function (amount) {
    return amount / (10 ** 18);
  },

  displayTicketsInventory: function (index, gate, useLimit, description) {
    let ticketTemplate = $("#ticketTemplate");
    ticketTemplate.find('.panel-title-ticket').text('Ticket #' + index);
    ticketTemplate.find('.ticket-gate').text(gate);
    ticketTemplate.find('.ticket-use-limit').text(useLimit);
    ticketTemplate.find('.ticket-description').text(description);
    $("#ticketsResult").append(ticketTemplate.html());
  },

  displayTicketsMarket: function (ticketId, gate, useLimit, description, price, seller) {
    let ticketTemplate = $("#market-ticket-template");
    ticketTemplate.find('.panel-title-ticket').text('Ticket #' + ticketId);
    ticketTemplate.find('.ticket-gate').text(gate);
    ticketTemplate.find('.ticket-use-limit').text(useLimit);
    ticketTemplate.find('.ticket-description').text(description);
    ticketTemplate.find('.ticket-price').text(App.weiToEther(price) + ' ETH');
    ticketTemplate.find('.ticket-seller').text(seller.substring(0, 22) + ' ' + seller.substring(22, 42));
    ticketTemplate.find('.btn').attr('value', `${ticketId}, ${price}`)
    ticketTemplate.find('.btn').attr('id', 'buy-ticket');
    ticketTemplate.find('.btn').attr('onclick', 'App.buyTicket(this)');
    $("#market-ticket").append(ticketTemplate.html());
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});