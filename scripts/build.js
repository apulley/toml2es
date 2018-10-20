const fs = require('fs-extra');
const path = require('path');
const concat = require('concat-stream');
const glob = require('glob');
const toml = require('@iarna/toml');
const beautify = require('js-beautify').js;

glob('toml/*.toml', {
  nodir: true,
}, function(err, files){
    buildModules(files, {directory: 'content', complete: myFunction, tablesAsModules:['page']});
});

/**
 * Parse toml files from array of paths and output into a directory. 
 *
 * @param {Array} tomlPaths
 * @param {directory: String, tablesAsModules: Array, complete: Function} options
 */
function buildModules(tomlPaths, options){
  let { directory = null, tablesAsModules = [], complete = null } = options;
  const rxFileName = /([^\/]+)(?=\.\w+$)/;
  let files = [];

  const actions = tomlPaths.map(path => {
    return new Promise(function(resolve, reject){
      fs.createReadStream(path, 'utf8').pipe(concat( data => {
        let content = beautify(
          `${JSON.stringify(toml.parse(data))}`,
          { end_with_newline: true, indent_size: 2, space_in_empty_paren: true}
        );
        let tableModule = {};
        let fileMatch = false;
        const fileName = path.match(rxFileName)[0];

        //console.log(content);
        //console.log(fileName);
        if(tablesAsModules.length){
          fileMatch = tablesAsModules.some((table) => table.toLowerCase() === fileName.toLowerCase());
        }

        console.log(fileMatch, fileName);
        
        if (!fs.existsSync(directory)){
          fs.mkdirSync(directory);
        }

        //fs.emptyDirSync(directory)

        if (fileMatch && !fs.existsSync(`${directory}/${fileName}`)){
          fs.mkdirSync( `${directory}/${fileName}`);
          console.log(content)
        }

        fs.writeFile(
          fileMatch ? `${directory}/${fileName}.js` : `${directory}/${fileName}.js`, 
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
      `${directory}/index.js`, 
      moduleExport,
      {flag: 'w'}, 
      error => {
        if (error) {
          console.log('error');
        }
      }
    );
    fs.writeFile(
      `${directory}/content.json`, 
      json, 
      {flag: 'w'}, 
      error => {
        if(complete){
          complete(jsonObj)
        }
        if (error) {
          console.log('error');
        }
      }
    );

  });
}

function myFunction(data){
  console.log('done');
}
