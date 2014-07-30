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
var endpoint = 'http://product-api.affili.net/V3/productservice.svc/JSON/SearchProducts';

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

Affilinet.prototype.one = function (one) {
  one = ('undefined' === typeof one) ? true : !!one;
  return this._one = one, this;
};

// Run query
Affilinet.prototype.done = function (cb) {
  request
    .get(endpoint)
    .query({publisherId: this._id})
    .query({Password: this._password})
    .query({query: this._keywords})
    .end(function (err, result) {
      if (err) return cb(err);

      // Hopefully we have a body
      var body = result.body;

      // Check for errors
      var err = body.ErrorMessages;
      if (err && err.length > 0) return cb(new Error(err[0].Value));

      return cb(null, body);
    });
};

var format = function (products) {
  return _.map(products, function (p) {
    return {
      id: p.ProductId,
      name: p.ProductName,
      currency: p.PriceInformation.Currency,
      listPrice: p.PriceInformation.PriceDetails.Price,
      url: p.Deeplink1
    };
  });
};

// Take care of affilinet byte ordering foolishness
request.parse['application/json'] = function (res, fn) {
  res.text = '';
  res.setEncoding('utf8');
  res.on('data', function (chunk) { res.text += chunk; });
  res.on('end', function () {
    try {
      res.text = res.text.slice(1);
      fn(null, JSON.parse(res.text));
    } catch (err) {
      fn(err);
    }
  });
};
