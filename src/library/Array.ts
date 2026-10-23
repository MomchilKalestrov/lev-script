import { hasType } from '../interpreter/typeDB';
import { arg, internalizeFunction } from '../lib/internalize';

export default {
    Allocate: internalizeFunction({
        arguments: [ arg('length', 'number'), arg('type', 'string') ],
        func: ([ { value: length }, { value: type } ]) => {
            if (!hasType(type))
                throw new Error(`Runtime error: cannot find type ${ type }`);
            
            return {
                type: 'array',
                elements: Array.from({ length }),
                variableType: { 
                    type: 'Identifier',
                    name: type
                }
            } satisfies ArrayValue;
        }
    })
} satisfies Record<string, KindedValue>;