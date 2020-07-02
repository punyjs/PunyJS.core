/**[@test({ "title": "apply: no defaults, not removing nulls" })]*/
function testPunyJS2(arrange, act, assert, punyjs) {
    //shared variables
    var obj1, obj2, obj3;

    arrange(function () {
        obj1 = { var1: "test1", var4: null };
        obj2 = { var1: "test2", var2: "test3" };
    });

    act(function () {
        //run the apply w/ no defaults
        obj3 = punyjs.apply(obj1, obj2, null, false);
    });

    assert(function (test) {
        //test that var1 is unchanged
        test('Var1 should be unchanged').value(obj3.var1).equals(obj1.var1);
        //test that var4 exists since we aren't removing nulls
        test('Var4 should still exist').value(obj3).hasProperty("var4");
    });
}
/**[@test({ "title": "apply: with defaults, not removing nulls" })]*/
function testPunyJS3(arrange, act, assert, punyjs) {
    //shared variables
    var obj1, obj2, defaults, obj3;

    arrange(function () {
        obj1 = { var1: "test1", var4: null };
        obj2 = { var1: "test2", var2: "test3" };
        defaults = { var5: "test5", var4: "test4", var1: "noTest" };
    });

    act(function () {
        //run the apply with defaults
        obj3 = punyjs.apply(obj1, obj2, defaults, false);
    });

    assert(function (test) {
        //test var1 is unchanged
        test('Var1 should be unchanged').value(obj1.var1).equals(obj3.var1);
        //test that var4 is present and has a value
        test('Var4 should still exist').value(obj3).hasProperty("var4");
        test('Var4 should not be null').value(obj3.var4).not().isNull();
        //test that var5 is present
        test('Var5 should be present').value(obj3).hasProperty("var5");
    });
}
/**[@test({ "title": "apply: no defaults, removing nulls" })]*/
function testPunyJS4(arrange, act, assert, punyjs) {
    //shared variables
    var obj1, obj2, obj3;

    arrange(function () {
        obj1 = { var1: "test1", var4: null };
        obj2 = { var1: "test2", var2: "test3" };
    });

    act(function () {
        //run the apply with removing nulls
        obj3 = punyjs.apply(obj1, obj2, null, true);
    });

    assert(function (test) {
        //check that var4 is missing
        test('Var4 should be missing').value(obj3).not().hasProperty("var4");
    });
}