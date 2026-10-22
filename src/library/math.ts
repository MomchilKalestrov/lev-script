import { arg, internalizeFunction, internalizeValue } from '../lib/internalize';

const twoArgFunctions = [
    'atan2',
    'pow'
] as const;

const singleArgFunctions = [
    'abs',
    'acos',
    'acosh',
    'asin',
    'asinh',
    'atan',
    'atanh',
    'cbrt',
    'ceil',
    'cos',
    'cosh',
    'exp',
    'expm1',
    'floor',
    'round',
    'sign',
    'sin',
    'sinh',
    'sqrt',
    'tan',
    'tanh'
] as const;

export default {
    pi: internalizeValue(Math.PI),
    e: internalizeValue(Math.E),
    log: internalizeFunction({
        arguments: [ arg('base', 'number'), arg('value', 'number') ],
        func: ([ { value: base }, { value } ]) =>
            internalizeValue(Math.log(value) / Math.log(base))
    }),
    random: internalizeFunction([ {
        arguments: [ arg('min', 'number'), arg('max', 'number') ],
        func: ([ { value: min }, { value: max } ]) =>
            internalizeValue(Math.random() * (max - min) + min)
    }, {
        arguments: [ arg('max', 'number') ],
        func: ([ { value: max } ]) =>
            internalizeValue(Math.random() * max)
    }, {
        arguments: [],
        func: () => internalizeValue(Math.random())
    } ]),
    ...Object.fromEntries(twoArgFunctions.map(key => [
        key,
        internalizeFunction({
            arguments: [ arg('a', 'number'), arg('b', 'number') ],
            func: ([ { value: a }, { value: b } ]) => internalizeValue(Math[ key ](a, b))
        })
    ])),
    ...Object.fromEntries(singleArgFunctions.map(key => [
        key,
        internalizeFunction({
            arguments: [ arg('value', 'number') ],
            func: ([ { value } ]) => internalizeValue(Math[ key ](value))
        })
    ]))
} satisfies Record<string, KindedValue>;