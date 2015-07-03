exports.isArray = (Array.isArray || function isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
});

exports.isObject = function isObject(arg) {
  return Object.prototype.toString.call(arg) === '[object Object]';
}

exports.isString = function isString(str) {
  return typeof str === 'string';
}

exports.toArray = function toArray(arg) {
  return exports.isArray(arg) ? arg : [arg];
}
