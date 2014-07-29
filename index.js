/**
 * Module dependencies
 */
var request = require('superagent')
  , _ = require('underscore');

// Factory
module.exports = function (opts) {
  return new Affilinet(opts);
};

// Api endpoint
var endpoint = 'http://api.affili.net/V3/productservice.svc/JSON/SearchProducts';

var Affilinet = function Affilinet (opts) {
  opts = ('string' === typeof opts) ? { keywords: opts } : opts;

  if (opts.keywords) {
    this._keywords = opts.keywords;
    this.mode = 'search';
  }
};

// Publisher identifier
Affilinet.prototype.id = function (id) {
  return this._id = id, this;
};

// Affilinet api password, or key I guess
Affilinet.prototype.password = Affilinet.prototype.key = function (password) {
  return this._password = password, this;
};

Affilinet.prototype.done = function (cb) {
  request
    .get(endpoint)
    .query({publisherId: this._id})
    .query({Password: this._password})
    .done(function (err, result) {
      if (err) return cb(err);
      return cb(null, result.body);
    });
};
