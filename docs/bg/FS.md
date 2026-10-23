# FS

## Функции

### ReadFile

`(path: string): string` — Връща цялото съдържание на файла, посочен чрез `path`.

### WriteFile

`(path: string, value: string): null` — Записва `value` във файла, посочен чрез `path`.

### AppendFile

`(path: string, value: string): null` — Добавя `value` в края на файла, посочен чрез `path`.

### CreateDirectory

`(path: string, recursive: boolean): null` — Създава директорията, посочена чрез `path`. Ако `recursive` е зададено на `true`, функцията работи като `mkdir -p`.

### CreateFile

`(path: string): null` — Създава файла, посочен чрез `path`.

### List

`(path: string): array` — Връща масив от низове с имената на файловете и директориите в `path`.

### Delete

`(path: string): null` — Изтрива файла или директорията, посочени чрез `path`.

### Copy

`(from: string, to: string): null` — Копира `from` в `to`. Винаги работи като `cp -r`.

### Move

`(from: string, to: string): null` — Премества `from` в `to`. Винаги работи като `mv -r`.
