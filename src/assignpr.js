// Description:
//   Automatic PR assignments
//
// Dependencies:
//   None
//
// Configuration:
//  HUBOT_ASSIGN_TEAM - comma separated team members list (Mark,Tommy,Spanish Inquisition,etc.)
//  HUBOT_GITHUB_API - Github API URL (if changed in the future)
//  HUBOT_GITHUB_AUTH - Github API credentials
//
// Commands:
//   just write github's PR url to hubot, he'll handle the rest
//
// Author:
//   mjurczyk

var fs = require('fs');
var superagent = require('superagent');
var Promise = require('promise');

// Copied from:
// @see http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
// NOTE Modifies both input and output arrays
function shuffle(o){
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

module.exports = function (robot) {
  var team;
  var assignmentList;

  try {
    team = JSON.parse(fs.readFileSync(process.env.HUBOT_ASSIGN_TEAM, 'utf8'));
  } catch(error) {
    console.warn('No assignment team list found (./assign-team.json)');
    return;
  }

  assignmentList = [].concat(Object.keys(team));
  shuffle(assignmentList);

  function naturalizeListing(listing) {
    // Add some natural feeling to the listings by adding 'and' instead of last comma
    var lastComma = listing.lastIndexOf(',');

    if (lastComma === -1) {
      return listing;
    }

    return listing.substr(0, lastComma) + ' and ' + listing.substr(lastComma + 1);
  }

  function getMotivatinalQuote() {
    var quotes = [
      'Give it hell!',
      'Wreck it, boys!',
      'Leave no bug behind!',
      'Remember to check them sneaky file names!',
      'Awaken your inner grammar-nazis!',
      'Good luck!',
      'Check it well!',
      'Yeah, another one...',
      'One liner, guys!',
      'Short one, trust me!',
      'Give it :-1:! You know, to prove the point!',
      'This one looks nasty!',
      'Seen worse!',
      'I\'d check it myself, guys, but I\'m just a bot!',
      'Review the hell outta it!'
    ];

    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  function sendGithubNotifications(pr, assignees) {
    var assigneesOnGithub = assignees.map(function (displayName) {
        return '@' + team[displayName];
      })
      .filter(Boolean)
      .join(', ');

    var matchRegex = pr.match(/https?:\/\/github.com\/(.+\/)pull\/(\d+).*/);
    var repoName = matchRegex[1];
    var issueId = matchRegex[2];
    var githubApi = process.env.HUBOT_GITHUB_API || 'https://api.github.com/';
    var callUrl = githubApi;
    var auth = process.env.HUBOT_GITHUB_AUTH;

    if (!repoName || !issueId || !auth) {
      return;
    }

    callUrl = callUrl + 'repos/' + repoName + 'issues/' + issueId + '/comments';

    return new Promise(function (resolve, reject) {
      superagent
      .post(callUrl)
      .set('Authorization', auth)
      .send({
        body: 'Assigned to ' + naturalizeListing(assigneesOnGithub) + '.'
      })
      .end(function (error, response) {
        if (error || response.status >= 400) {
          reject(response.message || error);
        }

        resolve();
      });
    });
  }

  robot.hear(/https?:\/\/(github.com)\/.+\/(pull\/\d+)/g, function (response) {
    var assignedPeople = assignmentList.splice(0, 2);
    var callThemNames = [].concat(assignedPeople);

    assignmentList = assignmentList.concat(assignedPeople);

    callThemNames = naturalizeListing(
      callThemNames.map(function (displayName) {
        return '@' + displayName;
      })
      .join(', ')
    );

    response.send('PR assigned to ' + callThemNames + '. ' + getMotivatinalQuote());

    return sendGithubNotifications(response.match[0], assignedPeople)
    .catch(function (error) {
      response.send('Oops, but counldn\'t add it on Github for some reason.');
      response.send('Got such a message:' + error);
      response.send('Can someone help me, pls...?');
    });
  });

  robot.hear(/(show|list) (pr|PR) team/, function (response) {
    var teamList = 'Current PR team consists of ' + team.join(', ');

    return response.send(naturalizeListing(teamList));
  });
};
