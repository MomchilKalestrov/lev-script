# FS

## Functions

### ReadFile

`(path: string): string` - Returns the full file value of `path`.

### WriteFile

`(path: string, value: string): null` - Writes `value` to the file at `path`.

### AppendFile

`(path: string, value: string): null` - Appends `value` to the file at `path`.

### CreateDirectory

`(path: string, recursive: boolean): null` - Creates the directory at `path`. If
`recursive` is set to `true`, then the function behaves like `mkdir -p`.

### CreateFile

`(path: string): null` - Creates the file at `path`.

### List

`(path: string): array` - Returns a string array of the files and directories in
`path`.

### Delete

`(path: string): null` - Deletes the file/ directory at `path`.

### Copy

`(from: string, to: string): null` - Copies `from` to `to`. Always behaves like
`cp -r`.

### Move

`(from: string, to: string): null` - Moves `from` to `to`. Always behaves like
`mv -r`.