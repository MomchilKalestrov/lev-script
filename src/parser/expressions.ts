import { parseStatement } from './statements.ts';

declare global {
    type AssignmentExpression = {
        type: 'AssignmentExpression';
        id: Identifier | MemberExpression | IndexExpression;
        value: Expression;
    }

    type IndexExpression = {
        type: 'IndexExpression';
        object: Expression;
        index: Expression;
    }

    type TernaryExpression = {
        type: 'TernaryExpression';
        condition: Expression;
        consequence: Expression;
        alternative: Expression;
    }

    type CallExpression = {
        type: 'CallExpression';
        callee: Expression;
        arguments: Expression[];
    };

    type MemberExpression = {
        type: 'MemberExpression';
        object: Expression;
        property: Identifier;
    };

    type UnaryExpression = {
        type: 'UnaryExpression';
        expression: Expression;
        operator: string;
    };

    type BinaryExpression = {
        type: 'BinaryExpression';
        left: Expression;
        operator: string;
        right: Expression;
    };

    type FunctionExpression = {
        type: 'FunctionExpression';
        arguments: TypedIdentifier[];
        body: Statement;
        returns: Identifier;
    };

    type Expression = 
        | AssignmentExpression 
        | IndexExpression      
        | TernaryExpression    
        | FunctionExpression   
        | BinaryExpression     
        | UnaryExpression      
        | CallExpression       
        | MemberExpression     
        | Identifier           
        | Literal;
}

const parseFunctionExpression = (tokenStream: LexerTokenStream): FunctionExpression => {
    tokenStream.consume('PAREN_L');

    let args: TypedIdentifier[] = [];
    if (tokenStream.current?.type === 'IDENT')
        //@ts-ignore
        while (tokenStream.current?.type !== 'PAREN_R') {
            let arg: Partial<TypedIdentifier> = {
                type: 'TypedIdentifier',
                name: tokenStream.consume('IDENT').value
            };
            tokenStream.consume('COLON');
            arg.variableType = tokenStream.consume('IDENT').value;
            args.push(arg as TypedIdentifier);
            
            if (tokenStream.tokens[ tokenStream.at ].type === 'COMMA') {
                tokenStream.dequeue();
                tokenStream.assert('IDENT');
            }
        }
    
    tokenStream.consume('PAREN_R');
    tokenStream.consume('COLON');
    let returns = tokenStream.consume('IDENT')?.value;
    tokenStream.consume('ARROW');

    let body = parseStatement(tokenStream);
    
    return {
        type: 'FunctionExpression',
        arguments: args,
        body,
        returns: {
            type: 'Identifier',
            name: returns
        }
    } satisfies FunctionExpression;
}

const parseLiteral = (tokenStream: LexerTokenStream) => {
    const map: Record<string, Literal[ 'valueType' ]> = {
        TRUE: 'boolean',
        FALSE: 'boolean',
        STRING: 'string',
        NUMBER: 'number'
    };

    const token = tokenStream.dequeue()!;

    return {
        type: 'Literal',
        value: token.value,
        valueType: map[ token.type ]
    } satisfies Literal;
};

const parsePrimaryExpression = (tokenStream: LexerTokenStream): Expression => {
    let token: Token;

    switch (tokenStream.current?.type) {
        case 'TRUE':
        case 'FALSE':
        case 'STRING':
        case 'NUMBER':
            return parseLiteral(tokenStream);
        case 'LG_NOT':
        case 'MINUS':
            token = tokenStream.dequeue()!;
            return {
                type: 'UnaryExpression',
                expression: parsePrimaryExpression(tokenStream),
                operator: token?.value
            } satisfies UnaryExpression;
        case 'PAREN_L':
            // first check if it's a function declaration
            const followingTokens = tokenStream.tokens.slice(tokenStream.at + 1);
            if (
                (
                    followingTokens[ 0 ].type === 'IDENT' ||
                    followingTokens[ 0 ].type === 'PAREN_R'
                ) &&
                followingTokens[ 1 ].type === 'COLON'
            ) {
                // it's either a ():... -> a function with no arguments
                // or (<ident>:... -> a function with arguments
                return parseFunctionExpression(tokenStream);
            };
            tokenStream.consume('PAREN_L');
            const expr = parseExpression(tokenStream);
            tokenStream.consume('PAREN_R');
            return expr;
        case 'IDENT':
            token = tokenStream.consume('IDENT');
            return {
                type: 'Identifier',
                name: token.value
            } satisfies Identifier;
        default:
            throw new Error('GLHF');
    };
};

