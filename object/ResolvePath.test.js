/**[@test({ "title": "PunyJS.resolvePath: resolve various path types" })]*/
function testPunyJS1(arrange, act, assert, punyjs) {
    var obj, path1, res1, path2, res2, path3, res3;

    arrange(function () {
        obj = {
            "name": 'joe shmo'
            , "address": {
                "street": '12345 street drive'
            }
            , "friends": [{
                "name": 'Jane Doh'
            }]
        };

        path1 = 'name';
        path2 = 'address.street';
        path3 = 'friends[0].name';
    });

    act(function () {
        res1 = punyjs.resolvePath(path1, obj);
        res2 = punyjs.resolvePath(path2, obj);
        res3 = punyjs.resolvePath(path3, obj);
    });

    assert(function (test) {
        test('The res1 value should be:').value(res1, 'value').equals(obj.name);
        test('The res2 value should be:').value(obj, 'address.street').equals(res2.value);
        test('The res3 value should be:').value(obj, 'friends[0].name').equals(res3.value);
    });
}
/**[@test({ "title": "resolvePath" })]*/
function testPunyJS23(arrange, act, assert, punyjs) {
    var obj, res;

    arrange(function () {
        obj = {
            "level1": {
                "level2": [{
                    "value": "value1"
                }, {
                    "value": "value2"
                }]
                , "key": 1
            }
        };
    });

    act(function () {
        res = punyjs.resolvePath("level1.level2[level1.key].value", obj);
    });

    assert(function (test) {
        test("res.value should be level2[1].value")
        .value(res.value)
        .equals(obj.level1.level2[1].value);

        test("res.parent should be level2[1]")
        .value(res.parent)
        .equals(obj.level1.level2[1]);

        test("res.index should be 'value'")
        .value(res.index)
        .equals("value");

        test("res.path should be")
        .value(res.path)
        .equals("level1.level2[1].value");

    });
}