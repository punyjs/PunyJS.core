/**[@test({ "title": "isArguments: test one Arguments and one non-Arguments" })]*/
function testTruJS18(arrange, act, assert, trujs_core) {
    var args, noargs, argsRes, noArgsRes;

    arrange(function () {
        args = arguments;
        noargs = [1];
        argsRes = null;
        noArgsRes = null;
    });

    act(function () {
        argsRes = trujs.isArguments(args);
        noArgsRes = trujs.isArguments(noargs);
    });

    assert(function (test) {
        test('The args value should be an Arguments type').value(argsRes).isTrue();
        test('The noargs value should not be an Arguments type').value(noArgsRes).isFalse();
    });
}