/**[@test({ "title": "isProp: create an object and check for properties" })]*/
function testPunyJS19(arrange, act, assert, punyjs) {
    var obj, is1, is2;

    arrange(function () {
        obj = {
            "key1": "value1"
            , "key3": "value2"
        };
    });

    act(function () {
        is1 = punyjs.isProp(obj, 'key1');
        is2 = punyjs.isProp(obj, 'key2');
    });

    assert(function (test) {
        test("is1 should be true")
        .value(is1)
        .isTrue();

        test("is2 should be false")
        .value(is2)
        .isFalse();

    });
}