import { parseStatement } from './statements';

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

export const parse = (tokenStream: LexerTokenStream): Statement[] => {
    const statements: Statement[] = [];
    
    while (tokenStream.current?.type !== 'EOF')
        statements.push(parseStatement(tokenStream));

    return statements;
}