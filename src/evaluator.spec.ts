import { expect } from "chai"
import { makeEvaluator } from "./evaluator"
const Algebra = require("ganja.js")

describe("makeEvaluator", () => {
    describe("PGA3D", () => {
        const algebra = Algebra(3, 0, 1)
        const evaluateGanja = makeEvaluator(algebra)

        const testCases: [string, string][] = [
            ["grade(1, 0)", "1"],
            ["grade(1, 2)", "0"],
            ["grade(e12, 0)", "0"],
            ["grade(e12, 2)", "e_12"],
            ["e12 * e3", "e_123"],
            ["e12 * e12", "-1"],
            ["e12 ^ e3", "e_123"],
            ["e12 ^ e2", "0"],
            ["e12 | e3", "0"],
            ["e12 | e2", "e_1"],
            ["e0 | e0", "0"],
            ["e1 | e1", "1"],
            ["2e1", "2e_1"],
            ["-2e1", "-2e_1"],
            ["-e1", "-e_1"],
        ]

        testCases.forEach(([input, expectedOutput]: [string, string]) => it(`${input} -> ${expectedOutput}`, () => {
            const output = evaluateGanja(input)
            expect(output.toString()).equal(expectedOutput)
        }))
    })
})