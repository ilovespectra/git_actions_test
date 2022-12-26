const SpellChecker = require('spellchecker');

// Set the language of the spellchecker
SpellChecker.setDictionary('en-US');

// Set the maximum number of spelling errors to allow in a pull request
const MAX_SPELLING_ERRORS = 5;

// Set the repository and owner of the pull request
const repository = 'my-repository';
const owner = 'my-username';

// Set the access token for the GitHub API
const accessToken = 'my-access-token';

// Set the headers for the API request
const headers = {
  'Authorization': `Token ${accessToken}`,
  'User-Agent': 'MyApp/1.0',
  'Accept': 'application/vnd.github+json'
};

async function checkSpelling(pullRequestNumber) {
  // Make a request to the GitHub API to get the pull request description
  const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/pulls/${pullRequestNumber}`, {
    headers: headers
  });

  // Get the pull request data from the response
  const pullRequest = await response.json();

  // Get the description of the pull request
  const description = pullRequest.body;

  // Check the spelling of the description
  const spellingErrors = SpellChecker.checkSpelling(description);

  // If there are more spelling errors than the maximum allowed, add a comment to the pull request
  if (spellingErrors.length > MAX_SPELLING_ERRORS) {
    const comment = `There are more than ${MAX_SPELLING_ERRORS} spelling errors in this pull request. Please fix them before submitting.`;
    await fetch(`https://api.github.com/repos/${owner}/${repository}/issues/${pullRequestNumber}/comments`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ body: comment })
    });
  }
}

// Set up a webhook to listen for pull request events
app.post('/webhook', (req, res) => {
  // Get the event type and pull request number from the request body
  const eventType = req.headers['x-github-event'];
  const pullRequestNumber = req.body.number;

  // If the event is a pull request being opened or edited, check the spelling of the description
  if (eventType === 'pull_request' && (req.body.action === 'opened' || req.body.action === 'edited')) {
    checkSpelling(pullRequestNumber);
  }
});
