var fs = require('fs')

module.exports = function(files,cb){
  if(!files.length) return setImmediate(function(){
    cb()
  })

  var c = files.length
  var err;
  while(files.length) fs.unlink(files.shift(),function(e){
    if(e) err = e
    if(!--c) cb(err)
  })
}
