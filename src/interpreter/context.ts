export class Context {
    private _parent: Context | undefined;
    
    public map: Map<string, Value> = new Map();

    constructor(parent?: Context) {
        this._parent = parent;
    };

    public get(key: string): Value {
        const value = this.map.get(key) ?? this._parent?.get(key);
        if (!value) throw new Error(`Runtime error: no identifier with the name ${ key } found`);
        return value;
    }

    private _setFunction(key: string, value: FunctionValue) {
        const previous = this.map.get(key) as FunctionValue;

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
                
        // verifying the types
        const valueType = value.type === 'object' ? value.instanceof.name : value.type;
        const originalType = this.map.get(key)!.type;
        if (valueType !== originalType)
            throw new Error(`Runtime error: cannot assign a value of type ${ valueType } to a variable of type ${ originalType }`);

        if (value.type === 'function') this._setFunction(key, value);
        
        this.map.set(key, value);
    }

    public add(key: string, value: Value = { type: 'null' }) {
        if (this.map.has(key))
            throw new Error('Runtime error: redefinition of ' + key);

        this.map.set(key, value);
    }
}