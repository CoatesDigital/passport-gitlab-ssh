/* eslint no-console: off */


// nodejs native requires
const fs = require('fs');
const os = require('os');


// 3rd party requires
const request = require('request');
const jwt = require('jsonwebtoken');


// Configurables
const privateKeyPath = `${os.homedir()}/.ssh/id_rsa`; // Path to private key to sign the JWT with
const gitlabHost = 'gitlab.com';                      // used by client to discover gitlab username
const securedUrl = 'https://example.com/secure';      // This is the secure URL on your app


const iss = 'gitlab-ssh'; // used to tell app which issuer to check


// TODO: using ssh-agent instead of the UUID would be nice



// --------


// figure out what gitlab user I am by ssh'ing into gitlab
// uses private key for ssh access

const childProcess = require('child_process');

const gitlabUserCommand = `ssh git@${gitlabHost}`;
const stdoutBuffer = childProcess.execSync(gitlabUserCommand);

if (!stdoutBuffer) throw new Error(`Failed to run [${gitlabUserCommand}] got no buffer`);
const stdout = stdoutBuffer.toString();

if (!stdout) throw new Error(`Failed to run [${gitlabUserCommand}] buffer not a string`);

const findResults = stdout.match(/@(.+)!/);
if (findResults.length !== 2) throw new Error(`Failed to get user from output ${stdout}`);

const username = findResults[1];
console.log('username: ', username);


// create the token
const unsignedToken = {
  iss,
  username,
};

console.log('unsignedToken:', unsignedToken);


// sign the token with my private key
const sshKey = fs.readFileSync(privateKeyPath, 'ascii');
const signedToken = jwt.sign(unsignedToken, sshKey, {
  algorithm: 'RS256',
});

console.log(`signedToken: ${signedToken}`);


// make the request to the app, using the signed json web token as auth
const requestOptions = {
  url: securedUrl,
  auth: {
    bearer: signedToken
  },
};

const responseHandler = (error, response, body) => {
  if (error) {
    console.log('error in response: ', error);
    return;
  }
  console.log('response.statusCode: ', response.statusCode);
  console.log('body: ', body);
};

request.get(requestOptions, responseHandler)
  .on('error', (response) => {
    console.log('error making request: ', response);
  });
