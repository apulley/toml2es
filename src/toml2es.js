const fs = require('fs');
const concat = require('concat-stream');
const toml = require('@iarna/toml');
const beautify = require('js-beautify').js;

/**
 * Parse toml files from array of paths and output into a directory. 
 *
 * @param {Array} tomlPaths
 * @param {String} directory
 * @param {tablesAsModules: Array, complete: Function} options
 */
module.exports = function buildModules(tomlPaths, directory, options){
  let { tablesAsModules = [], complete = null } = options;
  let allContent = {};
  const rxFileName = /([^\/]+)(?=\.\w+$)/;

  const writeToml = tomlPaths.map((path) => {
    return new Promise(function(resolve, reject){
      fs.createReadStream(path, 'utf8').pipe(concat( (data) => {
        // generate formatted content per toml file
        let content = beautify(
          `${JSON.stringify(toml.parse(data))}`,
          { end_with_newline: true, indent_size: 2, space_in_empty_paren: true}
        );
        let fileMatch = false;
        const fileName = path.match(rxFileName)[0];

        allContent[fileName] = JSON.parse(content);
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
              const tableContent = JSON.stringify(JSON.parse(content)[table]);
              
              fs.writeFile(
                `${directory}/${fileName}/${table}.js`, 
                `export default ${ beautify(tableContent,{ end_with_newline: true, indent_size: 2, space_in_empty_paren: true}) }`, 
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
    files.forEach( (jsModule) => {
      moduleExport += `export { default as ${(jsModule.length > 1) ? jsModule[0]+jsModule[1].charAt(0).toUpperCase() + jsModule[1].slice(1) : jsModule[0]} } from './${(jsModule.length > 1) ? jsModule[0] + '/' + jsModule[1] : jsModule[0]}.js'\n`;
    });
    fs.writeFile(
      `${directory}/index.js`, 
      moduleExport,
      {flag: 'w'}, 
      error => {
        complete && complete(allContent);
        if (error) {
          console.log('error');
        }
      }
    );
  });
}