const parseMemberExpression = (tokenStream: LexerTokenStream, object: Expression): MemberExpression => {
    tokenStream.consume('DOT');
    const property = tokenStream.consume('IDENT').value;
    return {
        type: 'MemberExpression',
        object,
        property: {
            type: 'Identifier',
            name: property
        }
    } satisfies MemberExpression;
};

const parseCallExpression = (tokenStream: LexerTokenStream, callee: Expression): CallExpression => {
    tokenStream.consume('PAREN_L')
    const args: Expression[] = []
    
    while (tokenStream.current?.type !== 'PAREN_R') {
        args.push(parseExpression(tokenStream));
        if (tokenStream.current?.type === 'COMMA')
            tokenStream.dequeue();
    };
    
    tokenStream.consume('PAREN_R');
    return {
        type: 'CallExpression',
        callee,
        arguments: args
    } satisfies CallExpression;
};

const parseIndexExpression = (tokenStream: LexerTokenStream, object: Expression): IndexExpression => {
    tokenStream.consume('SQ_PAREN_L');
    const index = parseExpression(tokenStream);
    tokenStream.consume('SQ_PAREN_R');

    return {
        type: 'IndexExpression',
        object,
        index
    } satisfies IndexExpression;
};

const parseTernaryExpression = (tokenStream: LexerTokenStream, condition: Expression): TernaryExpression => {
    tokenStream.consume('QUESTION');
    const consequence = parseExpression(tokenStream);
    tokenStream.consume('COLON');
    const alternative = parseExpression(tokenStream);

    return {
        type: 'TernaryExpression',
        condition,
        consequence,
        alternative
    } satisfies TernaryExpression;
};

const precedenceTable: Record<string, number> = {
    '||': 1,
    '&&': 2,
    '|':  3,
    '^':  4,
    '&':  5,
    '==': 6, '!=': 6,
    '<':  7, '>': 7, '<=': 7, '>=': 7,
    '<<': 8, '>>': 8,
    '+':  9, '-': 9,
    '*':  10, '/': 10, '%': 10
};

export const parseExpression = (tokenStream: LexerTokenStream, minPrecedence: number = 0): Expression => {
    let left: Expression = parsePrimaryExpression(tokenStream);

    loop: while (true) {
        switch (tokenStream.current?.type) {
            case 'EQ':
                if (
                    left.type !== 'Identifier' &&
                    left.type !== 'MemberExpression' &&
                    left.type !== 'IndexExpression'
                )
                    throw new Error(`Cannot assing a value to a ${ left.type }.`);
                tokenStream.consume('EQ');

                left = {
                    type: 'AssignmentExpression',
                    id: left,
                    value: parseExpression(tokenStream)
                } satisfies AssignmentExpression;
                break;
            case 'PAREN_L':
                left = parseCallExpression(tokenStream, left);
                break;
            case 'SQ_PAREN_L':
                left = parseIndexExpression(tokenStream, left);
                break;
            case 'DOT':
                left = parseMemberExpression(tokenStream, left);
                break;
            case 'QUESTION':
                left = parseTernaryExpression(tokenStream, left);
                break;
            default:
                const op = tokenStream.current!;
                const precedence = precedenceTable[ op.value ];
                if (precedence === undefined || precedence <= minPrecedence) break loop;
                tokenStream.dequeue();
                const right = parseExpression(tokenStream, precedence);
                left = {
                    type: 'BinaryExpression',
                    operator: op.value,
                    left,
                    right
                } satisfies Expression;
                break;
        };
    };

    return left;
};