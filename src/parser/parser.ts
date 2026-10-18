import { parseStatement } from './statements.ts';

declare global {
    type Identifier = {
        type: 'Identifier';
        name: string;
    };

    type TypedIdentifier = {
        type: 'TypedIdentifier';
        name: string;
        variableType: string;
    };

    type Literal = {
        type: 'Literal';
        value: string;
        valueType: 'string' | 'boolean' | 'number';
    }
};

export const parse = (tokenStream: LexerTokenStream) => {
    const statements: Statement[] = [];
    
    while (tokenStream.current?.type !== 'EOF')
        statements.push(parseStatement(tokenStream));

    return statements;
}