
var prev = require('./lib/prev')
var diff = require('./lib/diff')
var rmfiles = require('./lib/rmfiles')
var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var writeFile = require('write-file-atomic')
// only one concurrent change in progress per _id

module.exports = function(options){

  var processing = {}
  var dir = options.dir
  var keepVersions = options.versions || 5
  // nest the data inside /a/apple[?/nest directory]/[change files like 1-seq.json]
  var nestDirectory = options.nestDirectory

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
    
    var _cb = function(err,data,prev){
      var queue = processing[pkey]
      // have to unroll the whole queue serially
      delete processing[pkey]
      var next = queue.shift()
      if(next) {
        processChange(next[0],next[1],next[2],queue)
      }

      // cb has to be last because we dont push.apply on the quque to merge.
      cb(err,data,prev)
    }

    var name = change.id

    var mdir = path.join(dir,name[0],name)
    if(nestDirectory) mdir = path.join(mdir,nestDirectory)
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
        if(meta.exists || change.test) _cb(err,report,previous)
        else writeFile(path.join(mdir,change.seq+'-seq.json'),JSON.stringify(change.doc),function(err,data){
          if(meta.files && meta.files.length > keepVersions) {
            // clean files while we have the lock to prevent stacking and racey weirdness
            var cull = meta.files.length-keepVersions
            // 6 files
            // 3 keep versions
            // 3 cull versions
            // oldest -> newest
            // [x,x,x][o,o,o]
            rmfiles(meta.files.slice(0,cull),function(e){
              if(e) console.error('warning: failed to rm files '+e);
              _cb(err,report,previous) 
            })
          } else _cb(err,report,previous)
        })
      }
    })
  }
}


module.exports.diff = function(a,b){
  var report = []
  diff(a||{},b||{},report)
  return report
}
