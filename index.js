var normalize = require('./lib/normalize');
var isString = require('./lib/utils').isString;
var toArray = require('./lib/utils').toArray;

function addListener(obj, event, listener) {
  var handlers = (obj.events[event] || (obj.events[event] = []));
  handlers.push(listener);
}

function on(events, handler) {
  var evs = toArray(events);
  
  evs.forEach(function (ev) {
    addListener(this, ev, handler);
  }, this);

}

function once(events, handler) {
  var that = this,
      fn = function () {
        handler.apply(that, [].slice.call(arguments, 0));
        toArray(events).forEach(function (ev) {
          afterExecute(ev);
        });
      },
      afterExecute = function (ev) {
        var list = that.events[ev],
            match = list.lastIndexOf(fn);

        if (match !== -1) {
          list.splice(match, 1);
        }
      };

  this.on(events, fn);
}

function off(events) {
  var evs = toArray(events);
  evs.forEach(function (ev) {
    if (this.events[ev]) {
      delete this.events[ev];
    }
  }, this);
}

function trigger(evName) {
  var ev, args;
  if (!evName || !isString(evName)) {
    throw new Error('Event name must be supplied and it should be a string');
  }
  ev = this.events[evName];
  args = [].slice.call(arguments, 1);

  if (ev && ev.length > 0) {
    ev.forEach(function (handler) {
      handler.apply(this, args);
    });
  }
}

var EventEmitter = Object.create({
  on: on,
  off: off,
  once: once,
  trigger: trigger
});

function makeEmitter(obj) {
  obj.events = {};
  return Object.create(EventEmitter, normalize(obj));
}

module.exports = makeEmitter;
