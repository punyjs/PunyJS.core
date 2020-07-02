/**[@test({ "title": "update: " })]*/
function testPunyJS22(arrange, act, assert, punyjs) {
    var obj1, obj2, updated;

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
        updated = punyjs.update(obj1, obj2);
    });

    assert(function (test) {
        test('merged should be')
        .value(updated)
        .stringify()
        .equals("{\"var1\":\"test1\",\"var2\":{\"in1\":\"test2.1\",\"in2\":\"test2.2\"},\"var4\":null}");

        test("merged shoud not be")
        .value(updated)
        .equals(obj1);

    });
}