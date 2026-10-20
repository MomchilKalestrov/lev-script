import { toObject } from './boxes.ts';
import { Context } from './context.ts';
import { callObjectMember, callValue } from './interpreter.ts';
import { hasType, instantiateType } from './typeDB.ts';

export const evaluateAssignmentExpression = (expression: AssignmentExpression, context: Context): Value => {
    const value = evaluateExpression(expression.value, context);

    switch (expression.id.type) {
        case 'Identifier':
            context.set(expression.id.name, value);
            break;
        case 'MemberExpression': {
            const object = evaluateExpression(expression.id.object, context);
            if (object.type !== 'object')
                throw new Error(`Runtime error: trying to mutate a ${ object.type }\'s members`);
            if (!object.fields.has(expression.id.property.name))
                throw new Error(`Runtime error: no member with the name ${ expression.id.property.name } found`);
            object.fields.set(expression.id.property.name, value);
        } break;
        case 'IndexExpression': {
            let object = evaluateExpression(expression.id.object, context);
            let index = evaluateExpression(expression.id.index, context);

            callObjectMember(toObject(object), '__index_set__', [ index, value ], context);
        } break;
    }

    return value;
};

// the functions will be named like this ONLY TEMPORARILY!!!!!!!!!!!
const binaryOperatorFunctions: Record<string, string> = {
    '+':  '__add__',
    '-':  '__sub__',
    '*':  '__mul__',
    '/':  '__div__',
    '%':  '__mod__',
    '==': '__eq__',
    '!=': '__neq__',
    '<':  '__lt__',
    '>':  '__gt__',
    '<=': '__lte__',
    '>=': '__gte__',
    '<<': '__shl__',
    '>>': '__shr__',
    '&':  '__band__',
    '|':  '__bor__',
    '^':  '__xor__'
};

export const evaluateBinaryExpression = (expression: BinaryExpression, context: Context): Value => {
    const opFunc = binaryOperatorFunctions[ expression.operator ];

    const left = evaluateExpression(expression.left, context);
    const right = evaluateExpression(expression.right, context);

    if (left.type === 'object')
        try {
            return callObjectMember(left, opFunc, [ right ], context);
        } catch {}

    if (right.type === 'object')
        try {
            return callObjectMember(right, opFunc, [ left ], context);
        } catch {
            throw new Error(`Runtime error: cannot evaluate ${ left.type } ${ expression.operator } ${ right.type }`);
        }
    
    return callObjectMember(toObject(left), opFunc, [ right ], context);
};

export const evaluateCallExpression = (expression: CallExpression, context: Context): Value => {
    const callee = evaluateExpression(expression.callee, context);
    return callValue(callee, expression.arguments, context);
};

export const evaluateFunctionExpression = (expression: FunctionExpression, context: Context): FunctionValue => {
    expression.arguments.forEach(arg => {
        if (!hasType(arg.variableType))
            throw new Error(`Runtime error: cannot find type ${ arg.variableType }`);
    });

    if (!hasType(expression.returns.name))
        throw new Error(`Runtime error: cannot find type ${ expression.returns.name }`);
    
    return {
        type: 'function',
        overloads: [ expression ],
        closure: context
    };
};

export const evaluateIndexExpression = (expression: IndexExpression, context: Context): Value => {
    const value = evaluateExpression(expression, context);
    return callObjectMember(toObject(value), '__index__', [ expression.index ], context);
};

export const evaluateMemberExpression = (expression: MemberExpression, context: Context): Value => {
    let unknownValue = evaluateExpression(expression.object, context);
    const object = toObject(unknownValue);

    const value = object.fields.get(expression.property.name);
    if (!value) throw new Error(`Runtime error: no member with the name ${ expression.property.name } found`);

    return value;
};

export const evaluateIdentifier = (expression: Identifier, context: Context): Value =>
    context.get(expression.name);

export const evaluateTernaryExpression = (expression: TernaryExpression, context: Context): Value => {
    const condition = evaluateExpression(expression, context);
    if (condition.type !== 'boolean')
        throw new Error('Runtime error: ternary operator requires a boolean value for the condition');
    
    // cheeky ;)
    return condition.value
    ?   evaluateExpression(expression.consequence, context)
    :   evaluateExpression(expression.alternative, context);
};

// the functions will be named like this ONLY TEMPORARILY!!!!!!!!!!!
const unaryOperatorFunctions: Record<string, string> = {
    '!': '__not__',
    '-': '__neg__'
};

export const evaluateUnaryExpression = (expression: UnaryExpression, context: Context): Value => {
    const opFunc = unaryOperatorFunctions[ expression.operator ];
    const value = evaluateExpression(expression.expression, context);
    return callObjectMember(toObject(value), opFunc, [], context);
};

export const evaluateNewExpression = (expression: NewExpression, context: Context): Value =>
    instantiateType(
        expression.id.name,
        expression.arguments.map(arg => evaluateExpression(arg, context))
    );

export const evaluateExpression = (expression: Expression, context: Context): Value => {
    switch (expression.type) {
        case 'AssignmentExpression':
            return evaluateAssignmentExpression(expression, context);
        case 'BinaryExpression':
            return evaluateBinaryExpression(expression, context);
        case 'CallExpression':
            return evaluateCallExpression(expression, context);
        case 'FunctionExpression':
            return evaluateFunctionExpression(expression, context);
        case 'Identifier':
            return evaluateIdentifier(expression, context);
        case 'IndexExpression':
            return evaluateIndexExpression(expression, context);
        case 'Literal':
            const toJS = {
                boolean: (v: string) => Boolean(v),
                string: (v: string) => v,
                number: (v: string) => Number(v)
            };

            return {
                type: expression.valueType,
                value: toJS[ expression.valueType ](expression.value)
            } as Value;
        case 'MemberExpression':
            return evaluateMemberExpression(expression, context);
        case 'TernaryExpression':
            return evaluateTernaryExpression(expression, context);
        case 'UnaryExpression':
            return evaluateUnaryExpression(expression, context);
        case 'NewExpression':
            return evaluateNewExpression(expression, context);
    }
};