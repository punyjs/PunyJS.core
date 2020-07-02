/**[@test({ "title": "isEmpty: an empty string, array, and object, and then a non-empty version of each" })]*/
function testPunyJS10(arrange, act, assert, punyjs) {
    //shared variables
    var ar, str, obj, isar, isstr, isobj;

    arrange(function () {
        ar = [];
        str = '';
        obj = {};
        isar = null;
        isstr = null;
        isobj = null;
    });

    act(function () {
        isar = punyjs.isEmpty(ar);
        isstr = punyjs.isEmpty(str);
        isobj = punyjs.isEmpty(obj);
    });

    assert(function (test) {
        test('The ar variable is empty').value(isar).isTrue();
        test('The str variable is empty').value(isstr).isTrue();
        test('The obj variable is empty').value(isobj).isTrue();
    });
}

/**[@test({ "title": "isEmpty: a non empty string, array, and object" })]*/
function testPunyJS11(arrange, act, assert, punyjs) {
    //shared variables
    var ar, str, obj, isar, isstr, isobj;

    arrange(function () {
        ar = [1];
        str = '1';
        obj = {
            "a": 1
        };
        isar = null;
        isstr = null;
        isobj = null;
    });

    act(function () {
        isar = punyjs.isEmpty(ar);
        isstr = punyjs.isEmpty(str);
        isobj = punyjs.isEmpty(obj);
    });

    assert(function (test) {
        test('The ar variable is not empty').value(isar).isFalse();
        test('The str variable is not empty').value(isstr).isFalse();
        test('The obj variable is not empty').value(isobj).isFalse();
    });
}