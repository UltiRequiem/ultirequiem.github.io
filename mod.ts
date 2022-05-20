// Just to setup the repo to TypeScript 😆

import { fibonacciSequence } from "https://deno.land/x/fibonacci/mod.ts";
import { randomNumber } from "https://deno.land/x/random_number/mod.ts";

console.log("I love Deno 🦕");

for (const fibonacci of fibonacciSequence(10)) {
  console.log(fibonacci * randomNumber());
}
