'use strict'

var cardLabelRegex = /^#? ?(\d+)$/

var cards = {}
var children = {}

TrelloPowerUp.initialize({
  'card-badges': function(t) {
    var cardId = ''
    return t.card('id', 'url', 'labels')
      .then(function(card) {
        cardId = card.id
        if (!cards[cardId]) {
          cards[cardId] = {
            t: t,
            number: card.url.slice(card.url.lastIndexOf('/') + 1, card.url.indexOf('-')),
            labels: [],
          }
        }
        var oldLabels = cards[cardId].labels
        var currentLabels = card.labels.map(function(label) {return label.name})
        currentLabels
          .filter(function(label) {return oldLabels.indexOf(label) === -1})
          .map(function(label) {return cardLabelRegex.exec(label)})
          .forEach(function(match) {
            if (match && match[1]) {
              children[match[1]] = children[match[1]] ? children[match[1]].concat([cardId]) : [cardId]
            }
          })
        oldLabels
          .filter(function(label) {return currentLabels.indexOf(label) === -1})
          .map(function(label) {return cardLabelRegex.exec(label)})
          .forEach(function(match) {
            if (match && match[1]) {
              children[match[1]] = children[match[1]].filter(function(id) {return id !== cardId})
            }
          })
        cards[cardId].labels = currentLabels

        return [{
          text: children[cards[cardId].number] ? '- / ' + children[cards[cardId].number].length: cards[cardId].number,
          icon: './images/logo.svg',
          color: 'green',
        }]
      })
  },
})
