# UltiRequiem's JavaScript Modules

Hi everyone 👋

I'm Eliaz, a 15-year-old Peruvian Software Developer who loves creating Open
Source.

### Fibonacci

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
