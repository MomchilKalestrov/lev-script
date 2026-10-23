import Console from './Console';
import Math from './Math';
import Parse from './Parse';
import Array from './Array';
import FS from './FS';

export default Object.entries({
    Console, Math, Parse, Array, FS
}).map(([ key, value ]) => [
    key,
    {
        type: 'object',
        fields: new Map(Object.entries(value)),
        kind: 'const',
        this: {} as any,
        instanceof: {
            type: 'Identifier',
            name: key
        }
    } satisfies KindedValue
]) satisfies [ string, KindedValue ][];