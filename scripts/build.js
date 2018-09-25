const fs = require('fs');
const path = require('path');
const concat = require('concat-stream');
const toml = require('toml');

fs.createReadStream('content/page.toml', 'utf8').pipe(concat(function(data) {
  var parsed = toml.parse(data);
  console.log(parsed)
}));