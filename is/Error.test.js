/**[@test({ "title": "isError: test one error and one non-error" })]*/
function testTruJS14(arrange, act, assert, trujs) {
    var err, noerr, errRes, noerrRes;

    arrange(function () {
        err = new Error("This is a test error");
        noerr = "This is not a test error";
        errRes = null;
        noerrRes = null;
    });

    act(function () {
        errRes = trujs.isError(err);
        noerrRes = trujs.isError(noerr);
    });

    assert(function (test) {
        test('The err value should be an Error').value(errRes).isTrue();
        test('The noerr value should not be an Error').value(noerrRes).isFalse();
    });
}