
var dir = __dirname+'/data'

var normalize = require('normalize-registry-metadata')
var ccf = require('concurrent-couch-follower')
var differ = require('./')

var fs = require('fs')
var ws = fs.createWriteStream(__dirname+'/example.log',{flags:'a+'})

ccf(function(change,done){

  change.doc = normalize(change.doc) 
  if(!change.doc) return done()

  differ(dir, change, function(err, report) {
    if(err) throw err;
    var oreport = {name:change.doc.name,sequence:change.sequence,diff:report}
    var report = JSON.stringify(oreport)
    
    console.log(JSON.stringify(oreport,null,'  '))
    ws.write(report+'\n')

    done()
  })

},{
  db:'https://skimdb.npmjs.com/registry',
  include_docs:true,
  sequence:'.example-sequence',
  include_docs:true,
  concurrency:5
})





