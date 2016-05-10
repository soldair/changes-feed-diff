# changes-feed-diff
generate diffs of changes to documents from a couch style changes feeds

```js

var doc1 = {seq:1,id:"alice",doc:{name:"alice",inc:1}}
var doc2 = {seq:2,id:"alice",doc:{name:"alice",inc:1}}

var makeDiffer = require('change-feed-diff')
var differ = makeDiffer({
  dir:'./data'
})

differ(doc1,function(err,diff){
  if(err) throw err

  console.log('diff for doc 1:',diff)

  differ(doc2,function(err,diff){
    if(err) throw err

    console.log('diff for doc 2:',diff)
  })
})

```

this will print

```
 diff for doc 1: []
 diff for doc 2: [ { path: [ 'inc' ],
    reason: 'values are not equal',
    value: { a: 2, b: 1 },
    code: 'VNEQUAL' } ]
```

this stores the previous version on disk inside the data directory. we keep a number of versions so if your process crashes and the database does compaction these are as consistent as they can be.

```
$ tree data
data
└── a
    └── alice
        ├── 1-seq.json
        └── 2-seq.json

2 directories, 2 files
```

you can run [example.js](./example.js) to do this on the npm changes feed


## api

- makeDiffer = require('changes-feed-diff')
- differ = makeDiffer(options)
  - options.dir
    - required. this is the place where we store old versions.
  - options.versions
    - optional. default 5. how many old versions to keep around before deleting them.

### diff format
```

[
  {

    path:[array, of, keys, to, dereference, the, value],
    reason:'a text reason',
    values:{a:'new',b:'old'}, 
    // the values compared to determine the result. 
    //in most vases this is not the value of the key but the values used to validate the assertion
    code: a code that represents comparison type. listed below
  }
]

```
if there are not changes the diff is an empty array `[]`


### diff codes

these are string constants that represent kinds of changes.
these are the kinds of changes that you will see. the reason string may change but this value will not without a major bump.


- ANARRAY
  - the "b" side is not an array
- ALESS
  - the "b" side has fewer items
- AMORE
  - the "b" side has more items
- ONEW
  - a new object is in "a" that is not in "b"
- OMORE
  - object has more items than "b"
- OLESS
  - object has fewer items than "b"
- VFALSEY
  - the "b" value is falsey but its not the same false as "a"
- VNEQUAL
  - value does not equal value at "b"


## fun facts

this only allows one concurrent diff per document id. this prevents a race condition where 2 versions of the same document are compared at the same time yeilding an incorrect diff for the later version.
