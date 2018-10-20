const fs = require('fs');
const path = require('path');
const concat = require('concat-stream');
const glob = require('glob');
const toml = require('@iarna/toml');
const beautify = require('js-beautify').js;

const rxFileName = /([^\/]+)(?=\.\w+$)/;
let contentJson = {};
let localization = [];

//console.log(process.argv[2]);

function getFiles(prefix = true){
  glob('toml/*.toml', {
    nodir: true,
  }, function(err, files){
      //console.log(files)
      if(prefix){
        let parsedFiles = files.filter( str => { 
          let parts = str.split('/');
          if(parts[parts.length-1].match(/^(.*)(_.*?)$/) && localization.indexOf(parts[parts.length-1].match(/^(.*)(_.*?)$/)[1]) === -1){
            localization.push(parts[parts.length-1].match(/^(.*)(_.*?)$/)[1]);
          }
          return parts[parts.length-1].match(/^(.*)(_.*?)$/) ? false : true;
        });
      }
      console.log(parsedFiles)
      console.log(localization)
      //buildModules(files.filter(str => {str.match(/^(.*)(_.*?)$/)[1]}), 'content',  myFunction);
  });
}

// TODO: Object.keys of the master file, then compare Object.keys of the prefixed files. add them in the js/object/json then turn it into TOML 

// /**
//  * Parse toml files from array of paths and output into a directory. 
//  *
//  * @param {Array} tomlPaths
//  * @param {String} dir
//  * @param {Function} callback
//  */
// function buildModules(tomlPaths, dir, callback){
//   let files = [];
//   const actions = tomlPaths.map(path => {
//     return new Promise(function(resolve, reject){
//       fs.createReadStream(path, 'utf8').pipe(concat( data => {
//         let content = beautify(
//           `${JSON.stringify(toml.parse(data))}`,
//           { end_with_newline: true, indent_size: 2, space_in_empty_paren: true}
//         );
//         const fileName = path.match(rxFileName)[0];
//         if (!fs.existsSync(dir)){
//           fs.mkdirSync(dir);
//         }
//         fs.writeFile(
//           `${dir}/${fileName}.js`, 
//           `export default ${content}`, 
//           {flag: 'w'}, 
//           error => { 
//             if (error) {
//               reject(error);
//             }
//             resolve();
//           }
//         );
//         files.push({content, fileName});
//       }));
//     });
//   });
//   Promise.all(actions).then(() => {
//     let jsonObj = {};
//     let json = '';
//     let moduleExport = '';
    
//     files.forEach( jsModule => {
//       moduleExport += `export { default as ${jsModule.fileName} } from './${jsModule.fileName}.js'\n`;
//       jsonObj[jsModule.fileName] = JSON.parse(jsModule.content);
//     });
//     json = beautify(
//       JSON.stringify(jsonObj),
//       { end_with_newline: true, indent_size: 2, space_in_empty_paren: true}
//     );
//     fs.writeFile(
//       `${dir}/index.js`, 
//       moduleExport,
//       {flag: 'w'}, 
//       error => {
//         if (error) {
//           console.log('error');
//         }
//       }
//     );
//     fs.writeFile(
//       `${dir}/content.json`, 
//       json, 
//       {flag: 'w'}, 
//       error => {
//         callback(jsonObj);
//         if (error) {
//           console.log('error');
//         }
//       }
//     );

//   });
// }

function myFunction(data){
  console.log('done', data);
}
