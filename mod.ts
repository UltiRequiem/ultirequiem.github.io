// All these are modules created by me
import { fibonacciSequence } from "https://deno.land/x/fibonacci/mod.ts";
import { randomNumber } from "https://deno.land/x/random_number/mod.ts";
import { sum } from "https://deno.land/x/sum/mod.ts";
import { isNumber } from "https://deno.land/x/is_number/mod.ts";
import { randomItem } from "https://deno.land/x/random_item/mod.ts";

// This one by Sindre Sorhus 🧐
import { random as randomPokemon } from "https://esm.sh/pokemon";

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
  `https://palindrome.deno.dev/${coolPokemon}`,
);

const pokePalindrome = await pokePalindromeResponse.json();

console.log(`"${coolPokemon}" is a Palindrome? ${pokePalindrome.result}.`);

const favoritesPokemon = Array.from({ length: randomNumber() }, randomPokemon);

const favoritePokemon = randomItem(favoritesPokemon);

console.log(
  `I have ${favoritesPokemon.length} favorites Pokemon, but the most special one for me  is ${favoritePokemon}.`,
);
