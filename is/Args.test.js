/**[@test({ "title": "isArguments: test one Arguments and one non-Arguments" })]*/
function testPunyJS18(arrange, act, assert, punyjs_core) {
    var args, noargs, argsRes, noArgsRes;

    arrange(function () {
        args = arguments;
        noargs = [1];
        argsRes = null;
        noArgsRes = null;
    });

    act(function () {
        argsRes = punyjs.isArguments(args);
        noArgsRes = punyjs.isArguments(noargs);
    });

    assert(function (test) {
        test('The args value should be an Arguments type').value(argsRes).isTrue();
        test('The noargs value should not be an Arguments type').value(noArgsRes).isFalse();
    });
}