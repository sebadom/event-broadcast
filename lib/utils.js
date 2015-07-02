exports.isArray = (Array.isArray || function isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
});

exports.isObject =function isObject(arg) {
  return Object.prototype.toString.call(arg) === '[object Object]';
}
