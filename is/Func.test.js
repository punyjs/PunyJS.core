/**[@test({ "title": "isFunc: test one event and one non-event" })]*/
function testTruJS15(arrange, act, assert, trujs) {
    var func, nonfunc, isfunc1, isfunc2;

    arrange(function () {
        func = function () { };
        nonfunc = { 'func': func };
        isfunc1 = null;
        isfunc2 = null;
    });

    act(function () {
        isfunc1 = trujs.isFunc(func);
        isfunc2 = trujs.isFunc(nonfunc);
    });

    assert(function (test) {
        test('The func variable is a function').value(isfunc1).isTrue();
        test('The nonfunc variable is not a function').value(isfunc2).isFalse();
    });
}