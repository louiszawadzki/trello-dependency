'use strict'

var cards = {}

TrelloPowerUp.initialize({
  'card-badges': function(t) {
    var cardId = ''
    t.card('id')
      .get('id')
      .then(function(id) {
        cardId = id
        cards[id] = {t: t}
        t.card('url')
          .get('url')
          .then(function(url) {
            cards[id].number = url.slice(url.lastIndexOf('/') + 1, url.indexOf('-'))
          })
      })

    return [{
      dynamic: function() {
        return {
          text: cards[cardId].number,
          icon: './images/logo.svg',
          color: 'green',
          refresh: 20,
        }
      },
    }]
  },
})
