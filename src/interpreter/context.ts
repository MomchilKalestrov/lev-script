import { set } from '../lib/set.ts';

export class Context {
    private _parent: Context | undefined;
    
    public map: Map<string, KindedValue> = new Map();

    constructor(parent?: Context) {
        this._parent = parent;
    };

    public get(key: string): Value {
        const value = this.map.get(key) ?? this._parent?.get(key);
        if (!value) throw new Error(`Runtime error: no identifier with the name ${ key } found`);
        return value;
    }

    private _setFunction(key: string, value: FunctionValue) {
        const previous = this.map.get(key);

        if (!previous)
            return this.map.set(key, {
                ...value,
                kind: 'fn'
            });
        
        if (previous.kind !== 'fn' || previous.type !== 'function')
            throw new Error(`Runtime error: ${ key } exists, but is ${ previous.type }`);

        const hasDuplicates = previous.overloads.every(signature => {
            !signature.arguments.every(
                (arg, i) => arg.variableType === value.overloads[ 0 ].arguments[ i ].variableType
            )
        });

        if (hasDuplicates) throw new Error('Runtime error: duplicate overload signatures found');

        previous.overloads.push(value.overloads[ 0 ]);
    }

    public set(key: string, value: Value) {
        if (key === 'this')
            throw new Error('Runtime error: cannot reassign the "this" variable');

        if (!this.map.has(key))
            if (this._parent)
                return void this._parent.set(key, value);
            else
                throw new Error('Runtime error: cannot find ' + key);
        
        set(this.map, key, value);
    }

    public add(key: string, value: KindedValue) {
        if (value.kind === 'fn') this._setFunction(key, value as FunctionValue);

        if (this.map.get(key))
            throw new Error('Runtime error: redefinition of ' + key);

        this.map.set(key, value);
    }
}