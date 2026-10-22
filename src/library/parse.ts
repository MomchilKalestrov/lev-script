import { arg, internalizeFunction, internalizeValue } from '../lib/internalize';

export default {
    toNumber: internalizeFunction([ {
        arguments: [ arg('str', 'string') ],
        func: ([ { value: str } ]) =>
            internalizeValue(Number(str))
    } ]),
    toBoolean: internalizeFunction([ {
        arguments: [ arg('str', 'string') ],
        func: ([ { value: str } ]) =>
            internalizeValue(Boolean(str))
    } ])
} satisfies Record<string, KindedValue>;