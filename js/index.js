'use strict'

var cardLabelRegex = /^#? ?(\d+)$/
var doneListRegex = /(?:Done|done|DONE)/

var cards = {}
var cardNumIdMap = {}
var children = {}
var lists = {}

TrelloPowerUp.initialize({
  'card-badges': function(t) {
    var cardId = ''
    if (!Promise) {
      // TODO load promise polyfill for crap like internet explorer
      return null
    }
    return Promise.all([
      t.card('id', 'url', 'labels', 'idList', 'name'),
      t.list('name'),
    ])
      .then(function(context) {
        var card = context[0]
        var list = context[1]
        // Update whether list counts as done by checking list name
        lists[card.idList] = {done: doneListRegex.test(list.name)}

        cardId = card.id
        if (!cards[cardId]) {
          var cardNumber = card.url.slice(card.url.lastIndexOf('/') + 1, card.url.indexOf('-'))
          cards[cardId] = {
            t: t,
            number: cardNumber,
            labels: [],
          }
          cardNumIdMap[cardNumber] = cardId
        }
        cards[cardId].name = card.name

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

              if (cardNumIdMap[cardNo]) {
                cards[cardId].parent = cards[cardNumIdMap[cardNo]].name
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
            var badge = {
              text: cardNo,
              icon: './images/logo.svg',
              refresh: 10,
            }
            if (cards[cardId].parent) {
              badge = {
                text: cards[cardId].parent,
                icon: './images/logo.svg',
                color: 'green',
                refresh: 10,
              }
            }
            if (children[cardNo]) {
              badge = {
                text: children[cardNo].filter(function(child) {return child.done}).length
                  + ' / ' + children[cardNo].length,
                icon: './images/logo.svg',
                color: 'green',
                refresh: 10,
              }
            }
            return badge
          },
        }]
      })
  },
})
