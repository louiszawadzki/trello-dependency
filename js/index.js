'use strict'

if (!Promise) {
  // load promise polyfill for crap like internet explorer
  var Promise = TrelloPowerUp.Promise
}

var cardLabelRegex = /^#? ?(\d+)/
var doneListRegex = /(?:Done|done|DONE)/
var cardPointsRegex = /^\((\d+)\)/

var cards = {}
var cardNumIdMap = {}
var children = {}
var lists = {}

function cardNoBadge(cardNo) {
  return {
    title: 'Card Number',
    text: cardNo,
    icon: './images/logo.svg',
    refresh: 10,
  }
}

function depOfBadge(cardId) {
  return {
    title: 'Dependency of',
    text: cards[cards[cardId].parent].name,
    icon: './images/logo.svg',
    refresh: 10,
  }
}

function cardCounterBadge(childrenDone, numChildren) {
  return {
    title: 'Dependent Cards',
    text: '(' + childrenDone + ' / ' + numChildren + ')',
    icon: './images/logo.svg',
    color: childrenDone === 0 ? 'red' :
      childrenDone === numChildren ? 'green' :
      'yellow',
    refresh: 10,
  }
}

function pointsCounterBadge(donePoints, totalPoints) {
  return {
    title: 'Points Done of Total',
    text: '(' + donePoints + ' / ' + totalPoints + ')',
    icon: './images/logo.svg',
    color: donePoints === 0 ? 'red' :
      donePoints === totalPoints ? 'green' :
      'yellow',
    refresh: 10,
  }
}

function dynamicCardBadges(cardId) {
  return [{
    dynamic: function() {
      var cardNo = cards[cardId].number
      var badge = cardNoBadge(cardNo)
      if (cards[cardId].parent) {
        badge = depOfBadge(cardId)
      }
      if (children[cardNo]) {
        var doneChildCards = children[cardNo].filter(function(child) {return child.done})
        var childrenDone = doneChildCards.length
        var numChildren = children[cardNo].length
        badge = cardCounterBadge(childrenDone, numChildren)
      }
      return badge
    },
  }]
}

function staticCardBadges(cardId) {
  var cardNo = cards[cardId].number
  var badges = [cardNoBadge(cardNo)]
  if (cards[cardId].parent) {
    badges.push(depOfBadge(cardId))
  }
  if (children[cardNo]) {
    var doneChildCards = children[cardNo].filter(function(child) {return child.done})
    var childrenDone = doneChildCards.length
    var numChildren = children[cardNo].length
    var donePoints = doneChildCards.reduce(function(sum, child) {return sum + child.points}, 0)
    var totalPoints = children[cardNo].reduce(function(sum, child) {return sum + child.points}, 0)
    badges = badges.concat([
      cardCounterBadge(childrenDone, numChildren),
      pointsCounterBadge(donePoints, totalPoints),
    ])
  }

  return badges
}

TrelloPowerUp.initialize({
  'card-badges': function(t) {
    var cardId = ''
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
              // Label matches regex for linking card dependencies
              var cardNo = match[1]

              var pointsMatch = cardPointsRegex.exec(card.name)
              var points = pointsMatch ? parseInt(pointsMatch[1], 10) : 0

              if (oldLabels.indexOf(match.input) === -1) {
                // We've only just added the label to this card
                var newChild = {id: cardId, done: lists[card.idList].done, points: points}
                children[cardNo] = children[cardNo] ? children[cardNo].concat([newChild]) : [newChild]
              } else {
                // We already know about this dependency, maybe we need to update if it's done and points
                children[cardNo].forEach(function(child) {
                  if (child.id === cardId) {
                    child.done = lists[card.idList].done
                    child.points = points
                  }
                })
              }

              if (cardNumIdMap[cardNo]) {
                cards[cardId].parent = cardNumIdMap[cardNo]
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

              if (cardNumIdMap[cardNo]) {
                cards[cardId].parent = undefined
              }
            }
          })
        cards[cardId].labels = currentLabels

        return dynamicCardBadges(cardId)
      })
  },

  'card-detail-badges': function(t) {
    return t.card('id')
      .then(function(card) {
        return staticCardBadges(card.id)
      })
  },
})
