/**[@test({ "title": "isError: test one error and one non-error" })]*/
function testPunyJS14(arrange, act, assert, punyjs) {
    var err, noerr, errRes, noerrRes;

    arrange(function () {
        err = new Error("This is a test error");
        noerr = "This is not a test error";
        errRes = null;
        noerrRes = null;
    });

    act(function () {
        errRes = punyjs.isError(err);
        noerrRes = punyjs.isError(noerr);
    });

    assert(function (test) {
        test('The err value should be an Error').value(errRes).isTrue();
        test('The noerr value should not be an Error').value(noerrRes).isFalse();
    });
}