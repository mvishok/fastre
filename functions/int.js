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

//arithmetics
function add(n, args){
    return n + args[0];
}

function subtract(n, args){
    return n - args[0];
}

function multiply(n, args){
    return n * args[0];
}

function divide(n, args){
    return n / args[0];
}

function modulo(n, args){
    return n % args[0];
}

function power(n, args){
    return Math.pow(n, args[0]);
}

function root(n, args){
    return Math.pow(n, 1 / args[0]);
}

function log(n, args){
    return Math.log(n) / Math.log(args[0]);
}

function round(n, args){
    return Math.round(n);
}

function ceil(n, args){
    return Math.ceil(n);
}

function floor(n, args){
    return Math.floor(n);
}

function increment(n){
    return n + 1;
}

function decrement(n){
    return n - 1;
}

export {
    factorial,
    isPrime,
    greatestCommonDivisor,
    leastCommonMultiple,
    toBinary,
    toOctal,
    toHex,
    abs,
    isPerfectSquare,
    reverse,
    count,
    isPalindrome,
    split,
    add,
    subtract,
    multiply,
    divide,
    modulo,
    power,
    root,
    log,
    round,
    ceil,
    floor,
    increment,
    decrement
}