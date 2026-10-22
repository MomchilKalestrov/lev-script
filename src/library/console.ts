import { readLine } from '../lib/readLine';
import { arg, internalizeFunction, internalizeValue } from '../lib/internalize';

export default {
    log: internalizeFunction({
        arguments: [ arg('str', 'string') ],
        func: ([ { value: str } ]) => {
            console.log(str);
            return { type: 'null' };
        }
    }),
    error: internalizeFunction({
        arguments: [ arg('err', 'string') ],
        func: ([ { value: err } ]) => {
            console.log(err);
            return { type: 'null' };
        }
    }),
    readLine: internalizeFunction({
        arguments: [],
        func: () => internalizeValue(readLine(process.stdin.fd).toString())
    })
} satisfies Record<string, KindedValue>;