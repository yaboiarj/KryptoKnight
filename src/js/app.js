App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  knightAdventureInstance: null,

  init: function () {
    $("#loader").hide();
    $("#account-error").hide();
    $("#alert").hide();
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
    $.getJSON("KnightAdventure.json", function (knightAdventure) {
      // instantiate a new truffle contract from the artifact
      App.contracts.KnightAdventure = TruffleContract(knightAdventure);
      // connect provider to interact with contract
      App.contracts.KnightAdventure.setProvider(App.web3Provider);

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
    App.contracts.KnightAdventure.deployed().then(function (instance) {
      knightAdventureInstance = instance;
      return App.loadInventory();
    });
  },

  loadInventory: function () {
    let loader = $("#loader");
    loader.append('<p class="text-center">Your inventory is loading... Please wait.</p>');
    let contentKnight = $("#content-knight");
    let contentTicket = $("#content-ticket");

    loader.show();
    contentKnight.hide();
    contentTicket.hide();

    // load contract data
    App.contracts.KnightAdventure.deployed().then(function (instance) {
      knightAdventureInstance = instance;

      let knightsResult = $("#knightsResult");
      knightsResult.empty();

      knightAdventureInstance.getKnightsByOwner(App.account).then(function (intArray) {
        for (let i = 0; i < intArray.length; i++) {

          let index = intArray[i].toNumber();

          knightAdventureInstance.getKnightDetails(index).then(function (knight) {
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

      App.getPagination('#mytable');
      loader.hide();
      contentKnight.show();

      let ticketsResult = $("#ticketsResult");
      ticketsResult.empty();

      knightAdventureInstance.getTicketsByOwner(App.account).then(function (intArray) {
        for (let i = 0; i < intArray.length; i++) {

          let index = intArray[i].toNumber();

          knightAdventureInstance.getTicketDetails(index).then(function (ticket) {
            ticket = ticket.toString();
            ticket = ticket.split(',');

            let gate = ticket[0];
            let useLimit = ticket[1];
            let description = ticket[2];

            // Render ticket result
            let ticketTemplate = $("#ticketTemplate");
            ticketTemplate.find('.panel-title-ticket').text('Ticket #' + index);
            ticketTemplate.find('.ticket-gate').text(gate);
            ticketTemplate.find('.ticket-use-limit').text(useLimit);
            ticketTemplate.find('.ticket-description').text(description);
            ticketsResult.append(ticketTemplate.html());
          })
        }
      })
      loader.hide();
      contentTicket.show();
    })
  },

  search: function (index) {
    $("#search-knight").empty();
    $("#search-ticket").empty();

    if (Math.floor(index) == index) {
      knightAdventureInstance.getKnightDetails(index).then(function (knight) {
        knight = knight.toString();
        knight = knight.split(',');

        let name = knight[0];
        let level = knight[1];
        let currExp = knight[2];
        let neededExp = knight[3];
        let title = knight[4];

        // Render knight Result
        let knightTemplate = "<tr><th>" + index + "</th><td>" + name + "</td><td>" + level + "</td><td>" + currExp + ' / ' + neededExp + "</td><td>" + title + "</td></tr>"
        $("#search-knight").append(knightTemplate);
      })

      knightAdventureInstance.getTicketDetails(index).then(function (ticket) {
        ticket = ticket.toString();
        ticket = ticket.split(',');

        let gate = ticket[0];
        let useLimit = ticket[1];
        let description = ticket[2];

        // Render ticket result
        let ticketTemplate = $("#search-ticket-template");
        ticketTemplate.find('.panel-title-ticket').text('Ticket #' + index);
        ticketTemplate.find('.ticket-gate').text(gate);
        ticketTemplate.find('.ticket-use-limit').text(useLimit);
        ticketTemplate.find('.ticket-description').text(description);
        $("#search-ticket").append(ticketTemplate.html());
      })
    }
  },

  handleAdopt: function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    /*
     * Replace me...
     */
  },

  etherToWei: function(amount) {
    return amount * (10 ** 18);
  },

  getPagination: function (table) {
    $('#maxRows').on('change', function () {
      $('.pagination').html('');
      var trnum = 0;
      var maxRows = parseInt($(this).val());
      var totalRows = $(table).find('tbody tr').length;
      $(table).find('tr:gt(0)').each(function () {
        trnum++;
        if (trnum > maxRows) {

          $(this).hide();
        }
        if (trnum <= maxRows) {
          $(this).show();
        }
      });
      if (totalRows > maxRows) {
        var pagenum = Math.ceil(totalRows / maxRows);

        for (var i = 1; i <= pagenum;) {
          $('.pagination').append('<li data-page="' + i + '">\
                        <span>' + i++ + '<span class="sr-only">(current)</span></span>\
                      </li>').show();
        }
      }
      $('.pagination li:first-child').addClass('active');
      $('.pagination li').on('click', function () {
        var pageNum = $(this).attr('data-page');
        var trIndex = 0;
        $('.pagination li').removeClass('active');
        $(this).addClass('active');
        $(table).find('tr:gt(0)').each(function () {
          trIndex++;

          if (trIndex > (maxRows * pageNum) || trIndex <= ((maxRows * pageNum) - maxRows)) {
            $(this).hide();
          } else {
            $(this).show();
          }
        });
      });
    });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});