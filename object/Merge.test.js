/**[@test({ "title": "merge: " })]*/
function testTruJS21(arrange, act, assert, trujs) {
    var obj1, obj2, merged;

    arrange(function () {
        //setup the objects
        obj1 = {
            var1: "test1"
            , var2: {
                "in1": "test2.1"
            }
        };
        obj2 = {
            var1: "test2"
            , var2: {
                "in2": "test2.2"
            }
            , var4: null
        };
    });

    act(function () {
        merged = trujs.merge(obj1, obj2);
    });

    assert(function (test) {
        test('merged should be')
        .value(merged)
        .stringify()
        .equals("{\"var1\":\"test1\",\"var2\":{\"in1\":\"test2.1\",\"in2\":\"test2.2\"},\"var4\":null}");

        test("merged shoud not be")
        .value(merged)
        .not()
        .equals(obj1);

    });
}