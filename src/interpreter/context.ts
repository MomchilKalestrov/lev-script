export class Context {
    private _parent: Context | undefined;
    
    public map: Map<string, KindedValue> = new Map();

    constructor(parent?: Context) {
        this._parent = parent;
    };

    public get(key: string): Value {
        const value = this.map.get(key)?.value ?? this._parent?.get(key);
        if (!value) throw new Error(`Runtime error: no identifier with the name ${ key } found`);
        return value;
    }

    private _setFunction(key: string, value: FunctionValue) {
        const previous = this.map.get(key);

        if (!previous)
            return this.map.set(key, {
                value,
                kind: 'fn'
            });
        
        if (previous.kind !== 'fn' || previous.value.type !== 'function')
            throw new Error(`Runtime error: ${ key } exists, but is ${ previous.value.type }`);

        const hasDuplicates = previous.value.overloads.every(signature => {
            !signature.arguments.every(
                (arg, i) => arg.variableType === value.overloads[ 0 ].arguments[ i ].variableType
            )
        });

        if (hasDuplicates) throw new Error('Runtime error: duplicate overload signatures found');

        previous.value.overloads.push(value.overloads[ 0 ]);
    }

    public set(key: string, value: Value) {
        if (key === 'this')
            throw new Error('Runtime error: cannot reassign the "this" variable');

        if (!this.map.has(key))
            if (this._parent)
                return void this._parent.set(key, value);
            else
                throw new Error('Runtime error: cannot find ' + key);
                
        // code duplication with `src/interpreter/interpreter.ts`
        // I have to find a way to remove the duplication
        const original = this.map.get(key)!;
        
        if (original.kind !== 'var')
            throw new Error(`Runtime error: cannot reassign ${ original.kind }`);
        
        // verifying the types
        const valueType = value.type === 'object' ? value.instanceof.name : value.type;
        const originalType = original.value.type === 'object' ? original.value.instanceof : original.value.type;
        
        if (valueType !== originalType)
            throw new Error(`Runtime error: cannot assign a value of type ${ valueType } to a variable of type ${ originalType }`);

        this.map.set(key, {
            value,
            kind: 'var' // if it's reassignable, it's a var
        });
    }

    public add(key: string, value: KindedValue) {
        if (value.kind === 'fn') this._setFunction(key, value.value as FunctionValue);

        if (this.map.get(key))
            throw new Error('Runtime error: redefinition of ' + key);

        this.map.set(key, value);
    }
}