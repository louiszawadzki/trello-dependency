'use strict'

var cards = {}

TrelloPowerUp.initialize({
  'card-badges': function(t) {
    var cardId = ''
    return t.card('id', 'url')
      .then(function(card) {
        cardId = card.id
        if (!cards[cardId]) {
          cards[cardId] = {
            t: t,
            number: card.url.slice(card.url.lastIndexOf('/') + 1, card.url.indexOf('-')),
          }
        }

        return [{
          text: cards[cardId].number,
          icon: './images/logo.svg',
          color: 'green',
        }]
      })
  },
})
