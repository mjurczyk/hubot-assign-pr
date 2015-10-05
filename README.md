# hubot-assign-pr

A hubot script that assigns people to a PR on Github.

## Installation

In hubot project repo, run:

`npm install hubot-assign-pr --save`

Then add **hubot-assign-pr** to your `external-scripts.json`:

```json
[
  "hubot-assign-pr"
]
```

## Sample usage

### Defining the team

Create a file in the main directory with a nice name, like `best-team-evr.json`. Put a hashmap of your team members into it (key - display name (for ex. from slack/flowdock); value - login on Github):

```json
{
  "Maciek": "mjurczyk",
  "SomeOtherGuy: "otherGuy",
  ...
}
```

And remember to put the filename in a proper environment variable after that:

```shell
export HUBOT_ASSIGN_TEAM=./best-team-evr.json
```

### Github auth

If you would like hubot to post assignments directly to the pull requests on Github, export Basic Auth hash as a variable as well:

```shell
export HUBOT_GITHUB_AUTH="Basic YOUR_AUTH_HASH"
```

### Calling the assignment

To ask for assignment, just give hubot the PR URL:

```
you > hubot: https://github.com/mjurczyk/hubot-assign-pr/pull/10
hubot > Assigned PR to @mjurczyk and @anotherGuy. Review the hell outta it!
```

Followed by that, hubot uses Github API and attempts to add proper comments to the pull request (requires Basic Auth).
