# Console

## Functions

### Log

`(str: string): null` - Writes the value of `str` to `stdout`.

### Error

`(str: string): null` - Writes the value of `str` to `stderr`.

### ReadLine

`(): string` - Reads a line from `stdin`.

# Parse

## Functions

### ToNumber

`(str: string): number` - Returns the numeric value of `str`.

### ToBoolean

`(str: string): number` - Returns the boolean value of `str`.

# Math

## Properties

### Pi

Represents the ratio of the circumference of a circle to its diameter.

### E

Represents Euler's number, the base of natural logarithms.

## Functions

### Atan2

`(x: number, y: number): number` - Returns the angle in the plane (in radians)
between the positive x-axis and the ray from (0, 0) to the point (x, y).

### Pow

`(val: number, power: number): number` - Returns the value of `val` to the power
of `power`.

### Abs

`(val: number): number` - Returns the absolute value of `val`.

### Acos

`(val: number): number` - Returns the inverse cosine (in radians) of `val`.

### Acosh

`(val: number): number` - Returns the inverse hyperbolic cosine of `val`.

### Asin

`(val: number): number` - Returns the inverse sine (in radians) of `val`.

### Asinh

`(val: number): number` - Returns the inverse hyperbolic sine of `val`.

### Atan

`(val: number): number` - Returns the inverse tangent (in radians) of `val`.

### Atanh

`(val: number): number` - Returns the inverse hyperbolic tangent of `val`.

### Cbrt

`(val: number): number` - Returns the cube root of a number `val`.

### Ceil

`(val: number): number` - rounds up and Returns the smallest integer greater than or equal to `val`.

### Cos

`(val: number): number` - Returns the cosine of `val` (in radians).

### Cosh

`(val: number): number` - Returns the hyperbolic cosine of `val`.

### Exp

`(power: number): number` - Returns e raised to the power of `power`.

### Expm1

`(power: number): number` - Returns e raised to the power of `power`, subtracted
by 1.

### Floor

`(val: number): number` - rounds down and Returns the largest integer less than
or equal to `val`.

### Random

`(min: number, max: number): number` - Returns a random value between `min` and
`max`.

`(max: number): number` - Returns a random value between `0` and `max`.

`(): number` - Returns a random value between `0` and `1`.

### Round

`(val: number): number` - Returns `val` rounded to the nearest integer.

### Sign

`(val: number): number` - Returns 1 or -1, indicating the sign of `val`.

### Sin

`(val: number): number` - Returns the sine of `val` in radians.

### Sinh

`(val: number): number` - Returns the hyperbolic sine of `val`.

### Sqrt

`(val: number): number` - Returns the square root of `val`.

### Tan

`(val: number): number` - Returns the tangent of `val` (in radians).

### Tanh

`(val: number): number` - Returns the hyperbolic tangent of `val`.

### Log

`(base: number, val: number): number` - Returns the logarithm of `base` and `val`.