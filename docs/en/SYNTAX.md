# Syntax

## Variables

Definition:
```lv
var <name>: <type> = <init>;
```
Variables **cannot** be defined without an initial value.

Setting a value:
```lv
<name> = <value>;
```
The value must be the same as the `<type>` during definition.

There isn't a way to initialize multiple variables at once:
```lv
var <name>: <type>, <name>: <type>... # invalid!
```

## Function
Definition:
```lv
fn <name> = (<name>: <type>): <return type> => {
    # ...
};
```

Functions can be overloaded by redefining the function with a different argument
list:
```lv
fn <name> = (): <return type> => {
    # ...
};

fn <name> = (<name>: <type>): <return type> => {
    # ...
};

<name>(); # valid, calls the first function
<name>(<argument>); # also valid, calls the second function
```

The parser *technically* allows for brackets to be omitted, similarly to arrow
functions in TS, **but** the function **does not** return the value of the
expression afterwards, a `return` statement is still required for that:
```lv
# technically valid, but **will not** return the produced value
fn <name> = (): <return type> => <any statement or expression>;
```
```
# also valid and **will** return the produced value
fn <name> = (): <return type> => return <expression>;
```
This is considered an anti-pattern and should be avoided.

Using an `AssingmentExpression` on an function (i.e. `func = <new function>`)
is invalid.
```lv
fn Func = (): null => {};

Func = (): boolean => { # invalid!
    return true;
};
```

Adding overloads to a function argument inside a call is local to that call. The
new overloads are usable within it, but do not affect the original function
outside of it:
```lv
fn Func = (): null => {};

fn ModifyFunc = (F: function): boolean => {
    fn F = (a: number): null => {};

    F(); # valid
    F(1); # valid
};

ModifyFunc(Func);
Func(1); # invalid
```

## Conditionals

As of now, only `if`/ `else` and `while` are supported:

```lv
if (a == b) {
    # do something
}
```
```lv
var c: number = 0;
while (c < 10) {
    c = c + 1;
}
```

Like with functions, brackets can be omitted:
```lv
var c: number = 0;
while (c < 10) c = c + 1;
```
This is intended behaviour.

## Objects

There are **no** anonymous objects in lev-script.
```lv
# invalid!
var obj: Object = {
    #...
};
```

Objects are associated with a type:
```lv
type Person = {
    var name: string = "Miroslav";

    fn Present = (): null => {
        console.log("Hello, I am " + this.name);
    };
};
```

lev-script is **not** an OOP language. It's types do not have the required
properties like for example inheritance, polymorphism and access modifiers,
which notably makes all members of a type public.

Properties and functions defined within a type can be accessed within an
instance of the type via the `this` keyword. The keyword is a constant, meaning
it cannot be reassigned, nor can new properties be added to it.

The `type` statement is top-level only, meaning it cannot included in, for
example, a function body.

### Operator 

Note - the function names defined below are **not** final and may change in a
later release.

The following operators can be overloaded by including a function with the
operator's name:

|operator|name       |
|--------|-----------|
| `+`    | `__add__` |
| `-`    | `__sub__` |
| `*`    | `__mul__` |
| `/`    | `__div__` |
| `%`    | `__mod__` |
| `==`   | `__eq__`  |
| `!=`   | `__neq__` |
| `<`    | `__lt__`  |
| `>`    | `__gt__`  |
| `<=`   | `__lte__` |
| `>=`   | `__gte__` |
| `<<`   | `__shl__` |
| `>>`   | `__shr__` |
| `&`    | `__band__`|
| `\|`   | `__bor__` |
| `^`    | `__xor__` |

For example, to overload the `==` operator between two objects of type `Person`:
```lv
type Person = {
    # ...
    
    fn __eq__ = (person: Person): boolean => {
        return this.name == person.name;
    };
};

# ...

if (person1 == person2) {
    # valid, since `Person` has a function `__eq__` for other values of type
    #`Person`
}

if (person1 == 1) {
    # invalid, since `Person` does not have a function `__eq__` for values of
    # type `number`
}
```
The left operand's operator overload is ran first. If there isn't an available
operator overload, then the right's operator overload is ran.

The following operators require a function **without** any arguments:

|operator|name       |
|--------|-----------|
| `!`    | `__not__` |
| `-`    | `__neg__` |

```lv
type Person = {
    # ...
    
    fn __not__ = (person: Person): boolean => {
        return !this.name;
    };
};
```

While it is reasonable to expect certain types of values being returned (for
example a call to `__eq__` returning a `boolean`), that is not mandatory. All
operators can return any types of values.

### Indexing

Types can implement indexing via the special function `__index__` for getters
and `__index_set__` for setters.

`__index__` accepts only one argument - the index (the value between the
square brackets). The function can be overloaded to accept different types of
indexes, for example accepting strings *and* numbers.
```lv
type KeyVal = {
    # ...
    fn __index__ = (key: string): string => {
        # ...
    };
    
    fn __index__ = (key: number): string => {
        # ...
    };
};

console.log(keyval[ "key" ]);
```

`__index_set__` has the same first argument as `__index__`, but also a second
argument. The second argument can also be overloaded.
```lv
type KeyVal = {
    # ...
    fn __index_set__ = (key: string, value: number): null => {
        # ...
    };
    
    fn __index_set__ = (key: string, value: string): null => {
        # ...
    };
};

keyval[ "key" ] = "value";
```

## Importing other modules

The `import` statement is available for importing other modules. When using an
`import` statement, all the declaration in the module will be included into:

```lv
import "<path>";
```

For example:

```lv
# file1.lv
fn Add = (a: number, b: number): number => {
    return a + b;
};
```

```lv
# file2.lv
import "./file1.lv";

Console.Log(add(1, 1));
```

Module paths are resolved relative to the path of the module with the `import`
statement.