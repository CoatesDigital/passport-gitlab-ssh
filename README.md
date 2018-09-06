# passport-gitlab-ssh

[![npm version](https://badge.fury.io/js/passport-gitlab-ssh.svg)](http://badge.fury.io/js/passport-gitlab-ssh)
[![Build Status](https://travis-ci.org/CoatesDigital/passport-gitlab-ssh.svg?branch=master&style=flat)](https://travis-ci.org/CoatesDigital/passport-gitlab-ssh)
[![Coverage Status](https://coveralls.io/repos/CoatesDigital/passport-gitlab-ssh/badge.svg?branch=master)](https://coveralls.io/r/CoatesDigital/passport-gitlab-ssh?branch=master)
[![Code Climate](https://codeclimate.com/github/CoatesDigital/passport-gitlab-ssh/badges/gpa.svg)](https://codeclimate.com/github/CoatesDigital/passport-gitlab-ssh)
[![Dependency Status](https://david-dm.org/CoatesDigital/passport-gitlab-ssh.svg?theme=shields.io)](https://david-dm.org/CoatesDigital/passport-gitlab-ssh)

[Passport](http://passportjs.org/) strategy for authenticating with SSH keys and gitlab's public user keys used via JWT to authenticate requests.

This module lets you authenticate using GitLab in your Node.js applications.
By plugging into Passport, GitLab authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

```bash
$ npm install passport-gitlab-ssh
```

## How it Works

Say you've got SSH access to gitlab, eg, you can run `ssh git@gitlab.com` and it will respond with my user ID.
And you'd like to be able to make a HTTPS request to your-server.com, passing some secret from gitlab.com, so your server knows you're trusted.

This middleware allows you to validate requests signed using your private key.

The example client (docs/example-client.js) will:

- ssh into gitlab to discover the username
- generate a JWT claiming which user I am
- sign the JWT using my private key

And this server middleware will:

- recieve the request claiming which user it was
- get the user's pubkey from gitlab.com/users/myuser.key
- verifies the JWT was signed by that user's private key, using the pubkey provided by gitlab


#### Configure Strategy


```js
passport.use(new GitLabSshStrategy({},
  function(user, done) {
    done(user);
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'gitlab-ssh'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.get('/secure', passport.authenticate('gitlab-ssh'));
```

## FAQ

##### How do I use my own GitLab instance rather than gitlab.com?

Passport-GitLab automatically uses [GitLab.com](http://gitlab.com/) as
authentication endpoint when not configured otherwise. You can use the `baseURL`
parameter to point to any other GitLab instance as following:

```js
new GitLabSshStrategy({
  baseURL: "https://gitlab.example.com/"
}), ...)
```


## License

[The MIT License](http://opensource.org/licenses/MIT)
