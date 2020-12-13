/**
* @test
*   @title PunyJS.core.json._JSON: decycle stringify
*/
function jsonDecycleTest1(
    controller
) {
    var json, example, result;

    arrange(
        async function arrangeFn() {
            json = await controller(
                [":PunyJS.core.json._Json", []]
            );
            example = {
                "prop1": "value1"
                , "sub1": {
                    "prop2": 10
                    , "sub2": {
                        "prop3": [20,"value3"]
                    }
                }
            };
            example.self = example;
            example.sub1.sub2.self = example;
        }
    );

    act(
        function actFn() {
            result = json.decycle(
                example
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The result should be")
            .value(result)
            .equals('{"prop1":"value1","sub1":{"prop2":10,"sub2":{"prop3":[20,"value3"],"self":{"$$ref$$":"$"}}},"self":{"$$ref$$":"$"}}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.core.json._JSON: retrocycle parse
*/
function jsonRetrocycleTest1(
    controller
) {
    var json, example, result;

    arrange(
        async function arrangeFn() {
            json = await controller(
                [":PunyJS.core.json._Json", []]
            );
            example = '{"prop1":"value1","sub1":{"prop2":10,"sub2":{"prop3":[20,"value3"],"self":{"$$ref$$":"$"}}},"self":{"$$ref$$":"$"}}';
        }
    );

    act(
        function actFn() {
            result = json.retrocycle(
                example
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The result should be an object")
            .value(result)
            .isOfType("object")
            ;

            test("The result.self should be a reference to the result")
            .value(result, "self")
            .equals(result)
            ;

            test("The type of result.sub1.sub2.prop3 should be array")
            .value(result, "sub1.sub2.prop3")
            .isOfType("array")
            ;
        }
    );
}