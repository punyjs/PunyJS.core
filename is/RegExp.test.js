/**[@test({ "title": "isRegEx: test one regex and one non-regex" })]*/
function testPunyJS17(arrange, act, assert, punyjs) {
    var regex, noregex, regexRes, noregexRes;

    arrange(function () {
        regex = /this is regex/g;
        noregex = "This is not regex";
        regexRes = null;
        noregexRes = null;
    });

    act(function () {
        regexRes = punyjs.isRegEx(regex);
        noregexRes = punyjs.isRegEx(noregex);
    });

    assert(function (test) {
        test('The regex value should be a regular expression').value(regexRes).isTrue();
        test('The noregex value should not be a regular expression').value(noregexRes).isFalse();
    });
}