import { tokens } from './tokens.ts';

declare global {
    type LexerTokenStream = {
        assert: (token: Token[ 'type' ]) => void;
        consume: (...tokens: Token[ 'type' ][]) => Token;
        dequeue: () => Token | undefined;
        current: Token | undefined;
        tokens: Token[];
        at: number;
    };

    type Token = {
        type: (keyof typeof tokens) | 'IDENT' | 'STRING' | 'NUMBER' | 'EOF';
        value: string;
    };
};

export {};