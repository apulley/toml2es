const fs = require('fs');
const rimraf = require('rimraf');
const concat = require('concat-stream');
const glob = require('glob');
const toml = require('@iarna/toml');
const beautify = require('js-beautify').js;
const buildModules = require('../src/toml2es');

rimraf('content', () => {
  glob('toml/*.toml', {
    nodir: true,
  }, function(err, files){
      buildModules(files, 'content', {complete: myFunction, tablesAsModules:['actions', 'page']});
  });
})

function myFunction(data){
  console.log('done');
  console.log(data);
}

function replaceKeys (){
  
}