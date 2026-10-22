export const set = (map: Map<string, KindedValue>, key: string, value: Value) => {
    const original = map.get(key);

    if (!original)
        throw new Error(`Runtime error: no member with the name ${ key } found`);

    if (original.kind !== 'var')
        throw new Error(`Runtime error: cannot reassign ${ original.kind }`);
    
    // verifying the types
    const valueType = value.type === 'object' ? value.instanceof.name : value.type;
    const originalType = original.type === 'object' ? original.instanceof.name : original.type;
    
    if (valueType !== originalType)
        throw new Error(`Runtime error: cannot assign a value of type ${ valueType } to type ${ originalType }`);

    map.set(key, { ...value, kind: 'var' });
};