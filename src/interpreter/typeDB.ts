import { Context } from './context.ts';
import { callObjectMember } from './interpreter.ts';
import { evaluateFunctionDeclaration, evaluateVariableDeclaration } from './statements.ts';

const PRIMITIVES = [ 'string', 'number', 'boolean', 'array', 'function', 'null' ];

type type = {
    fields: (FunctionDeclaration | VariableDeclaration)[];
    clojure: Context;
};

const types: Map<string, type> = new Map();

// gundam newtype woah :oooooo
// 私の魂は重力に押しつぶされているのだろうか？
export const newType = (name: string, type: type) => {
    if (types.has(name))
        throw new Error(`Runtime error: redefinition of type ${ name }`);
    types.set(name, type);
};

export const getType = (name: string): type => {
    const type = types.get(name);
    if (!type) throw new Error(`Runtime error: type ${ name } not found`);
    return type;
}

export const instantiateType = (name: string, args: Value[]): ObjectValue => {
    const type = getType(name);
    const thisAsContext = new Context(type.clojure);

    const instance: Partial<ObjectValue> = {
        type: 'object',
        instanceof: { type: 'Identifier', name },
        fields: new Map<string, Value>()
    };
    instance.this = instance as ObjectValue;

    instance.fields!.set('__ctor__', {
        type: 'internal',
        overloads: [ {
            arguments: [],
            func: () => ({ type: 'null' })
        } ]
    });

    thisAsContext.map.set('this', instance as ObjectValue);
    type.fields.forEach(value => {
        if (value.type === 'FunctionDeclaration')
            evaluateFunctionDeclaration(value, thisAsContext);
        else
            evaluateVariableDeclaration(value, thisAsContext);
    });
    thisAsContext.map.delete('this');
    thisAsContext.map.forEach((value, key) => instance.fields!.set(key, value));

    callObjectMember(instance as ObjectValue, '__ctor__', args, type.clojure);

    return instance as ObjectValue;
};

export const hasType = (name: string): boolean => types.has(name) || PRIMITIVES.includes(name);