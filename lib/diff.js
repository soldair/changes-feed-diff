
module.exports = diff

function diff(o,o2,report,fragment){
  fragment = fragment||[]
  if(!report) throw new TypeError("missing report! must be an array.")
 
  if(Array.isArray(o)) {
    
    // check length
    if(!Array.isArray(o2)){
      report.push({path:fragment,reason:'the other side is not an array',code:'ANARRAY'})
    } else {

      if(o.length != o2.length){
        if(o.length < o2.length){
          report.push({path:fragment,reason:'array has fewer items.',values:{a:o.length,b:o2.length},code:'ALESS'})
        } else {
          report.push({path:fragment,reason:'array has more items.',values:{a:o.length,b:o2.length},code:'AMORE'})
        }
      }

      //? if i have a length error every item could be off by one
      //? i check that each item is anywhere in the array then if the array is sorted
      //? check each item
    
      // assumed sort will generate a bunch of errors on length mismatch
      for(var i=0; i < o.length;++i){ 
        diff(o[i],o2[i],report,fkey(fragment,i))  
      }
    }
  } else if(!o) {
    if(o !== o2) {
      report.push({path:fragment,reason:'falsey value is not equal ',values:{a:o,b:o2},code:'VFALSEY'})
    }
  } else if(typeof o === 'object') {
    
    if(!o2) {
      // missing object for o2 value 
      // i do not include the a side object because that would bloat logs.
      report.push({path:fragment,reason:'object missing on other side.',values:{a:o},code:'ONEW'})

    } else {

      var keys = Object.keys(o);
      var keys2 = Object.keys(o2) 

      if(keys.length < keys2.length) {
        report.push({path:fragment,reason:'object has more items. ',values:{a:keys.length,b:keys2.length},code:'OMORE'})
      } else if(keys.length < keys.length) {
        report.push({path:fragment,reason:'object has fewer items.',values:{a:keys.length,b:keys2.length},code:'OLESS'})
      }

      // key length check

      for(var i=0;i<keys.length;++i){ 
        diff(o[keys[i]],o2[keys[i]],report,fkey(fragment,keys[i]))
      }
    }

  } else {
    // plain value
    if(o != o2) {
      report.push({path:fragment,reason:'values are not equal',value:{a:o,b:o2},code:'VNEQUAL'})
    }
  }
}

function fkey(f,v){
  var n = f.slice.apply(f)
  n.push(v)
  return n
}
