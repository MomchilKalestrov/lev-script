export const operators = {
    PLUS: '+',
    MINUS: '-',
    MUL: '*',
    DIV: '/',
    MOD: '%',

    BIN_AND: '&',
    BIN_OR: '|',
    BIN_XOR: '^',
    BIN_SHL: '<<',
    BIN_SLR: '>>',

    LG_NEQ: '!=',
    LG_EQ: '==',
    LG_GT: '>',
    LG_LT: '<',
    LG_GTE: '>=',
    LG_LTE: '<=',
    LG_AND: '&&',
    LG_OR: '||',
    LG_NOT: '!'
}

export const tokens = {
    IF: 'if',
    ELSE: 'else',
    WHILE: 'while',
    
    NEW: 'new',
    TYPE: 'type',
    VAR: 'var',
    CONST: 'const',
    FN: 'fn',
    
    RET: 'return',
    ARROW: '=>',
    EQ: '=',
    TRUE: 'true',
    FALSE: 'false',
    
    QUESTION: '?',
    COLON: ':',
    SEMICOLON: ';',
    DOT: '.',
    COMMA: ',',

    PAREN_L: '(',
    PAREN_R: ')',
    BRACKET_L: '{',
    BRACKET_R: '}',
    SQ_PAREN_L: '[',
    SQ_PAREN_R: ']',

    ...operators
};
