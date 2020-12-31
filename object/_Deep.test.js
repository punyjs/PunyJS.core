/**
* @test
*   @title PunyJS.core.object._Deep: basic test
*/
function testCoreDeep1(
    controller
) {
    var deepCopy, item1, item2, item3, copy1, copy2, copy3;

    arrange(
        async function arrangeFn() {
            deepCopy = await controller(
                [
                    ":PunyJS.core.object._Deep"
                    , []
                ]
            );
            item1 = {
                "prop1": function temp(){}
                , "sub1": {
                    "subprop1": "value1"
                    , "subProp2": new Error("error")
                }
            };
            item1.prop2 = item1.sub1;
            item2 = [
                {}
                , 2
                , [20,10]
            ];
            item3 = "test string";
        }
    );

    act(
        function actFn() {
            copy1 = deepCopy(item1);
            copy2 = deepCopy(item2);
            copy3 = deepCopy(item3);
        }
    );

    assert(
        function assertFn(test) {
            test("copy1 should not equal item1")
            .value(copy1)
            .not
            .equals(item1)
            ;

            test("copy1 should be")
            .value(copy1)
            .hasOwnProperty("prop1")
            .stringify()
            .equals('{"sub1":{"subprop1":"value1","subProp2":{}},"prop2":{"$$ref$$":"$.sub1"}}')
            ;

            test("copy1.prop1 should equal item.prop1")
            .value(copy1, "prop1")
            .equals(item1.prop1)
            ;

            test("copy2 should not equal item2")
            .value(copy2)
            .not
            .equals(item2)
            ;

            test("copy2[0] should not equal item2[0]")
            .value(copy2, "0")
            .not
            .equals(item2[0])
            ;

            test("copy2[1] should equal item2[1]")
            .value(copy2, "1")
            .equals(item2[1])
            ;

            test("copy2[2] should not equal item2[2]")
            .value(copy2, "2")
            .not
            .equals(item2[2])
            ;

            test("copy3 should equal item3")
            .value(copy3)
            .equals(item3)
            ;
        }
    );
}