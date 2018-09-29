const fs = require('fs');
const path = require('path');
const concat = require('concat-stream');
const glob = require('glob');
const toml = require('toml');
const beautify = require('js-beautify').js;

const rxFileName = /([^\/]+)(?=\.\w+$)/;

glob('toml/*.toml', {
  nodir: true,
}, function(err, files){
  files.forEach(function(path){
    buildModules(path);
  });
});

function buildModules(tomlPath){
  fs.createReadStream(tomlPath, 'utf8').pipe(concat( function(data) {
    let content = beautify(
      `export default ${JSON.stringify(toml.parse(data))}`,
      { end_with_newline: true, indent_size: 2, space_in_empty_paren: true});

    fs.writeFile(
      `content/${tomlPath.match(rxFileName)[0]}.js`, 
      content, 
      {flag: 'w'}, 
      function (error){ 
        if (error) return console.log(error);
      }
    );
  }));
}

 