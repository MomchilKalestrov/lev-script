import { Context } from './context.ts';
import { evaluateExpression } from './expressions.ts';
import { evaluateStatement } from './statements.ts';

declare global {
    type NumberValue = { type: 'number'; value: number; };
    type StringValue = { type: 'string'; value: string; };
    type BooleanValue = { type: 'boolean'; value: boolean; };
    type NullValue = { type: 'null' };
    type FunctionValue = {
        type: 'function';
        overloads: ({
            arguments: TypedIdentifier[];
            body: Statement;
            returns: Identifier;
        })[];
        closure: Context;
    };
    type ArrayValue = {
        type: 'array';
        elements: Value[];
        variableType: Identifier;
    };
    type ObjectValue = {
        type: 'object';
        fields: Map<string, Value>;
        this: ObjectValue;
        instanceof: Identifier;
    };
    type InternalValue = {
        type: 'internal';
        overloads: ({
            arguments: TypedIdentifier[];
            func: (args: Value[]) => Value;
        })[];
    };
    
    type Value =
        | NumberValue
        | StringValue
        | BooleanValue
        | NullValue
        | FunctionValue
        | ArrayValue
        | ObjectValue
        | InternalValue;
}

type overload = FunctionValue[ 'overloads' ][ number ];
type internalOverload = InternalValue[ 'overloads' ][ number ];
export function findOverloadSignature(overloads: overload[], args: Value[]): overload | undefined;
export function findOverloadSignature(overloads: internalOverload[], args: Value[]): internalOverload | undefined;
export function findOverloadSignature(overloads: (overload | internalOverload)[], args: Value[]): overload | internalOverload | undefined {
    return overloads.find(overload =>
        overload.arguments.length === args.length &&
        overload.arguments.every((argument, i) => {
            const argType = args[ i ].type === 'object' ? args[ i ].instanceof : args[ i ].type;
            return argument.variableType === argType;
        })
    );
};

export const callValue = (func: Value, args: Expression[] | Value[], context: Context): Value => {
    const evaluatedArguments: Value[] = args[ 0 ]?.type.endsWith('Expression') || [ 'Literal', 'Identifier' ].includes(args[ 0 ]?.type)
    ?   (args as Expression[]).map(arg => evaluateExpression(arg, context))
    :   (args as Value[]);

    if (func.type === 'internal') {
        const signature = findOverloadSignature(func.overloads, evaluatedArguments);
        if (!signature) throw new Error('Runtime error: no suitable overload found');
        return signature.func(evaluatedArguments);
    }

    if (func.type !== 'function')
        throw new Error('Runtime error: trying to call a non-function value');

    const signature = findOverloadSignature(func.overloads, evaluatedArguments);
    if (!signature) throw new Error('Runtime error: no suitable overload found');

    const subContext = new Context(func.closure);
    signature.arguments.forEach((v, i) => subContext.add(v.name, evaluatedArguments[ i ]));

    const returnValue = evaluateStatement(signature.body, subContext) ?? { type: 'null' };
    const key: keyof typeof returnValue = (returnValue.type === 'object' ? 'instanceof' : 'type') as any;
    if (returnValue[ key ] !== signature.returns.name)
        throw new Error(`Runtime error: operator signature is supposed to return ${ signature.returns.name }, but returned a ${ returnValue[ key ] }`);

    return returnValue;
}

export const callObjectMember = (
    object: ObjectValue,
    property: string,
    args: Expression[] | Value[],
    context: Context
): Value => {
    const func = object.fields.get(property);
    if (!func) throw new Error(`Runtime error: no member with the name ${ property } found`);
    
    context.map.set('this', object);
    const value = callValue(func, args, context);
    context.map.delete('this');
    
    return value;
};

export const evaluate = (statements: Statement[]) => {
    const context = new Context();

    context.add(
        'output',
        {
            type: 'internal',
            overloads: [ {
                arguments: [ {
                    type: 'TypedIdentifier',
                    name: 'str',
                    variableType: 'string'
                } ],
                func: (args) => {
                    console.log((args[ 0 ] as StringValue).value);
                    return { type: 'null' };
                }
            } ]
        }
    );

    for (const statement of statements) evaluateStatement(statement, context, true);
};