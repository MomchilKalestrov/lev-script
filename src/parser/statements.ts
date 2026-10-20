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
        init: Expression;
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

    type TypeDeclaration = {
        type: 'TypeDeclaration';
        id: Identifier;
        fields: (FunctionDeclaration | VariableDeclaration)[];
    };

    type Statement =
        | TypeDeclaration
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

    const decl: Partial<VariableDeclaration> = {
        type: 'VariableDeclaration',
        id: {
            type: 'TypedIdentifier',
            name: name.value,
            variableType: type.value
        },
        kind: kind.value as VariableDeclaration[ 'kind' ]
    };

    tokenStream.consume('EQ');
    decl.init = parseExpression(tokenStream);

    tokenStream.consume('SEMICOLON');
    return decl as VariableDeclaration;
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

const parseFunctionDeclaration = (tokenStream: LexerTokenStream): FunctionDeclaration => {
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

const parseTypeDeclaration = (tokenStream: LexerTokenStream): TypeDeclaration => {
    tokenStream.consume('TYPE');
    const name = tokenStream.consume('IDENT');
    tokenStream.consume('EQ');
    
    tokenStream.consume('BRACKET_L');

    let fields: TypeDeclaration[ 'fields' ] = [];

    while (tokenStream.current?.type !== 'BRACKET_R') {
        if (tokenStream.current?.type === 'FN')
            fields.push(parseFunctionDeclaration(tokenStream));
        else
            fields.push(parseVariableDeclaration(tokenStream));
    }
    tokenStream.consume('BRACKET_R');
    tokenStream.consume('SEMICOLON');
    
    return {
        type: 'TypeDeclaration',
        id: {
            type: 'Identifier',
            name: name.value
        },
        fields
    };
};

export const parseStatement = (tokenStream: LexerTokenStream): Statement => {
    switch(tokenStream.current?.type) {
        case 'VAR':
        case 'CONST':
            return parseVariableDeclaration(tokenStream);
        case 'FN':
            return parseFunctionDeclaration(tokenStream);
        case 'WHILE':
            return parseWhileStatement(tokenStream);
        case 'IF':
            return parseIfStatement(tokenStream);
        case 'BRACKET_L':
            return parseBodyStatement(tokenStream);
        case 'RET':
            return parseReturnStatement(tokenStream);
        case 'TYPE':
            return parseTypeDeclaration(tokenStream);
        default:
            const expression = parseExpression(tokenStream);
            tokenStream.consume('SEMICOLON');
            return {
                type: 'ExpressionStatement',
                expression
            } satisfies ExpressionStatement;
    };
};