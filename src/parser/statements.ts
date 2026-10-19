import { parseExpression } from './expressions.ts';

declare global {
    type IfStatement = {
        type: 'IfStatement';
        condition: Expression;
        consequence: Statement;
        alternative: Statement | null;
    };

    type WhileStatement = {
        type: 'WhileStatement';
        init: Statement;
        condition: Expression;
        update: Statement;
        body: Statement;
    };

    type ReturnStatement = {
        type: 'ReturnStatement';
        value: Expression | null;
    }

    type BodyStatement = {
        type: 'BodyStatement';
        body: Statement[];
    };

    type VariableDeclaration = {
        type: 'VariableDeclaration';
        id: TypedIdentifier;
        init: Expression | null;
        kind: 'const' | 'var';
    };

    type FunctionDeclaration = {
        type: 'FunctionDeclaration';
        id: Identifier;
        init: FunctionExpression;
    };

    type ExpressionStatement = {
        type: 'ExpressionStatement';
        expression: Expression;
    };

    type Statement =
        | BodyStatement      
        | VariableDeclaration
        | IfStatement        
        | WhileStatement     
        | ExpressionStatement
        | FunctionDeclaration
        | ReturnStatement;
};

const parseBodyStatement = (tokenStream: LexerTokenStream): BodyStatement => {
    tokenStream.consume('BRACKET_L');

    let body: Statement[] = [];

    while (tokenStream.current?.type !== 'BRACKET_R')
        body.push(parseStatement(tokenStream));
    tokenStream.consume('BRACKET_R');
    
    return {
        type: 'BodyStatement',
        body
    };
}

const parseVariableDeclaration = (tokenStream: LexerTokenStream): VariableDeclaration => {
    const kind = tokenStream.consume('CONST', 'VAR');
    const name = tokenStream.consume('IDENT');    
    tokenStream.consume('COLON');
    const type = tokenStream.consume('IDENT');

    const decl: VariableDeclaration = {
        type: 'VariableDeclaration',
        id: {
            type: 'TypedIdentifier',
            name: name.value,
            variableType: type.value
        },
        init: null,
        kind: kind.value as VariableDeclaration[ 'kind' ]
    };

    if (tokenStream.current?.type === 'EQ') {
        tokenStream.consume('EQ');
        decl.init = parseExpression(tokenStream);
    };

    tokenStream.consume('SEMICOLON');
    return decl;
}

const parseIfStatement = (tokenStream: LexerTokenStream): IfStatement => {
    tokenStream.consume('IF');
    
    let statement: Partial<IfStatement> = { type: 'IfStatement' };
    statement.condition = parseExpression(tokenStream);
    statement.consequence = parseStatement(tokenStream);

    if (tokenStream.current?.type === 'ELSE') {
        tokenStream.consume('ELSE');
        statement.alternative = parseStatement(tokenStream);
    } else
        statement.alternative = null;
    
    return statement as IfStatement;
};

const parseWhileStatement = (tokenStream: LexerTokenStream): WhileStatement => {
    tokenStream.consume('WHILE');
    
    let statement: Partial<WhileStatement> = { type: 'WhileStatement' };
    statement.condition = parseExpression(tokenStream);
    statement.body = parseStatement(tokenStream);

    return statement as WhileStatement;
};

const parseReturnStatement = (tokenStream: LexerTokenStream): ReturnStatement => {
    tokenStream.consume('RET');

    let statement: Partial<ReturnStatement> = { type: 'ReturnStatement' };

    if (tokenStream.current?.type !== 'SEMICOLON')
        statement.value = parseExpression(tokenStream);

    tokenStream.consume('SEMICOLON');
    return statement as ReturnStatement;
};

const parseFunctionStatement = (tokenStream: LexerTokenStream): FunctionDeclaration => {
    tokenStream.consume('FN');
    const name = tokenStream.consume('IDENT');
    tokenStream.consume('EQ');

    const init = parseExpression(tokenStream);
    if (init.type !== 'FunctionExpression')
        throw new Error(`Parse error: cannot assign an expression of type ${ init.type } to a FunctionDeclaration`);

    tokenStream.consume('SEMICOLON');
    return {
        type: 'FunctionDeclaration',
        id: {
            type: 'Identifier',
            name: name.value
        },
        init
    } satisfies FunctionDeclaration;
};

export const parseStatement = (tokenStream: LexerTokenStream): Statement => {
    switch(tokenStream.current?.type) {
        case 'VAR':
        case 'CONST':
            return parseVariableDeclaration(tokenStream);
        case 'FN':
            return parseFunctionStatement(tokenStream);
        case 'WHILE':
            return parseWhileStatement(tokenStream);
        case 'IF':
            return parseIfStatement(tokenStream);
        case 'BRACKET_L':
            return parseBodyStatement(tokenStream);
        case 'RET':
            return parseReturnStatement(tokenStream);
        default:
            const expression = parseExpression(tokenStream);
            tokenStream.consume('SEMICOLON');
            return {
                type: 'ExpressionStatement',
                expression
            } satisfies ExpressionStatement;
    };
};