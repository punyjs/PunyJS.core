/**[@test({ "title": "isEvent: test one event and one non-event", "format": "browser" })]*/
function testTruJS13(arrange, act, assert, customEvent, trujs) {
    //shared variables
    var evnt, nonevnt, isevnt1, isevnt2;

    arrange(function () {
        evnt = new customEvent('test');
        nonevnt = { 'event': 'test' };
        isevnt1 = null;
        isevnt2 = null;
    });

    act(function () {
        isevnt1 = trujs.isEvent(evnt);
        isevnt2 = trujs.isEvent(nonevnt);
    });

    assert(function (test) {
        test('The evnt variable is an event').value(isevnt1).isTrue();
        test('The nonevnt variable is not an event').value(isevnt2).isFalse();
    });
}