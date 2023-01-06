// All these are modules created by me
import { fibonacciSequence } from "https://deno.land/x/fibonacci@v1.3.1/mod.ts";
import { randomNumber } from "https://deno.land/x/random_number@2.0.0/mod.ts";
import { sum } from "https://deno.land/x/sum@v1.1.0/mod.ts";
import { isNumber } from "https://deno.land/x/is_number@v1.6.1/mod.ts";
import { randomItem } from "https://deno.land/x/random_item@v1.2.0/mod.ts";

// This one by Sindre Sorhus 🧐
import { random as randomPokemon } from "https://esm.sh/pokemon@2.3.3";

console.log("I love Deno 🦕");

for (const fibonacci of fibonacciSequence(10)) {
  const result = fibonacci * randomNumber();

  const coolResult = sum([result, randomNumber()]);

  if (!isNumber(coolResult)) {
    throw new Error("Something went wrong!");
  }

  console.log(coolResult);
}

const coolPokemon = randomPokemon();

const pokePalindromeResponse = await fetch(
  // API made by me too!
  `https://palindrome.deno.dev/${coolPokemon.toLowerCase()}`,
);

const pokePalindrome = await pokePalindromeResponse.json();

console.log(
  `Is ${coolPokemon} a Palindrome? ${pokePalindrome.result ? "Yes" : "No"}.`,
);

const favoritesPokemon = Array.from({ length: randomNumber() }, randomPokemon);

const favoritePokemon = randomItem(favoritesPokemon);

console.log(
  `I have ${favoritesPokemon.length} favorites Pokemon, but the most special one for me is ${favoritePokemon}.`,
);
