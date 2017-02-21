# Trello Dependency

A [Trello](trello.com) power-up to make visualisation and management of dependencies between cards simpler/more sane. Will most likely lead to my dependency on Trello as a project and task management system even stronger.

## How to use

Trello Dependency uses card numbers to identify cards, and lists the numbers on the bottom of cards so that you can identify them. In order to link a card to another, add a label starting with the first card's number (with an optional '#') to the second card. For example if card 103 is "Make dinner" and card 140 is "Buy dinner ingredients", you could add a label named '103', '#103' or '#103 dinner' to card 140. You'd then see a badge appear on card 140 with the name of the card it's linked to: "Make dinner". On 103 you'd see the count of related cards and how many are done. Any card in a list whose name contains the word 'done' is counted as done.

## Trying it out

~~Trello lets you try out power-ups for a single browser and session.~~ Trello has removed this convenient testing functionality, but don't worry, there's a workaround:

1. You need to add the power-up to a team, if you don't have one you want to use Trello Dependency with create a new one.
1. Go to the Trello [power-up admin screen](https://trello.com/power-ups/admin/)
1. Select your team and create a new power-up with whatever you like as the name and `https://piemonkey.github.io/manifest.json` as the manifest URL.

You should now see it in the Trello power-up list. You will need to reload Trello if you already had it open.

If you want to work on a fork, simply fork the Github repo and use the equivalent github pages url for your username.

## Local development

Fortunately you can use the same method for local development as for trying out a hosted power-up, as the Trello servers don't actually read any of the files, only your browser does. To run the one included here:

1. `npm install`
1. `npm start`
1. Create a trello team and a board within that team (this is free).
1. Go to the Trello [power-up admin screen](https://trello.com/power-ups/admin/)
1. Select your team and create a new power-up with whatever you like as the name and `https://localhost:8080/manifest.json` as the manifest URL.
1. Load the [manifest file](https://localhost:8080/manifest.json) in your browser
1. Tell the browser to ignore the invalid certificate authority for this site:
  - On Chrome: advanced > proceed to localhost
  - On Firefox: advanced > add exception > confirm security exception
1. Reload Trello and enable the power-up in the power-up menu

Reloading the browser should let you see any changes you make, but you might need to disable caching or use force-reload to pick them up.
