import { tokens } from './tokens.ts';

const IDENTITY_REGEX = /[A-Za-z0-9_]/;
const NUMERIC_REGEX = /[0-9.]/;

// to avoid the lexer returning early
// (for example returning `>` while the actual token is `>=`)
// we need to do a greedy search and
// the easiest way to do that is to
// sort all tokens from longest to
// shortest
const sortedTokens = Object.entries(tokens).sort(([ , a ], [ , b ]) => b.length - a.length);

const getToken = (string: string, offset: number): Token | null => {
    for (const [ key, value ] of sortedTokens)
        if ([ ...value ].every((c, i) => string[ i + offset ] === c))
            return { type: key as Token[ 'type' ], value };
    return null;
}

const getString = (string: string, offset: number): string => {
    for (let i = offset + 1; i < string.length; i++) {
        if (string[ i ] === '"' && string[ i - 1 ] !== '\\') {
            return string.substring(offset + 1, i);
        }
    }
    throw new Error('Could not get the end of the string at ' + offset);
}

const getEndOfToken = (string: string, offset: number): string => {
    let regex = NUMERIC_REGEX.test(string[ offset ]) ? NUMERIC_REGEX : IDENTITY_REGEX;
    let end = offset;
    while (regex.test(string[ end ]) && string[ end ] !== undefined) end++;

    return string.substring(offset, end);
}

export const tokenize = (string: string) => {
    const tokens: Token[] = [];

    for (let i = 0; i < string.length; i++) {
        const token = getToken(string, i);

        if (token !== null) {
            tokens.push(token);
            i += token.value.length - 1;
        } else if (string[ i ] === '"') {
            const value = getString(string, i);
            tokens.push({ type: 'STRING', value });
            i += value.length + 1;

        } else if (IDENTITY_REGEX.test(string[ i ])) {
            const value = getEndOfToken(string, i);
            tokens.push({
                type: NUMERIC_REGEX.test(value[ 0 ]) ? 'NUMBER' : 'IDENT',
                value
            });
            i += value.length - 1;
        } else if (string[ i ] === '#') {
            const commentEnd = string.indexOf('\n', i);
            i = commentEnd === -1 ? string.length : commentEnd;
        }
    }

    tokens.push({
        type: 'EOF',
        value: ''
    });

    let queueCounter = 0;

    const obj: LexerTokenStream = {
        assert: tokenType => {
            if (obj.current?.type !== tokenType)
                throw new Error(`Expected token ${ tokenType }, but instead got ${ obj.current?.type }.`);
        },
        consume: (...tokenTypes) => {
            const token = obj.dequeue();
            if (!tokenTypes.includes(token?.type!))
                throw new Error(`Expected token ${ tokenTypes.join(', ') }, but instead got ${ token?.type }.`);
            return token!;
        },
        dequeue: () => tokens[ queueCounter++ ],
        get current() { return tokens[ queueCounter ]; },
        get tokens() { return tokens; },
        get at() { return queueCounter; }
    };

    return obj;
}