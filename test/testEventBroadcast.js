var assert = require('chai').assert,
    createEmmiter = require('../'),
    sinon = require('sinon');

function assertEventAttachment(obj, evName, expectedHandler) {
  assert.property(obj.events, evName, 'should have added the event as a key on the map');
  assert.isArray(obj.events[evName], 'the value should be an array');
  assert.lengthOf(obj.events[evName], 1, 'the handlers list should only have 1 item');
  
  if (expectedHandler) {
    assert.strictEqual(obj.events[evName][0], expectedHandler, 'the single handler should be the expected one - foo');
  }
}

function assertMultipleEventAttachment(obj, evList, expectedHandler) {
  evList.forEach(function (ev) {
    assertEventAttachment(obj, ev, expectedHandler);
  });
}

function foo () {};

suite('Event Broadcast', function(){
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
      assert.property(obj1, 'trigger', 'TRIGGER() should have been added');
    });

    test('should add events map to the object', function () {
      assert.property(obj1, 'events', 'EVENTS {} should have been added');
      assert.isObject(obj1.events, 'events', 'EVENTS {} should have been added');
      assert.lengthOf(Object.keys(obj1.events), 0, 'events map should be empty by default');
    });
  });

  function checkAttachment(type, compareHandler) {
    test('should attach a single event listener', function () {
      var obj = createEmmiter({});
      var args = compareHandler ? [obj, 'test', foo] : [obj, 'test'];
      obj[type]('test', foo);
      assertEventAttachment.apply(this, args);
    });

    test('should attach a multiple event listener', function () {
      var evList = ['test1', 'test2'];
      var obj = createEmmiter({});
      obj[type](evList, foo);

      var args = compareHandler ? [obj, evList, foo] : [obj, evList];
      // assert all events where added
      assertMultipleEventAttachment.apply(this, args);

      assert.lengthOf(Object.keys(obj.events), evList.length, 'event list amount missmatch');
    });

    test('should not override listeners by adding handlers on an already defined event', function () {
      var obj = createEmmiter({});
      function foo2(){}

      obj[type]('test', foo);
      assert.lengthOf(obj.events.test, 1);

      // adding a new handler to the same event listener
      obj[type]('test', foo2);
      assert.lengthOf(obj.events.test, 2);

      if (compareHandler) {
        assert.strictEqual(obj.events.test[0], foo);
        assert.strictEqual(obj.events.test[1], foo2);
      }
    });
  }

  // once and on are basically the same, expect that once will wrap the listeners so in on() we can validate it
  // but not in once()
  suite('#once', function () {
    checkAttachment('once', false);
  });

  suite('#on', function () {
    checkAttachment('on', true);
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

      assertMultipleEventAttachment(obj, evs, foo);
      obj.off(evs);
      assert.notProperty(obj.events, 'test');
      assert.notProperty(obj.events, 'test2');
      assert.notProperty(obj.events, 'test3');
    });
  });

  suite('#trigger', function () {
    test('should require at least 1 param', function () {
      var obj = createEmmiter({});
      assert.throws(obj.trigger.bind(obj), Error, null, 'Should throw an error if no param is given');
    });

    test('first param should only be string', function () {
      var obj = createEmmiter({}),
          badParamTypes = [true, null, undefined, {}, Number, []];

      badParamTypes.forEach(function (param) {
        assert.throws(obj.trigger.bind(obj, param), Error, null, 'Should throw an error first param is not a string');
      });
    });
  });

  suite('#on - #trigger active listeners', function () {
    test('should NOT fire listeners when attaching them', function () {
      var obj = createEmmiter({}),
          hd = sinon.spy();

      obj.on('test', hd);
      assert.notOk(hd.called, 'the handler shouldn\'t have been called without a trigger');
    });

    test('should fire listeners when triggering an observed event', function () {
      var obj = createEmmiter({}),
          obj2 = createEmmiter({}),
          hd = sinon.spy(),
          hd2 = sinon.spy();

      // check that a handler is called when the event is fired
      obj.on('test', hd);
      obj.trigger('test');
      assert.ok(hd.called, 'the handler shouldn\'t have been called without a trigger');
      assert.ok(hd.calledOnce, 'should have been called only once');
      obj.trigger('test');
      assert.ok(hd.calledTwice, 'should have been called twice');

      // check that all handlers for the same event are called if the event is fired
      hd.reset();
      assert.notOk(hd.called, 'the handler shouldn\'t have been called without a trigger');

      obj2.on(['test', 'test2'], hd);
      obj2.on('test', hd2);

      obj2.trigger('test');

      assert.ok(hd.called && hd.calledOnce);
      assert.ok(hd2.called && hd2.calledOnce);

      // called another event that was added at the same time as the other. Check that only the
      // expected listener is called
      obj2.trigger('test2');
      assert.ok(hd.calledTwice);
      assert.ok(hd2.calledOnce);
    });
    
    test('should pass arguments as expected', function () {
      var obj = createEmmiter({}),
          hd = sinon.spy(),
          ar = [],
          ob = {};

      obj.on('test', hd);

      obj.trigger('test');
      obj.trigger('test', true);
      obj.trigger('test', null);
      obj.trigger('test', false);
      obj.trigger('test', 'some', ar, ob, false);

      assert.ok(hd.getCall(0).args.length === 0);

      assert.ok(hd.getCall(1).args.length === 1);
      assert.ok(hd.getCall(1).args[0] === true);

      assert.ok(hd.getCall(2).args.length === 1);
      assert.ok(hd.getCall(2).args[0] === null);

      assert.ok(hd.getCall(3).args.length === 1);
      assert.ok(hd.getCall(3).args[0] === false);

      assert.ok(hd.getCall(4).args.length === 4);
      assert.ok(hd.getCall(4).args[0] === 'some');
      assert.ok(hd.getCall(4).args[1] === ar);
      assert.ok(hd.getCall(4).args[2] === ob);
      assert.ok(hd.getCall(4).args[3] === false);
    });
  });

  suite('#on - #trigger - #off', function () {
    test('should not called a listener after the event is #off', function () {
      var obj = createEmmiter({}),
          hd = sinon.spy();

      obj.on('test', hd);
      obj.trigger('test');
      obj.off('test');
      obj.trigger('test');

      assert.ok(hd.called && hd.calledOnce);
    });
  });

  suite('#once - #trigger', function () {
    test('should only call a listener 1 time when attached with once()', function () {
      var obj = createEmmiter({}),
          hd = sinon.spy(),
          hd2 = sinon.spy();

      // single attach, one execution
      obj.once('test', hd);
      obj.trigger('test');
      assert.ok(hd.called && hd.calledOnce);
      obj.trigger('test');
      assert.ok(hd.called && hd.calledOnce);

      // multiple attach, one execution
      obj.once(['test2', 'test3'], hd2);
      obj.trigger('test2');
      assert.ok(hd2.called && hd2.calledOnce);

      obj.trigger('test2');
      obj.trigger('test3');
      assert.ok(hd2.called && hd2.calledOnce);
    });
  });
});
