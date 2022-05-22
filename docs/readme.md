# UltiRequiem's JavaScript Modules

Hi everyone 👋

I'm Eliaz, a 15-year-old Peruvian Software Developer who loves creating Open
Source.

## Drive Link

[![Code Coverage](https://codecov.io/gh/UltiRequiem/drive_link/branch/main/graph/badge.svg)](https://codecov.io/gh/UltiRequiem/drive_link)
[![Deno Doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/drive_link/mod.ts)

Generate a [Google Drive](https://google.com/drive) direct download link based
on the URL or ID.

```javascript
import { driveLink } from "https://deno.land/x/drive_link/mod.ts";

driveLink(
  "https://drive.google.com/file/d/1DvRH-yk1z0HVBK-EmiQeJ_VVh5eHwQXh/view?usp=sharing",
);
//=> "https://drive.google.com/uc?export=download&id=1DvRH-yk1z0HVBK-EmiQeJ_VVh5eHwQXh"
```

## Camel Case

> [Site](https://camelcase.js.org) -
> [Repository](https://github.com/UltiRequiem/camelcase)

[![Code Coverage](https://codecov.io/gh/ultirequiem/camelcase/branch/main/graph/badge.svg)](https://codecov.io/gh/ultirequiem/camelcase)
[![Deno Doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/camelcase/mod.ts)

Convert a dash/dot/underscore/space separated string to
[**camelCase**](https://wikipedia.org/wiki/Camel_case) or
[**PascalCase**](https://wiktionary.org/wiki/Pascal_case).

```javascript
import { camelcase } from "https://deno.land/x/camelcase/mod.ts";

camelCase("foo-bar"); //=> 'fooBar'

camelCase("foo_bar"); //=> 'fooBar'

camelCase("Foo-Bar"); //=> 'fooBar'

camelCase("розовый_пушистый_единорог"); //=> 'розовыйПушистыйЕдинорог'

camelCase("Foo-Bar", { pascalCase: true }); //=> 'FooBar'

camelCase("--foo.bar", { pascalCase: false }); //=> 'fooBar'

camelCase("Foo-BAR", { preserveConsecutiveUppercase: true }); //=> 'fooBAR'

camelCase("fooBAR", { pascalCase: true, preserveConsecutiveUppercase: true }); //=> 'FooBAR'

camelCase("foo bar"); //=> 'fooBar'

camelCase(["foo", "bar"]); //=> 'fooBar'

camelCase(["__foo__", "--bar"], { pascalCase: true }); //=> 'FooBar'

camelCase(["foo", "BAR"], {
  pascalCase: true,
  preserveConsecutiveUppercase: true,
}); //=> 'FooBAR'

camelCase("lorem-ipsum", { locale: "en-US" }); //=> 'loremIpsum'
```

## Last Item

[![Code Coverage](https://codecov.io/gh/ultirequiem/last_item/branch/main/graph/badge.svg)](https://codecov.io/gh/ultirequiem/last_item)
[![Deno Doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/last_item/mod.ts)

> [Site](https://ulti.js.org/last_item) -
> [Repository](https://github.com/ultirequiem/last_item)

Get the last item of an array, faster than
[`Array.prototype.slice`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)/[`Array.project.at`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/at).

```javascript
import { lastItem } from "https://deno.land/x/last_item/mod.ts";

const numbers = [1, 2, 3, 4, 5];

lastItem(numbers); //=> 5

lastItem(numbers, 3); //=> [3, 4 , 5]
```

## Fibonacci

[![Code Coverage](https://codecov.io/gh/ultirequiem/fibonacci/branch/main/graph/badge.svg)](https://codecov.io/gh/ultirequiem/fibonacci)
[![Deno Docs](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/fibonacci/mod.ts)

> [Site](https://ulti.js.org/fibonacci) -
> [Repository](https://github.com/ultirequiem/fibonacci)

Compute the
[Fibonacci Succession](https://en.wikipedia.org/wiki/Fibonacci_number) and NTH
Fibonacci Number.

```javascript
import {
  fibonacci,
  fibonacciSequence,
} from "https://deno.land/x/fibonacci/mod.ts";

fibonacci(10); //=> 55

fibonacci(5); //=> 5

// First 10 Fibonacci Numbers
for (const fiboNumber of fibonacciSequence(9)) {
  console.log(fiboNumber);
}

console.log(`My favorites numbers are ${[...fibonacciSequence(3)]}.`);
```

## Licence

All these modules are licensed by the MIT License 📄
