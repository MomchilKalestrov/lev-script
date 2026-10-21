const arg = (name: string, type: string): TypedIdentifier => ({
    type: 'TypedIdentifier', name, variableType: type
});

export const box = (value: Value): Record<string, KindedValue> => {
    switch (value.type) {
        case 'string':
            return {
                length: {
                    kind: 'const',
                    value: {
                        type: 'number',
                        value: value.value.length
                    }
                },
                substring: {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('start', 'number'), arg('end', 'number') ],
                            func: args => {
                                const start = args[ 0 ] as NumberValue;
                                const end = args[ 1 ] as NumberValue;

                                return {
                                    type: 'string',
                                    value: value.value.substring(start.value, end.value)
                                };
                            }
                        } ]
                    }
                },
                '__add__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [
                            {
                                arguments: [ arg('num', 'number') ],
                                func: args => {
                                    const num = args[ 0 ] as NumberValue;

                                    return {
                                        type: 'string',
                                        value: value.value + num.value.toString()
                                    };
                                }
                            },
                            {
                                arguments: [ arg('bool', 'boolean') ],
                                func: args => {
                                    const bool = args[ 0 ] as BooleanValue;

                                    return {
                                        type: 'string',
                                        value: value.value + bool.value.toString()
                                    };
                                }
                            },
                            {
                                arguments: [ arg('str', 'string') ],
                                func: args => {
                                    const str = args[ 0 ] as StringValue;

                                    return {
                                        type: 'string',
                                        value: value.value + str.value
                                    };
                                }
                            }
                        ]
                    }
                },
                '__eq__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('str', 'string') ],
                            func: args => {
                                const str = args[ 0 ] as StringValue;
                                return {
                                    type: 'boolean',
                                    value: value.value === str.value
                                }
                            }
                        } ]
                    }
                },
                '__neq__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('str', 'string') ],
                            func: args => {
                                const str = args[ 0 ] as StringValue;
                                return {
                                    type: 'boolean',
                                    value: value.value !== str.value
                                }
                            }
                        } ]
                    }
                },
                '__index__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('index', 'number') ],
                            func: args => {
                                const index = args[ 0 ] as NumberValue;
                                return {
                                    type: 'string',
                                    value: value.value[ index.value ]
                                }
                            }
                        } ]
                    }
                },
                '__not__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [],
                            func: () => {
                                return {
                                    type: 'boolean',
                                    value: value.value.length !== 0
                                }
                            }
                        } ]
                    }
                }
            };
        case 'number':
            return {
                '__add__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [
                            {
                                arguments: [ arg('num', 'number') ],
                                func: args => {
                                    const num = args[ 0 ] as NumberValue;
                                    return {
                                        type: 'number',
                                        value: value.value + num.value
                                    };
                                }
                            },
                            {
                                arguments: [ arg('str', 'string') ],
                                func: args => {
                                    const str = args[ 0 ] as StringValue;
                                    return {
                                        type: 'string',
                                        value: value.value + str.value
                                    };
                                }
                            }
                        ]
                    }
                },
                '__sub__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('num', 'number') ],
                            func: args => {
                                const num = args[ 0 ] as NumberValue;
                                return {
                                    type: 'number',
                                    value: value.value - num.value
                                };
                            }
                        } ]
                    }
                },
                '__mul__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('num', 'number') ],
                            func: args => {
                                const num = args[ 0 ] as NumberValue;
                                return {
                                    type: 'number',
                                    value: value.value * num.value
                                };
                            }
                        } ]
                    }
                },
                '__div__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('num', 'number') ],
                            func: args => {
                                const num = args[ 0 ] as NumberValue;
                                return {
                                    type: 'number',
                                    value: value.value / num.value
                                };
                            }
                        } ]
                    }
                },
                '__mod__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('num', 'number') ],
                            func: args => {
                                const num = args[ 0 ] as NumberValue;
                                return {
                                    type: 'number',
                                    value: value.value % num.value
                                };
                            }
                        } ]
                    }
                },
                '__eq__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('num', 'number') ],
                            func: args => {
                                const num = args[ 0 ] as NumberValue;
                                return {
                                    type: 'boolean',
                                    value: value.value === num.value
                                };
                            }
                        } ]
                    }
                },
                '__neq__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('num', 'number') ],
                            func: args => {
                                const num = args[ 0 ] as NumberValue;
                                return {
                                    type: 'boolean',
                                    value: value.value !== num.value
                                };
                            }
                        } ]
                    }
                },
                '__lt__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('num', 'number') ],
                            func: args => {
                                const num = args[ 0 ] as NumberValue;
                                return {
                                    type: 'boolean',
                                    value: value.value < num.value
                                };
                            }
                        } ]
                    }
                },
                '__gt__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('num', 'number') ],
                            func: args => {
                                const num = args[ 0 ] as NumberValue;
                                return {
                                    type: 'boolean',
                                    value: value.value > num.value
                                };
                            }
                        } ]
                    }
                },
                '__lte__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('num', 'number') ],
                            func: args => {
                                const num = args[ 0 ] as NumberValue;
                                return {
                                    type: 'boolean',
                                    value: value.value <= num.value
                                };
                            }
                        } ]
                    }
                },
                '__gte__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('num', 'number') ],
                            func: args => {
                                const num = args[ 0 ] as NumberValue;
                                return {
                                    type: 'boolean',
                                    value: value.value >= num.value
                                };
                            }
                        } ]
                    }
                },
                '__shl__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('num', 'number') ],
                            func: args => {
                                const num = args[ 0 ] as NumberValue;
                                return {
                                    type: 'number',
                                    value: value.value << num.value
                                };
                            }
                        } ]
                    }
                },
                '__shr__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('num', 'number') ],
                            func: args => {
                                const num = args[ 0 ] as NumberValue;
                                return {
                                    type: 'number',
                                    value: value.value >> num.value
                                };
                            }
                        } ]
                    }
                },
                '__band__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('num', 'number') ],
                            func: args => {
                                const num = args[ 0 ] as NumberValue;
                                return {
                                    type: 'number',
                                    value: value.value & num.value
                                };
                            }
                        } ]
                    }
                },
                '__bor__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('num', 'number') ],
                            func: args => {
                                const num = args[ 0 ] as NumberValue;
                                return {
                                    type: 'number',
                                    value: value.value | num.value
                                };
                            }
                        } ]
                    }
                },
                '__xor__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('num', 'number') ],
                            func: args => {
                                const num = args[ 0 ] as NumberValue;
                                return {
                                    type: 'number',
                                    value: value.value ^ num.value
                                };
                            }
                        } ]
                    }
                },
                '__not__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [],
                            func: () => {
                                return {
                                    type: 'boolean',
                                    value: value.value !== 0
                                };
                            }
                        } ]
                    }
                },
                '__neg__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [],
                            func: () => {
                                return {
                                    type: 'number',
                                    value: -value.value
                                }
                            }
                        } ]
                    }
                }
            };
        case 'boolean':
            return {
                '__eq__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('bool', 'boolean') ],
                            func: args => {
                                const bool = args[ 0 ] as BooleanValue;
                                return {
                                    type: 'boolean',
                                    value: value.value === bool.value
                                };
                            }
                        } ]
                    }
                },
                '__neq__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('bool', 'boolean') ],
                            func: args => {
                                const bool = args[ 0 ] as BooleanValue;
                                return {
                                    type: 'boolean',
                                    value: value.value !== bool.value
                                };
                            }
                        } ]
                    }
                },
                '__not__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [],
                            func: () => {
                                return {
                                    type: 'boolean',
                                    value: !value.value
                                };
                            }
                        } ]
                    }
                }
            };
        case 'array':
            return {
                length: {
                    kind: 'const',
                    value: {
                        type: 'number',
                        value: value.elements.length
                    }
                },
                '__index__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('index', 'number') ],
                            func: args => {
                                const index = args[ 0 ] as NumberValue;
                                return value.elements[ index.value ];
                            }
                        } ]
                    }
                },
                '__index_set__': {
                    kind: 'fn',
                    value: {
                        type: 'internal',
                        overloads: [ {
                            arguments: [ arg('index', 'number'), arg('value', value.variableType.name) ],
                            func: args => {
                                const index = args[ 0 ] as NumberValue;
                                const v = args[ 1 ];

                                value.elements[ index.value ] = v;

                                return { type: 'null' };
                            }
                        } ]
                    }
                }
            };
        case 'null':
        case 'internal':
        case 'function':
        case 'object':
            throw new Error(`Runtime error: cannot box type ${ value.type }`);
    }
};



export const toObject = (value: Value): ObjectValue => {
    if (value.type === 'object') return value;

    return {
        type: 'object',
        fields: new Map(Object.entries(box(value))),
        instanceof: {
            type: 'Identifier',
            name: value.type.charAt(0).toUpperCase() + value.type.substring(1)
        },
        this: {} as any // it's not fatal if the context is empty, as it's never used in the boxes
    };
};