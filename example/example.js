const rimraf = require('rimraf');
const glob = require('glob');
const buildModules = require('toml2es');

rimraf('./content', () => {
  glob('./toml/*.toml', {
    nodir: true,
  }, function(err, files){
      console.log(files)
      buildModules(files, './content', {complete: myFunction, tablesAsModules:['actions', 'page']});
  });
})

function myFunction(data){
  console.log('done');
  console.log(data);
}
