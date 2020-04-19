/**[@test({ "title": "getType: create some types and check the return value", "format": "browser" })]*/
function testTruJS8(arrange, act, assert, customEvent, trujs) {
    var test1, test2, test3, res1, res2, res3;

    arrange(function () {
        test1 = new customEvent('event');
        test2 = ["test"];
        test3 = 4.0;
    });

    act(function () {
        res1 = trujs.getType(test1);
        res2 = trujs.getType(test2);
        res3 = trujs.getType(test3);
    });

    assert(function (test) {
        test('test1 should be').value(res1).equals('customevent');
        test('test2 should be').value(res2).equals('array');
        test('test3 should be').value(res3).equals('number');
    });
}