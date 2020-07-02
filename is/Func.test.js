/**[@test({ "title": "isFunc: test one event and one non-event" })]*/
function testPunyJS15(arrange, act, assert, punyjs) {
    var func, nonfunc, isfunc1, isfunc2;

    arrange(function () {
        func = function () { };
        nonfunc = { 'func': func };
        isfunc1 = null;
        isfunc2 = null;
    });

    act(function () {
        isfunc1 = punyjs.isFunc(func);
        isfunc2 = punyjs.isFunc(nonfunc);
    });

    assert(function (test) {
        test('The func variable is a function').value(isfunc1).isTrue();
        test('The nonfunc variable is not a function').value(isfunc2).isFalse();
    });
}