const fs = require('fs');
const rimraf = require('rimraf');
const path = require('path');
const concat = require('concat-stream');
const glob = require('glob');
const toml = require('@iarna/toml');
const beautify = require('js-beautify').js;

rimraf('content', () => {
  glob('toml/*.toml', {
    nodir: true,
  }, function(err, files){
      buildModules(files, 'content', {complete: myFunction, tablesAsModules:['actions', 'page']});
  });
})

/**
 * Parse toml files from array of paths and output into a directory. 
 *
 * @param {Array} tomlPaths
 * @param {String} directory
 * @param {tablesAsModules: Array, complete: Function} options
 */
function buildModules(tomlPaths, directory, options){
  let { tablesAsModules = [], complete = null } = options;
  const rxFileName = /([^\/]+)(?=\.\w+$)/;

  const writeToml = tomlPaths.map((path) => {
    return new Promise(function(resolve, reject){
      fs.createReadStream(path, 'utf8').pipe(concat( (data) => {
        // generate formatted content per toml file
        let content = beautify(
          `${JSON.stringify(toml.parse(data))}`,
          { end_with_newline: true, indent_size: 2, space_in_empty_paren: true}
        );
        let tableModule = {};
        let fileMatch = false;
        const fileName = path.match(rxFileName)[0];

        // see if the toml file requires additional modules
        if(tablesAsModules.length){
          fileMatch = tablesAsModules.some((table) => table.toLowerCase() === fileName.toLowerCase());
        }

        if (!fs.existsSync(directory)){
          fs.mkdirSync(directory);
        }

        if (fileMatch){
          fs.mkdirSync(`${directory}/${fileName}`);
        }

        if(fileMatch){
          const writeTomlTable = Object.keys(JSON.parse(content)).map((table) => {
            return new Promise(function(resolve, reject){
              const tableContent = beautify(`${JSON.stringify( JSON.parse(content)[table] )}`,{ end_with_newline: true, indent_size: 2, space_in_empty_paren: true});
              fs.writeFile(
                `${directory}/${fileName}/${table}.js`, 
                `export default ${tableContent}`, 
                {flag: 'w'}, 
                error => { 
                  if (error) {
                    reject(error);
                  }
                  resolve([fileName, table]);
                }
              );
            });
          });
          Promise.all(writeTomlTable).then((arr) => {
            resolve(arr);
          });
        } else{
          fs.writeFile(
            `${directory}/${fileName}.js`, 
            `export default ${content}`, 
            {flag: 'w'}, 
            error => { 
              if (error) {
                reject(error);
              }
              resolve([fileName]);
            }
          );
        }
      }));
    });
  });
  Promise.all(writeToml).then((arr) => {
    let moduleExport = '';
    let files = [];

    arr.forEach((file)=>{
      if(Array.isArray(file[0])){
        file.forEach((tableFile)=>{files.push(tableFile)});
      } else{
        files.push(file);
      }
    });
    //console.log(files)
    files.forEach( (jsModule) => {
      moduleExport += `export { default as ${(jsModule.length > 1) ? jsModule[0]+jsModule[1].charAt(0).toUpperCase() + jsModule[1].slice(1) : jsModule[0]} } from './${(jsModule.length > 1) ? jsModule[0] + '/' + jsModule[1] : jsModule[0]}.js'\n`;
    });
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
  });
}

function myFunction(data){
  console.log('done');
}
