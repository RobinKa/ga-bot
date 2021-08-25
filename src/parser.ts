import { Additive, ASTKinds, Constant, Expression, FunctionCall, InnerOuter, Multiplicative, parse, Power, Primary, Unary } from "./__generated__/ga"

export function makeParser(algebra: any): (expr: string) => any {
    const unaryOperations: Record<string, any> = {
        "~": algebra.Reverse,
        "!": algebra.Dual,
    }

    const binaryOperations: Record<string, any> = {
        "+": algebra.Add,
        "-": algebra.Sub,
        "*": algebra.Mul,
        "&": algebra.Vee,
        "**": algebra.Pow,
        "/": algebra.Div,
        "^": algebra.Wedge,
        "|": algebra.Dot,
    }

    function astToGanja(root: Expression): any {
        type BinaryOperator<TOp extends string, TChild> = {
            head: TChild
            tail: { sm: TChild, op: TOp }[]
        }

        function constantToGanja(node: Constant) {
            switch (node.kind) {
                case ASTKinds.Constant_1:
                    return algebra.Coeff(`e${node.indices}`, parseFloat(node.value))
                case ASTKinds.Constant_2:
                    return algebra.Coeff(`e${node.indices}`, node.negate ? -1 : 1)
                case ASTKinds.Constant_3:
                    return algebra.Coeff("0", parseFloat(node.value))
                case ASTKinds.Constant_4:
                    return algebra.Dual(algebra.Coeff("0", node.negate ? -1 : 1))
            }
        }

        const functionCallToGanja = (node: FunctionCall) => {
            const functionName = node.fn.toLowerCase()

            switch (functionName) {
                case "exp":
                case "e":
                    if (node.args.kind === ASTKinds.FunctionCallArgs_1) {
                        throw Error("Exponential function takes exactly 1 input but 0 were passed.")
                    }

                    if (node.args.tail.length !== 0) {
                        throw Error(`Exponential function takes exactly 1 input but ${node.args.tail.length + 1} were passed.`)
                    }

                    return expressionToGanja(node.args.head).Exp()
                case "log":
                case "ln":
                    if (node.args.kind === ASTKinds.FunctionCallArgs_1) {
                        throw Error("Logarithm takes exactly 1 input but 0 were passed.")
                    }

                    if (node.args.tail.length !== 0) {
                        throw Error(`Logarithm takes exactly 1 input but ${node.args.tail.length + 1} were passed.`)
                    }

                    return expressionToGanja(node.args.head).Log()
                case "hodge":
                    if (node.args.kind === ASTKinds.FunctionCallArgs_1) {
                        throw Error("Hodge takes exactly 1 input but 0 were passed.")
                    }

                    if (node.args.tail.length !== 0) {
                        throw Error(`Hodge takes exactly 1 input but ${node.args.tail.length + 1} were passed.`)
                    }

                    return algebra.Dual(algebra.Reverse(expressionToGanja(node.args.head)))
                default:
                    throw Error(`Unknown function ${functionName}`)
            }
        }

        function binaryOperatorToGanja<TOp extends string, TChild>(node: BinaryOperator<TOp, TChild>, childToGanja: (child: TChild) => any) {
            return node.tail.reduce((prev: any, curr): any => {
                return binaryOperations[curr.op](prev, childToGanja(curr.sm))
            }, childToGanja(node.head))
        }

        function primaryToGanja(node: Primary): any {
            switch (node.kind) {
                case ASTKinds.Primary_1:
                    return expressionToGanja(node.expression)
                case ASTKinds.Primary_2:
                    return functionCallToGanja(node.functionCall)
                case ASTKinds.Primary_3:
                    return constantToGanja(node.constant)
            }
        }

        function unaryToGanja(node: Unary): any {
            return node.head.reduce((prev: any, curr): any => {
                return unaryOperations[curr.op](prev)
            }, primaryToGanja(node.primary))
        }

        const powerToGanja = (node: Power) => binaryOperatorToGanja(node, unaryToGanja)
        const innerOuterToGanja = (node: InnerOuter) => binaryOperatorToGanja(node, powerToGanja)
        const multiplicativeToGanja = (node: Multiplicative) => binaryOperatorToGanja(node, innerOuterToGanja)
        const additiveToGanja = (node: Additive) => binaryOperatorToGanja(node, multiplicativeToGanja)
        const expressionToGanja = (node: Expression) => additiveToGanja(node.additive)

        return expressionToGanja(root)
    }

    return function parseExpression(expr: string): any {
        const parseResult = parse(expr)
        if (parseResult.errs.length > 0 || !parseResult.ast) {
            throw Error(`Errors parsing ${expr} ${JSON.stringify(parseResult, undefined, 2)}`)
        }
        return astToGanja(parseResult.ast)
    }
}
