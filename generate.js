#! /usr/bin/env node

const fs = require('fs');
const Log = require('debug')('main');

const CSVFILE = "out.csv";
const JSONFILE = "out.json";
const KMLFILE = "out.kml";

let oldjson = null;
try {
  oldjson = JSON.parse(fs.readFileSync(JSONFILE, { encoding: 'utf8' }));
}
catch (e) {
  Log(e);
}

require("./updateNodes2").update(oldjson).then(update => {

  require("./writeCSV").write(update, CSVFILE);
  require("./writeKML").write(update, KMLFILE);
  require("./writeJSON").write(update, JSONFILE);
  
  process.exit();

});
