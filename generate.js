#! /usr/bin/env node

const fs = require('fs');
const Log = require('debug')('main');

const CSVFILE = "out.csv";
const JSONFILE = "out.json";
const KMLFILE = "out.kml";
const JSFILE = "out.js";

process.on('uncaughtException', () => process.exit(1));
process.on('unhandledRejection', () => process.exit(1));

let oldjson = null;
try {
  oldjson = JSON.parse(fs.readFileSync(JSONFILE, { encoding: 'utf8' }));
}
catch (e) {
  Log(e);
}

require("./updateNodes").update(oldjson).then(update => {
  try {
    require("./writeCSV").write(update, CSVFILE);
    require("./writeKML").write(update, KMLFILE);
    require("./writeJSON").write(update, JSONFILE);
    require("./writeJS").write(update, JSFILE);
  }
  catch (e) {
    Log(e);
  }
  process.exit(1);
}).catch(e => {
  Log(e);
  process.exit(1);
});
