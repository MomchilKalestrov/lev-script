import { Context } from './context.ts';
import { evaluateExpression, evaluateFunctionExpression } from './expressions.ts';
import { hasType, newType } from './typeDB.ts';

export const evaluateBodyStatement = (statement: BodyStatement, context: Context): Value | void => {
    const subContext = new Context(context);
    for (const s of statement.body) {
        const result = evaluateStatement(s, subContext);
        if (result) return result;
    }
};

export const evaluateFunctionDeclaration = (statement: FunctionDeclaration, context: Context): void => {
    const func = evaluateFunctionExpression(statement.init, context);
    context.add(statement.id.name, func);
};

export const evaluateIfStatement = (statement: IfStatement, context: Context): Value | void => {
    const condition = evaluateExpression(statement.condition, context);
    if (condition.type !== 'boolean')
        throw new Error('Runtime error: if statement requires a boolean value for the condition');

    if (condition.value)
        return evaluateStatement(statement.consequence, context);
    else if (statement.alternative)
        return evaluateStatement(statement.alternative, context);
};

export const evaluateReturnStatement = (statement: ReturnStatement, context: Context): Value =>
    statement.value ? evaluateExpression(statement.value, context) : { type: 'null' };

export const evaluateVariableDeclaration = (statement: VariableDeclaration, context: Context): void => {
    const value: Value = evaluateExpression(statement.init, context);

    if (statement.id.variableType === 'void')
        throw new Error('Runtime error: cannot use type void for variables');

    if (!hasType(statement.id.variableType))
        throw new Error(`Runtime error: cannot find type ${ statement.id.variableType }`);

    const valueType = value.type === 'object' ? value.instanceof.name : value.type;
    if (valueType !== statement.id.variableType)
        throw new Error(`Runtime error: cannot assign a value of type ${ valueType } to a variable of type ${ statement.id.variableType }`);

    context.add(statement.id.name, value);
};

export const evaluateWhileStatement = (statement: WhileStatement, context: Context): Value | void => {
    while (true) {
        const condition = evaluateExpression(statement.condition, context);
        if (condition.type !== 'boolean')
            throw new Error('Runtime error: while statement requires a boolean value for the condition');
        
        if (condition.value)
            evaluateStatement(statement.body, context);
        else return;
    }
};

export const evaluateTypeDeclaration = (statement: TypeDeclaration, context: Context): void => {
    newType(statement.id.name, {
        fields: statement.fields,
        clojure: context
    });
};

export const evaluateStatement = (statement: Statement, context: Context, isTopLevel: boolean = false): Value | void => {
    switch (statement.type) {
        case 'BodyStatement':
            return evaluateBodyStatement(statement, context);
        case 'ExpressionStatement':
            return evaluateExpression(statement.expression, context);
        case 'FunctionDeclaration':
            return evaluateFunctionDeclaration(statement, context);
        case 'IfStatement':
            return evaluateIfStatement(statement, context);
        case 'ReturnStatement':
            return evaluateReturnStatement(statement, context);
        case 'VariableDeclaration':
            return evaluateVariableDeclaration(statement, context);
        case 'WhileStatement':
            return evaluateWhileStatement(statement, context);
        case 'TypeDeclaration':
            if (!isTopLevel) throw new Error('Runtime error: TypeDeclaration is a top-level statement only');
            return evaluateTypeDeclaration(statement, context);
    }
};