var inject = require('require-inject')
var test = require('tape')

var readdirs = []
var readFiles = {}


var prev = inject('../lib/prev.js',{
  "fs":{
    readdir:function(dir,cb){
      return setImmediate(function(){
        if(!readdirs.length) throw new Error("mocked readdir has no more responses")
        var args = readdirs.shift()
        cb(args[0],args[1])
      })
    },
    readFile:function(file,cb){
      return setImmediate(function(){
        var e;
        if(!readFiles[file]) {
          e = new Error('ENOENT')
          e.code = 'ENOENT'
        }

        cb(e,readFiles[file])
      })     
    }
  }
})


test("can get previous version",function(t){
  readdirs.push([false,['a','1-seq.json','2-seq.json','3-seq.json','4-seq.json','sequence','.']])
  readFiles['/a/path/2-seq.json'] = new Buffer('{"a":"foo"}')
  prev('/a/path','3',function(err,data,meta){
    t.equals(readdirs.length,0,'should have used all the mock responses')
    // data is the document?
    // or just the previous filename.

    t.equals(data.a,'foo','should have doc where a is foo')

    t.ok(meta.exists,'should exist')
    t.equals(meta.files.length,1,'should only have 1 file less than 2')
    t.equals(meta.files[0],'/a/path/1-seq.json','should be correct path')

    t.end()
  })
})
