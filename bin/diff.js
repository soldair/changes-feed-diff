#!/usr/bin/env node
var fs = require('fs')

var a = JSON.parse(fs.readFileSync(process.argv[2]))
var b = JSON.parse(fs.readFileSync(process.argv[3]))

var diff = require('../lib/diff')

var report = []
diff(a,b,report)

console.log(JSON.stringify(report))//,null,'  '))
