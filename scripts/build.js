const fs = require('fs');
const path = require('path');
const concat = require('concat-stream');
const toml = require('toml');

fs.createReadStream('toml/page.toml', 'utf8').pipe(concat(function(data) {
  let parsed = toml.parse(data);
  let content = JSON.stringify(parsed);
  fs.writeFile(`content/index.js`, content, {flag: 'w'}, function (error){ 
    if (error) return console.log(error);
  })
  console.log(content)
}));