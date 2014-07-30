#!/usr/bin/env node

/**
 * Module dependencies
 */
var affilinet = require('./')
  , nomnom = require('nomnom');

var opts = nomnom
  .script('affilinet')
  .nocolors()
  .option('id', {
    abbr: 'i',
    required: true,
    help: 'Affilinet publisher id'
  })
  .option('key', {
    abbr: 'k',
    required: true,
    help: 'Affilinet api key'
  })
  .option('keywords', {
    abbr: 'q',
    required: true,
    help: 'Keywords to query with'
  })
  .option('one', {
    abbr: '1',
    help: 'Take the first result',
    default: false,
    flag: true
  })
  .option('limit', {
    abbr: 'l',
    help: 'Limit number of results'
  })
  .option('page', {
    abbr: 'p',
    help: 'Choose results page',
    default: 1
  })
  .option('shops', {
    abbr: 's',
    help: 'Shop ids',
    type: 'string',
    transform: function (s) {
      return s.split(',');
    }
  })
  .parse();

affilinet({keywords: opts.keywords})
  .id(opts.id)
  .key(opts.key)
  .one(opts.one)
  .limit(opts.limit)
  .page(opts.page)
  .shop(opts.shops)
  .done(function (err, res) {
    if (err) throw err;
    console.log(JSON.stringify(res));
  });
