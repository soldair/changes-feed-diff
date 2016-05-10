
var prev = require('./lib/prev')
var diff = require('./lib/diff')
var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')

// only one concurrent change in progress per _id

module.exports = function(options){

  var processing = {}
  var dir = options.dir
  var keepVersions = options.versions || 5

  return processChange

  function processChange(change,cb,q){
    if(!change || ! change.seq || !change.doc) return setImmediate(function(){
      cb(new Error('not a valid change.'))
    })

    // avoid keys that colide with object builtins
    var pkey = '|'+change.id
    if(processing[pkey]) {
      return processing[pkey].push([dir,change,cb])
    }

    if(Array.isArray(q)) {
      // should never happen. unless cb is moved inside _cb
      if(processing[change.id].length) processing[change.id].push.apply(processing[change.id],q)
      else processing[change.id] = cb
    } else processing[pkey] = []
    
    var _cb = function(err,data){
      var queue = processing[pkey]
      // have to unroll the whole queue serially
      delete processing[pkey]
      var next = queue.shift()
      if(next) {
        processChange(next[0],next[1],next[2],queue)
      }

      // cb has to be last because we dont push.apply on the quque to merge.
      cb(err,data)
    }

    var name = change.id

    var mdir = path.join(dir,name[0],name)
    // if there is no previous try and make the dir.
    prev(mdir,change.seq,function(err,previous,meta) {
      if(err) return _cb(err)

      var report = []
      if(previous) diff(change.doc,previous,report)

      // make dir if it may not exist.
      if(!previous && !meta.exists) return mkdirp(mdir,function(err) {
        if(err) return _cb(err)
        save()
      })

      save()

      function save() {
        if(meta.exists) _cb(err,report)
        else fs.writeFile(path.join(mdir,change.seq+'-seq.json'),JSON.stringify(change.doc),function(err,data){
          if(meta.files && meta.files.length > keepVersions) {
            // clean files while we have the lock to prevent stacking and racey weirdness
            rmfiles(meta.files.slice(0,keepVersions),function(e){
              if(e) console.error('warning: failed to rm files '+e);
              _cb(err,report) 
            })
          } else _cb(err,report)
        })
      }
    })
  }
}

