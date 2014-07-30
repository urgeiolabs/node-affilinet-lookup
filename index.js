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

// Price range
Affilinet.prototype.price = function (price) {
  price = ('string' === typeof price) ? price.split('..') : price;

  if (price[0]) this._minPrice = price[0];
  if (price[1]) this._maxPrice = price[1];

  return this;
};

// Limit to one result
Affilinet.prototype.one = function (one) {
  one = ('undefined' === typeof one) ? true : !!one;
  return this._one = one, this;
};

Affilinet.prototype.limit = function (limit) {
  // Disregard falsy limits, they don't make any sense
  if (!limit) return this;
  return this._limit = limit, this;
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

      // Check if there's products present
      if (!body.Products) body.Products = [];

      // Format products
      var formatted = format(body.Products);

      // One
      if (this._one) {
        formatted = _.first(formatted) || null;
      }

      // Limit
      if (this._limit) {
        formatted = _.first(formatted, this._limit);
      }

      return cb(null, formatted);
    }.bind(this));
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
