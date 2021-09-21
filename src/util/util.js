const fs = require('fs');
const path = require('path');
const { config } = require('../util/config');

function readSrcFile(file) {
  const res = fs.readFileSync(path.resolve(__dirname, '../../src/', file), 'utf-8');
  return res;
}

function dump(file, data) {
  if (config.devMode()) {
    fs.writeFileSync(path.resolve(__dirname, '../../src/' + file), data);
  }
}

module.exports = { readSrcFile, dump };
