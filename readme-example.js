var doc1 = {seq:1,id:"alice",doc:{name:"alice",inc:1}}
var doc2 = {seq:2,id:"alice",doc:{name:"alice",inc:2}}

var makeDiffer = require('./')
var differ = makeDiffer({dir:'./data'})

differ(doc1, function(err,diff){
  if(err) throw err

  console.log(1,diff)

  differ(doc2, function(err,diff){
    if(err) throw err

    console.log(2,diff)
  })
})


