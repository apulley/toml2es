const fs = require('fs');
const path = require('path');
const concat = require('concat-stream');
const glob = require('glob');
const toml = require('toml');
const beautify = require('js-beautify').js;

const rxFileName = /([^\/]+)(?=\.\w+$)/;
let contentJson = {};

glob('toml/*.toml', {
  nodir: true,
}, function(err, files){
    buildModules(files, 'content',  myFunction);
});

function buildModules(tomlPaths, dir, callback){
  let files = [];
  var actions = tomlPaths.map(path => {
    return new Promise(function(resolve, reject){
      fs.createReadStream(path, 'utf8').pipe(concat( data => {
        let content = beautify(
          `${JSON.stringify(toml.parse(data))}`,
          { end_with_newline: true, indent_size: 2, space_in_empty_paren: true}
        );
        const fileName = path.match(rxFileName)[0];

        fs.writeFile(
          `${dir}/${fileName}.js`, 
          `export default ${content}`, 
          {flag: 'w'}, 
          error => { 
            if (error) {
              reject(error);
            }
            resolve();
          }
        );
        files.push({content, fileName});
      }));
    });
  });
  Promise.all(actions).then(() => {
    let jsonObj = {};
    let json = '';
    let moduleExport = '';
    files.forEach( jsModule => {
      moduleExport += `export { default as ${jsModule.fileName} } from './${jsModule.fileName}.js'\n`;
      jsonObj[jsModule.fileName] = JSON.parse(jsModule.content);
    });
    json = beautify(
      JSON.stringify(jsonObj),
      { end_with_newline: true, indent_size: 2, space_in_empty_paren: true}
    );
    fs.writeFile(
      `${dir}/index.js`, 
      moduleExport,
      {flag: 'w'}, 
      error => {
        if (error) {
          console.log('error');
        }
      }
    );
    fs.writeFile(
      `${dir}/content.json`, 
      json, 
      {flag: 'w'}, 
      error => {
        callback(jsonObj);
        if (error) {
          console.log('error');
        }
      }
    );

  });
}

function myFunction(data){
  console.log(data);
}
 