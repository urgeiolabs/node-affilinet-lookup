# affilinet-lookup

## Introduction

This module is a simple wrapper around the affilinet product search api.

## Installation

    npm install affilinet-lookup

## Usage

    affilinet-lookup -i <publisher id> -p <api password> -k <search keywords>

See affilinet-lookup --help for more information

## Examples

Basic:

```javascript
var affilinet = require('affilinet-lookup');

affilinet({keywords: 'test'})
  .id('publisher id')
  .key('publisher password')
  .done(function (err, result) { ... })
```

Limit to certain shops:

```javascript
var affilinet = require('affilinet-lookup');

affilinet({keywords: 'test'})
  .id('publisher id')
  .key('publisher password')
  .shop('445') // T-mobile
  .shop('112') 
  .done(function (err, result) { ... })
```

Limit number of results:

```javascript
var affilinet = require('affilinet-lookup');

affilinet({keywords: 'test'})
  .id('publisher id')
  .key('publisher password')
  .limit(5)
  .done(function (err, result) { ... }) // result.length === 5
```

"findOne":

```javascript
var affilinet = require('affilinet-lookup');

affilinet({keywords: 'test'})
  .id('publisher id')
  .key('publisher password')
  .one()
  .done(function (err, result) { ... }) // result === null || typeof result === 'object' 
```

Change sorting order:

```javascript
var affilinet = require('affilinet-lookup');

affilinet({keywords: 'test'})
  .id('publisher id')
  .key('publisher password')
  .sort('-price') // Descending price
  .done(function (err, result) { ... })
```

## Dependencies

* [superagent](http://github.com/visionmedia/superagent)
* [underscore](http://github.com/jashkenas/underscore)
* [nomnom](http://github.com/harthur/nomnom)

## License

MIT
