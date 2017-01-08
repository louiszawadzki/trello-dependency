'use strict'

var cardLabelRegex = /^#? ?(\d+)$/
var doneListRegex = /(?:Done|done|DONE)/

var cards = {}
var children = {}
var lists = {}

TrelloPowerUp.initialize({
  'card-badges': function(t) {
    var cardId = ''
    return t.card('id', 'url', 'labels', 'idList')
      .then(function(card) {
        // Add whether the list counts as done to the map of lists if it's not already there
        if (!lists[card.idList]) {
          lists[card.idList] = {done: false}
          // Update whether done by checking list name
          t.list('name')
            .then(function(list) {
              if (doneListRegex.test(list.name)) {
                lists[card.idList].done = true
              }
            })
        }

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
          .map(function(label) {return cardLabelRegex.exec(label)})
          .forEach(function(match) {
            if (match && match[1]) {
              var cardNo = match[1]
              if (oldLabels.indexOf(match.input) === -1) {
                var newChild = {id: cardId, done: lists[card.idList].done}
                children[cardNo] = children[cardNo] ? children[cardNo].concat([newChild]) : [newChild]
              } else {
                children[cardNo].forEach(function(child) {
                  if (child.id === cardId) {
                    child.done = lists[card.idList].done
                  }
                })
              }
            }
          })
        oldLabels
          .filter(function(label) {return currentLabels.indexOf(label) === -1})
          .map(function(label) {return cardLabelRegex.exec(label)})
          .forEach(function(match) {
            if (match && match[1]) {
              var cardNo = match[1]
              children[cardNo] = children[cardNo].filter(function(child) {return child.id !== cardId})
            }
          })
        cards[cardId].labels = currentLabels

        return [{
          dynamic: function() {
            var cardNo = cards[cardId].number
            var text = cardNo
            if (children[cardNo]) {
              text = children[cardNo].filter(function(child) {return child.done}).length
                + ' / ' + children[cardNo].length
            }
            return {
              text: text,
              icon: './images/logo.svg',
              color: 'green',
              refresh: 10,
            }
          },
        }]
      })
  },
})
