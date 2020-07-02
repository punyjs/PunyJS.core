/**[@test({ "title": "isPrototypeKey: create a prototype chain and test keys" })]*/
function testPunyJS20(arrange, act, assert, punyjs) {
    var base, obj, is1, is2;

    arrange(function () {
        base = {
            "base": 'value'
        };
        obj = {
            "obj": 'value'
        };

        Object.setPrototypeOf(obj, base);
    });

    act(function () {
        is1 = punyjs.isPrototypeKey(obj, 'base');
        is2 = punyjs.isPrototypeKey(obj, 'obj');
    });

    assert(function (test) {
        test('The `base` key should be a prototype key').value(is1).isTrue();
        test('The `obj` key should not be a prototype key').value(is2).isFalse();
    });
}