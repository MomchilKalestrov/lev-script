import { arg, internalizeFunction, internalizeValue } from '../lib/internalize';

export default {
    ToNumber: internalizeFunction([ {
        arguments: [ arg('str', 'string') ],
        func: ([ { value: str } ]) =>
            internalizeValue(Number(str))
    } ]),
    ToBoolean: internalizeFunction([ {
        arguments: [ arg('str', 'string') ],
        func: ([ { value: str } ]) =>
            internalizeValue(Boolean(str))
    } ])
} satisfies Record<string, KindedValue>;