/**[@test({ "title": "isArray: test one array and one non-array" })]*/
function testPunyJS9(arrange, act, assert, punyjs) {
    //shared variables
    var ar, nonar, isar1, isar2;

    arrange(function () {
        ar = [1, 2, 3];
        nonar = { a: 1, b: 2, c: 3 };
        isar1 = null;
        isar2 = null;
    });

    act(function () {
        isar1 = punyjs.isArray(ar);
        isar2 = punyjs.isArray(nonar);
    });

    assert(function (test) {
        test('The ar variable is an array').value(isar1).isTrue();
        test('The nonar variable is not an array').value(isar2).isFalse();
    });
}