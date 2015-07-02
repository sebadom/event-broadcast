var isObject = require('./utils').isObject;

module.exports = function normalize(obj) {
  var prop, r = {};
  for (prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (!isObject(obj[prop]) || (isObject(obj[prop]) && !obj[prop].hasOwnProperty('value'))) {
        r[prop] = { value: obj[prop] };
      }
    }
  }
  return r;
}
