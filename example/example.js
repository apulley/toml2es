const rimraf = require('rimraf');
const glob = require('glob');
const buildModules = require('../src/toml2es');

rimraf('example/content', () => {
  glob('example/toml/*.toml', {
    nodir: true,
  }, function(err, files){
      console.log(files)
      buildModules(files, 'example/content', {complete: myFunction, tablesAsModules:['actions', 'page']});
  });
})

function myFunction(data){
  console.log('done');
  console.log(data);
}
