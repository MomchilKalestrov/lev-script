import fs from 'node:fs';
import { arg, internalizeFunction, internalizeValue } from '../lib/internalize';

export default {
    ReadFile: internalizeFunction({
        arguments: [ arg('path', 'string') ],
        func: ([ { value: path } ]) =>
            internalizeValue(fs.readFileSync(path).toString())
    }),
    WriteFile: internalizeFunction({
        arguments: [ arg('path', 'string'), arg('value', 'string') ],
        func: ([ { value: path }, { value } ]) => {
            fs.writeFileSync(path, value);
            return { type: 'null' };
        }
    }),
    AppendFile: internalizeFunction({
        arguments: [ arg('path', 'string'), arg('value', 'string') ],
        func: ([ { value: path }, { value } ]) => {
            fs.appendFileSync(path, value);
            return { type: 'null' };
        }
    }),

    CreateDirectory: internalizeFunction({
        arguments: [ arg('path', 'string'), arg('recursive', 'boolean') ],
        func: ([ { value: path }, { value: recursive } ]) => {
            fs.mkdirSync(path, { recursive });
            return { type: 'null' };
        }
    }),
    CreateFile: internalizeFunction({
        arguments: [ arg('path', 'string') ],
        func: ([ { value: path } ]) => {
            if (fs.existsSync(path)) throw new Error('FS: file already exists');
            fs.writeFileSync(path, '');
            return { type: 'null' };
        }
    }),

    List: internalizeFunction({
        arguments: [ arg('path', 'string') ],
        func: ([ { value: path } ]) => ({
            type: 'array',
            elements: fs.readdirSync(path).map(internalizeValue),
            variableType: {
                type: 'Identifier',
                name: 'string'
            }
        })
    }),

    Delete: internalizeFunction({
        arguments: [ arg('path', 'string'), arg('recursive', 'boolean') ],
        func: ([ { value: path }, { value: recursive } ]) => {
            fs.rmSync(path, { recursive });
            return { type: 'null' };
        }
    }),
    Copy: internalizeFunction({
        arguments: [ arg('from', 'string'), arg('to', 'string') ],
        func: ([ { value: from }, { value: to } ]) => {
            fs.cpSync(from, to);
            return { type: 'null' };
        }
    }),
    Move: internalizeFunction({
        arguments: [ arg('from', 'string'), arg('to', 'string') ],
        func: ([ { value: from }, { value: to } ]) => {
            fs.cpSync(from, to);
            fs.rmSync(from, { recursive: true });
            return { type: 'null' };
        }
    })
} satisfies Record<string, KindedValue>;