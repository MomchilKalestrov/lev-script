import { readLine } from '../lib/readLine';
import { arg, internalizeFunction, internalizeValue } from '../lib/internalize';

export default {
    Log: internalizeFunction({
        arguments: [ arg('str', 'string') ],
        func: ([ { value: str } ]) => {
            console.log(str);
            return { type: 'null' };
        }
    }),
    Error: internalizeFunction({
        arguments: [ arg('err', 'string') ],
        func: ([ { value: err } ]) => {
            console.log(err);
            return { type: 'null' };
        }
    }),
    ReadLine: internalizeFunction({
        arguments: [],
        func: () => internalizeValue(readLine(process.stdin.fd).toString())
    })
} satisfies Record<string, KindedValue>;