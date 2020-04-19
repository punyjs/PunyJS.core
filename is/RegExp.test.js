/**[@test({ "title": "isRegEx: test one regex and one non-regex" })]*/
function testTruJS17(arrange, act, assert, trujs) {
    var regex, noregex, regexRes, noregexRes;

    arrange(function () {
        regex = /this is regex/g;
        noregex = "This is not regex";
        regexRes = null;
        noregexRes = null;
    });

    act(function () {
        regexRes = trujs.isRegEx(regex);
        noregexRes = trujs.isRegEx(noregex);
    });

    assert(function (test) {
        test('The regex value should be a regular expression').value(regexRes).isTrue();
        test('The noregex value should not be a regular expression').value(noregexRes).isFalse();
    });
}