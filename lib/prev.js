var fs = require('fs')
var path = require('path')
module.exports = findPrevious

function findPrevious(dir,seq,cb){
  fs.readdir(dir,function(err,files){
    if(err){
      if(err.code !== 'ENOENT') return cb(err)
      files = []
    }

    var changes = {}
    files.forEach(function(f){
      if(f.indexOf('-seq.json') === -1) return
      k = f.split('-seq').shift()
      if(k < seq) changes[k] = f
    })

    var sorted = Object.keys(changes).sort(function(s1,s2){
      return s1>s2?1:s2<s1?-1:0
    })

    var exists = files.indexOf(seq+'-seq.json') > -1

    if(sorted.length){

      var currentFile = sorted.pop()

      var prevFiles = []
      sorted.forEach(function(k){
        prevFiles.push(path.join(dir,changes[k]))
      })

      return fs.readFile(path.join(dir,changes[currentFile]),function(err,data){
        if(err) cb(err)
        else cb(false,json(data),{
          exists: exists,
          files: prevFiles
        })
      })
    }
    
    cb(false,false,{exists:exists,files:[]})
  })
}

function json(b){
  try{ return JSON.parse(b) } catch(e) {}
}
