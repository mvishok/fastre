// integer functions

function factorial(n) {
  return n === 0 ? 1 : n * factorial(n - 1);
}

function isPrime(n) {
  if (n <= 1) return false;

  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }

  return true;
}


function greatestCommonDivisor(a, b) {
    return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

function leastCommonMultiple(a, b) {
    return a * b / greatestCommonDivisor(a, b);
}

function toBinary(n) {
    return n.toString(2);
}

function toOctal(n) {
    return n.toString(8);
}

function toHex(n) {
    return n.toString(16);
}

function abs(n) {
    return Math.abs(n);
}

function isPerfectSquare(n) {
    return Number.isInteger(Math.sqrt(n));
}

function reverse(n) {
    return parseInt(n.toString().split('').reverse().join(''));
}

function count(n) {
    return n.toString().length;
}

function isPalindrome(n) {
    return n.toString() === n.toString().split('').reverse().join('');
}

function split(n, args) {
    args[0] === undefined ? args[0] = 1 : args[0];
    return n.toString().match(new RegExp('.{1,' + args[0] + '}', 'g'));
}

export { factorial, isPrime, greatestCommonDivisor, leastCommonMultiple, toBinary, toOctal, toHex, abs, isPerfectSquare, reverse, count, isPalindrome, split }