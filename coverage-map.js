const regex = /^test\/(.*)\.(ts|js)/;
module.exports = (testFile) => testFile.replace(regex, 'build/$1.js');
