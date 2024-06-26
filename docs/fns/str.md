# String Functions

This section describes the functions that are related to strings.

## lower

### Syntax

```fastre
lower(...[string])
```

### Description
The `lower` function converts all characters in a string to lowercase. If multiple strings are passed, the function will return a new string with all the characters in lowercase, joined by spaces.

### Example

```fastre
lower("HELLO")
```

## upper

### Syntax

```fastre
upper(...[string])
```

### Description
The `upper` function converts all characters in a string to uppercase. If multiple strings are passed, the function will return a new string with all the characters in uppercase, joined by spaces.

### Example

```fastre
upper("hello")
```

## capitalize

### Syntax

```fastre
capitalize(...[string])
```

### Description
The `capitalize` function converts the first character of a string to uppercase and the rest to lowercase. If multiple strings are passed, the function will return a new string with the first character of each string in uppercase and the rest in lowercase, joined by spaces.

### Example

```fastre
capitalize("hello")
```

## replace

### Syntax

```fastre
replace(string, old, new)
```

### Description
The `replace` function replaces all occurrences of a substring in a string with another substring. 

>[!NOTE]
>The `old` argument supports regular expressions.

### Example

```fastre
replace("hello world", "world", "universe")
```

## replaceFirst

### Syntax

```fastre
replaceFirst(string, old, new)
```

### Description
The `replaceFirst` function replaces the first occurrence of a substring in a string with another substring.

>[!NOTE]
>The `old` argument supports regular expressions.

### Example

```fastre
replaceFirst("hello world and world", "world", "universe")
```

## split

### Syntax

```fastre
split(string, separator)
```

### Description
The `split` function splits a string into a list of substrings based on a separator.

### Example

```fastre
split("hello world", " ")
```

## concat

### Syntax

```fastre
concat(...[string])
```

### Description
The `concat` function concatenates multiple strings into a single string, wihout any separator.

### Example

```fastre
concat("hello", "world")
```