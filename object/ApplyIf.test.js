/**[@test({ "title": "applyIf: no defaults, no removing nulls" })]*/
function testPunyJS5(arrange, act, assert, punyjs) {
    //shared variables
    var obj1, obj2, obj3;

    arrange(function () {
        obj1 = { var1: "test1", var4: null };
        obj2 = { var1: "test2", var2: "test3" };
    });

    act(function () {
        //run the apply with removing nulls
        obj3 = punyjs.applyIf(obj1, obj2, null, false);
    });

    assert(function (test) {
        //test that var1 is unchanged
        test('Var1 should be unchanged').value(obj2.var1).equals(obj3.var1);
    });
}