/**[@test({ "title": "isNill: test one undefined, null, and object" })]*/
function testTruJS16(arrange, act, assert, trujs) {
    var t1, t2, t3, isn1, isn2, isn3;

    arrange(function () {
        t1 = undefined;
        t2 = null;
        t3 = {};
        isn1 = null;
        isn2 = null;
        isn3 = null;
    });

    act(function () {
        isn1 = trujs.isNill(t1);
        isn2 = trujs.isNill(t2);
        isn3 = trujs.isNill(t3);
    });

    assert(function (test) {
        test('The t1 variable is nill').value(isn1).isTrue();
        test('The t2 variable is nill').value(isn2).isTrue();
        test('The t3 variable is not nill').value(isn3).isFalse();
    });
}