import { Context } from '../interpreter/context';

type primitives = 'string' | 'number' | 'boolean' | 'function' | 'array';

type Arg<T> = TypedIdentifier & {
    variableType: T;
};

type ArgMap<T extends Arg<primitives>> =
    T[ 'variableType' ] extends 'string'
    ?   StringValue
    :   T[ 'variableType' ] extends 'number'
        ? NumberValue
        :   T[ 'variableType' ] extends 'boolean'
            ?   BooleanValue
            :   T[ 'variableType' ] extends 'function'
                ?   FunctionValue
                :   T[ 'variableType' ] extends 'array'
                    ?   ArrayValue
                    :   never;

type Args<T extends readonly Arg<primitives>[]> = {
    [ K in keyof T ]: ArgMap<T[ K ]>
};

type InternalFunction<T extends readonly Arg<primitives>[]> = {
    arguments: T,
    func: (args: Args<T>) => Value;
};

export const arg = <T extends primitives>(name: string, type: T): Arg<T> => ({
    type: 'TypedIdentifier',
    name,
    variableType: type
});

export const internalizeFunction = <T extends readonly Arg<primitives>[]>(funcs: InternalFunction<T>[] | InternalFunction<T>): KindedValue => ({
    type: 'function',
    kind: 'fn',
    overloads: (Array.isArray(funcs) ? funcs : [ funcs ]) as any[],
    closure: new Context()
});

export const internalizeValue = <T extends string | number | boolean>(a: T): KindedValue => ({
    kind: 'const',
    type: typeof a as any,
    value: a
});