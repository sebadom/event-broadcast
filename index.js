var normalize = require('./lib/normalize');
var isArray = require('./lib/utils').isArray;

function addListener(obj, event, listener) {
  var handlers = (obj.events[event] || (obj.events[event] = []));
  handlers.push(listener);
}

function on(events, handler) {
  if (!isArray(events)) {
    events = [events];
  }
  
  events.forEach(function (ev) {
    addListener(this, ev, handler);
  }, this);
}

function off(events) {
  if (!isArray(events)) {
    events = [events];
  }
  events.forEach(function (ev) {
    if (this.events[ev]) {
      delete this.events[ev];
    }
  }, this);
  
}

var EventEmitter = Object.create({
  on: on,
  off: off,
  once: function () { console.log('once'); }
});

function makeEmitter(obj) {
  obj.events = {};
  return Object.create(EventEmitter, normalize(obj));
}

module.exports = makeEmitter;
