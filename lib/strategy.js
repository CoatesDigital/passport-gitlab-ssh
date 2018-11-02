/**
 * Module dependencies.
 */
const Strategy = require('passport-strategy');
const util = require('util');
const jwt = require('jsonwebtoken');
const request = require('request');
const sshKeyToPem = require('ssh-key-to-pem');


function GitLabSshStrategy(options, verify) {
  options = options || {};
  this.name = 'gitlab-ssh'
  this._baseURL = options.baseURL || 'https://gitlab.com';
  Strategy.call(this);
}

util.inherits(GitLabSshStrategy, Strategy);

GitLabSshStrategy.prototype.authenticate = function (req, options) {

  if (!req.headers) return this.pass();
  if (!req.headers.authorization) return this.pass();
  const parts = req.headers.authorization.split(' ');
  if (parts.length !== 2) return this.pass();
  const scheme = parts[0];
  if (!/^Bearer$/i.test(scheme)) return this.pass();
  const token = parts[1];
  if (!token) return this.pass();

  const decodedToken = jwt.decode(token);
  // console.log('decodedToken: ', decodedToken);


  // check the token's issuer is for this strategy
  const issuer = 'gitlab-ssh';
  const gitlabHost = this._baseURL;

  if (!decodedToken) return this.pass();
  if (!decodedToken.iss) return this.pass();
  if (decodedToken.iss !== issuer) return this.pass();

  if (!decodedToken.username) return this.error('no gitlab username in token');


  // goto gitlab to get this person's pubkey
  const { username } = decodedToken;

  const keysUrl = `${gitlabHost}/${username}.keys`;
  // console.log('keysUrl: ', keysUrl);

  return request.get(keysUrl, (requestError, response, body) => {
      if (requestError) {
          console.log('requestError in response: ', requestError);
        return this.error(requestError);
      }
      // console.log('response.statusCode: ', response.statusCode);
      // console.log('body: ', body);

      // if gitlab had this user's pubkey, use it to verify the token
      const body_lines = body.split("\n");
      for (let line_index in body_lines) {
        const pem = sshKeyToPem(body_lines[line_index]);
        try {
          // if verified, assign the req.user object!
          const verifiedToken = jwt.verify(token, pem);
          // console.log('verifiedToken: ', verifiedToken);
          const user = {};
          user.username = verifiedToken.username;
          return this.success(user);

        } catch (jwtVerifyError) {
          // if the pubkey doesn't verify the signed token, error
          console.log('failed to verify: ' + jwtVerifyError);
          //return this.fail('jwt token did not validate');
        }
      }
      // If it gets out of the loop of keys without returning success, any key worked
      return this.fail('jwt token did not validate');
    })
    .on('error', (response) => {
      return this.error(response);
    });
}



// Thanks to passport-gitlab2 for a nice place to start
// https://github.com/fh1ch/passport-gitlab2/blob/master/lib/strategy.js

module.exports = GitLabSshStrategy;
