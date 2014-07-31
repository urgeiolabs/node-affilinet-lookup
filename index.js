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

Affilinet.prototype.shop = function (shop) {
  // Init shops
  if (this._shops) this._shops = [];
  // Accept array of shops
  if (_.isArray(shop)) this._shops = shop;
  // Accept a single string shop
  if (_.isString(shop)) this._shops.push(shop);

  return this;
};

// Page
Affilinet.prototype.page = function (page) {
  if (!page) return this;
  return this._page = page, this;
};

// Limit to one result
Affilinet.prototype.one = function (one) {
  one = ('undefined' === typeof one) ? true : !!one;
  return this._one = one, this;
};

// Limit to <limit> results
Affilinet.prototype.limit = function (limit) {
  if (!limit) return this;
  return this._limit = limit, this;
};

// Sort
var sorts = [
  { name: 'score', affName: 'Score' },
  { name: 'price', affName: 'Price' },
  { name: 'name' , affName: 'ProductName' },
  { name: 'date', affName: 'LastImported' }
];
Affilinet.prototype.sort = function (sort) {
  // Ignore falsy
  if (!sort) return this;

  // Check for order
  var asc;

  // -score
  if (sort[0] === '-') {
    asc = false;
    sort = sort.slice(1);
  // +score
  } else if (sort[0] === '+') {
    asc = true;
    sort = sort.slice(1);
  // score
  } else {
    asc = true;
  }

  // Lookup sort criteria name
  var name = _.find(sorts, function (x) {
    return x.name === sort;
  });

  // Choke if invalid
  if (!name) throw new Error('Invalid sorting criteria');

  // Set appropriate settings
  this._sortOrder = asc ? 'ascending' : 'descending';
  this._sortBy = name.affName;

  return this;
};

// Run query
Affilinet.prototype.done = function (cb) {
  request
    .get(endpoint)
    .query({publisherId: this._id})
    .query({Password: this._password})
    .query({query: this._keywords})
    .query({MinimumPrice: this._minPrice})
    .query({MaximumPrice: this._maxPrice})
    .query({PageSize: this._one ? 1 : this._limit})
    .query({ShopIds: this._shops && this._shops.join(',')})
    .query({SortBy: this._sortBy})
    .query({SortOrder: this._sortOrder})
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
  res
  .on('data', function (chunk) {
    res.text = !res.text ? chunk : Buffer.concat([res.text, chunk]);
  })
  .on('end', function () {
    var text = res.text;

    // Trim out byte order crap if necessary
    if (text[0] === 0xEF) text = text.slice(3);

    try {
      fn(null, JSON.parse(text.toString()));
    } catch (err) {
      fn(err);
    }
  });
};
