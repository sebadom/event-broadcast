var assert = require('chai').assert;
var createEmmiter = require('../');

function assertEventAttachment(obj, evName) {
  assert.property(obj.events, evName, 'should have added the event as a key on the map');
  assert.isArray(obj.events[evName], 'the value should be an array');
  assert.lengthOf(obj.events[evName], 1, 'the handlers list should only have 1 item');
  assert.strictEqual(obj.events[evName][0], foo, 'the single handler should be the expected one - foo');
}

function assertMultipleEventAttachment(obj, evList) {
  evList.forEach(function (ev) {
    assertEventAttachment(obj, ev);
  });
}

function foo () {};

suite('Array', function(){
  setup(function(){
    // ...
  });

  suite('#creation', function(){
    var obj1 = createEmmiter({ foo: true, bar: false }),
        obj2 = createEmmiter({ foo: false, bar: true });

    test('should create different objects', function () {
      assert.notStrictEqual(obj1, obj2);
      assert.property(obj1, 'foo');
      assert.propertyVal(obj1, 'foo', true);

      assert.property(obj2, 'foo');
      assert.propertyVal(obj2, 'foo', false);
    });

    test('should add Event Broadcast methods to the object instance', function () {
      assert.property(obj1, 'on', 'ON() should have been added');
      assert.property(obj1, 'off', 'OFF() should have been added');
    });

    test('should add events map to the object', function () {
      assert.property(obj1, 'events', 'EVENTS {} should have been added');
      assert.isObject(obj1.events, 'events', 'EVENTS {} should have been added');
      assert.lengthOf(Object.keys(obj1.events), 0, 'events map should be empty by default');
    });
  });

  suite('#on', function () {
    test('should attach a single event listener', function () {
      var obj = createEmmiter({});
      obj.on('test', foo);
      assertEventAttachment(obj, 'test');
    });

    test('should attach a multiple event listener', function () {
      var evList = ['test1', 'test2'];
      var obj = createEmmiter({});
      obj.on(evList, foo);

      // assert all events where added
      assertMultipleEventAttachment(obj, evList);

      assert.lengthOf(Object.keys(obj.events), evList.length, 'event list amount missmatch');
    });

    test('should not override listeners by adding handlers on an already defined event', function () {
      var obj = createEmmiter({});
      function foo2(){}

      obj.on('test', foo);
      assert.lengthOf(obj.events.test, 1);

      // adding a new handler to the same event listener
      obj.on('test', foo2);

      assert.lengthOf(obj.events.test, 2);
      assert.strictEqual(obj.events.test[0], foo);
      assert.strictEqual(obj.events.test[1], foo2);
    });
  });

  suite('#off', function () {
    test('should be able to remove an event listener', function () {
      var obj = createEmmiter({});
      obj.on('test', foo);

      assert.lengthOf(obj.events.test, 1);
      obj.off('test');
      assert.notProperty(obj.events, 'test');
    });

    test('should not remove other event listeners', function () {
      var obj = createEmmiter({}),
          evs = ['test', 'test2'];
      obj.on(evs, foo);

      obj.off('test');
      assert.notProperty(obj.events, 'test');
      assert.property(obj.events, 'test2');
    });

    test('should be able to remove multiple event listeners', function () {
      var obj = createEmmiter({}),
          evs = ['test', 'test2', 'test3'];
      obj.on(evs, foo);

      assertMultipleEventAttachment(obj, evs);
      obj.off(evs);
      assert.notProperty(obj.events, 'test');
      assert.notProperty(obj.events, 'test2');
      assert.notProperty(obj.events, 'test3');
    });
  });
});
