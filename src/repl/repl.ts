import core from '../library/core';
import { get } from './multilineEdit';
import { tokenize } from '../lexer/lexer';
import { Context } from '../interpreter/context';
import { parseStatement } from '../parser/statements';
import { internalizeValue } from '../lib/internalize';
import { callObjectMember } from '../interpreter/interpreter';
import { evaluateStatement } from '../interpreter/statements';
import { evaluateExpression } from '../interpreter/expressions';

const fromValueToString = (value: Value, indent: number = 0): string => {
    switch (value.type) {
        case 'array':
            return `[ ${ value.elements.map(elem => fromValueToString(elem)).join(', ') } ]`;
        case 'function':
            return value.overloads.map(({ arguments: args, returns }) =>
                `(${ args.map(({ name, variableType }) =>
                    `${ name }: ${ variableType }`
                ) }): ${ returns.name }`
            ).join('\n');
        case 'boolean':
        case 'number':
            return value.value.toString();
        case 'string':
            return `"${ value.value }"`;
        case 'null':
            return 'null';
        case 'internal':
            return `<internal>`;
        case 'object':
            return `${ value.instanceof.name } = {\n${
                [ ...value.fields ].map(([ key, value ]) =>
                    `${ ''.padEnd(indent + 1, ' ') }${ key } = ${ fromValueToString(value, indent + 1) }`
                ).join('\n')
            }\n}`;
    }
}

export const repl = () => {
    console.log(`Welcome to the Lev-script ${ global.VERSION } REPL shell.`);
    console.log('Press CTRL+C to exit.');
    console.log('Press CTRL+X to run the typed-in script.');

    return new Promise<void>(async resolve => {
        process.stdin.on('keypress', function handler(c, k) {
            if (k.sequence !== '\x03') return;

            process.stdin.off('keypress', handler);
            console.log(); // add a newline so the last thing printed doesn't get overwritten

            resolve();
        })

        const context = new Context();
        
        core.forEach(([ key, object ]) => context.map.set(key, object));

        repl: while (true) {
            let code = await get();
            if (code[ code.length -1  ] !== ';') code += ';';

            const tokenStream = tokenize(code);
            const statements: Statement[] = [];
            while (tokenStream.current?.type !== 'EOF')
                try {
                    statements.push(parseStatement(tokenStream));
                } catch (error) {
                    callObjectMember(
                        context.get('Console') as ObjectValue,
                        'Error',
                        [ internalizeValue(error instanceof Error ? error.message : String(error)) ],
                        context
                    );
                    continue repl;
                }

            if (statements.length === 1 && statements[ 0 ].type === 'ExpressionStatement') {
                const value = evaluateExpression(statements[ 0 ].expression, context);
                callObjectMember(
                    context.get('Console') as ObjectValue,
                    'Log',
                    [ internalizeValue(fromValueToString(value)) ],
                    context
                );
                continue repl;
            }

            evalLoop: for (const statement of statements)
                try {
                    evaluateStatement(statement, context, true);
                } catch (error) {
                    callObjectMember(
                        context.get('Console') as ObjectValue,
                        'Error',
                        [ internalizeValue(error instanceof Error ? error.message : String(error)) ],
                        context
                    );
                    break evalLoop;
                }
        }
    });
};