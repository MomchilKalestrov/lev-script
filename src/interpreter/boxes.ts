import { arg, internalizeValue, internalizeFunction } from '../lib/internalize';

const stringBox = ({ value }: StringValue): Record<string, KindedValue> => ({
    length: internalizeValue(value.length),
    substring: internalizeFunction({
        arguments: [ arg('start', 'number'), arg('end', 'number') ],
        func: ([ { value: start }, { value: end } ]) =>
            internalizeValue(value.substring(start, end))
    }),
    __add__: internalizeFunction([ {
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value + num.toString())
    }, {
        arguments: [ arg('bool', 'boolean') ],
        func: ([ { value: bool } ]) =>
            internalizeValue(value + bool.toString())
    }, {
        arguments: [ arg('str', 'string') ],
        func: ([ { value: str } ]) =>
            internalizeValue(value + str.toString())
    } ]),
    __eq__: internalizeFunction({
        arguments: [ arg('str', 'string') ],
        func: ([ { value: str } ]) =>
            internalizeValue(value === str)
    }),
    __neq__: internalizeFunction({
        arguments: [ arg('str', 'string') ],
        func: ([ { value: str } ]) =>
            internalizeValue(value !== str)
    }),
    __index__: internalizeFunction({
        arguments: [ arg('index', 'number') ],
        func: ([ { value: index } ]) =>
            internalizeValue(value[ index ])
    }),
    __not__: internalizeFunction({
        arguments: [],
        func: () =>
            internalizeValue(value.length !== 0)
    })
});

const numberBox = ({ value }: NumberValue): Record<string, KindedValue> => ({
    __add__: internalizeFunction([ {
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value + num)
    }, {
        arguments: [ arg('str', 'string') ],
        func: ([ { value: str } ]) =>
            internalizeValue(value + str)
    } ] as const),
    __sub__: internalizeFunction({
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value - num)
    }),
    __mul__: internalizeFunction({
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value * num)
    }),
    __div__: internalizeFunction({
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value / num)
    }),
    __mod__: internalizeFunction({
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value % num)
    }),
    __eq__: internalizeFunction({
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value === num)
    }),
    __neq__: internalizeFunction({
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value !== num)
    }),
    __lt__: internalizeFunction({
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value < num)
    }),
    __gt__: internalizeFunction({
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value > num)
    }),
    __lte__: internalizeFunction({
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value <= num)
    }),
    __gte__: internalizeFunction({
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value >= num)
    }),
    __shl__: internalizeFunction({
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value << num)
    }),
    __shr__: internalizeFunction({
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value >> num)
    }),
    __band__: internalizeFunction({
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value & num)
    }),
    __bor__: internalizeFunction({
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value | num)
    }),
    __xor__: internalizeFunction({
        arguments: [ arg('num', 'number') ],
        func: ([ { value: num } ]) =>
            internalizeValue(value ^ num)
    }),
    __not__: internalizeFunction({
        arguments: [],
        func: () =>
            internalizeValue(value !== 0)
    }),
    __neg__: internalizeFunction({
        arguments: [],
        func: () =>
            internalizeValue(-value)
    })
});

const booleanBox = ({ value }: BooleanValue): Record<string, KindedValue> => ({
    __eq__: internalizeFunction({
        arguments: [ arg('bool', 'boolean') ],
        func: ([ { value: bool } ]) =>
            internalizeValue(value === bool)
    }),
    __neq__: internalizeFunction({
        arguments: [ arg('bool', 'boolean') ],
        func: ([ { value: bool } ]) =>
            internalizeValue(value !== bool)
    }),
    __not__: internalizeFunction({
        arguments: [],
        func: () =>
            internalizeValue(!value)
    })
});

const arrayBox = ({ elements, variableType }: ArrayValue): Record<string, KindedValue> => ({
    length: internalizeValue(elements.length),
    __index__: internalizeFunction({
        arguments: [ arg('index', 'number') ],
        func: ([ { value: index } ]) =>
            elements[ index ]
    }),
    __index_set__: internalizeFunction({
        // Note: Только Господь знает what `variableType.name` is, but it'll
        // always be usable so we just shut the TS compiler's mouth! :D
        arguments: [ arg('index', 'number'), arg('value', variableType.name as 'string') ],
        func: ([ { value: index }, value ]) =>
            elements[ index ] = value
    })
});

export const box = (value: Value): Record<string, KindedValue> => {
    switch (value.type) {
        case 'string':
            return stringBox(value);
        case 'number':
            return numberBox(value);
        case 'boolean':
            return booleanBox(value);
        case 'array':
            return arrayBox(value);
        case 'null':
        case 'internal':
        case 'function':
        case 'object':
            throw new Error(`Runtime error: cannot box type ${ value.type }`);
    }
};

export const toObject = (value: Value): ObjectValue => {
    if (value.type === 'object') return value;

    return {
        type: 'object',
        fields: new Map(Object.entries(box(value))),
        instanceof: {
            type: 'Identifier',
            name: value.type.charAt(0).toUpperCase() + value.type.substring(1)
        },
        this: {} as any // it's not fatal if the context is empty, as it's never used in the boxes
    };
};