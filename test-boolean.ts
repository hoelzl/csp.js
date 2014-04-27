/**
 * Created by tc on 27/Apr/2014.
 */

/// <reference path="./collections.ts" />
/// <reference path="./boolean.ts" />


console.log(not('A') === not('A'));

var clause: Clause = new Clause(['A', not('B'),
    makeVariable('C'), not(makeVariable('D'))]);

console.log(clause.evaluate({A: true}) === true);
console.log(clause.evaluate({A: false, B: true, C: false, D: true}) === false);
console.log(clause.evaluate({A: false, B: true, C: false, D: false}) === true);

var cnf: Cnf = new Cnf([['A', not('B'), 'C'],
    [not('A'), not('B'), 'C']]);

console.log(cnf.evaluate({A: true, B: true, C: false}) === false);
console.log(cnf.evaluate({A: true, B: false, C: true}) === true);
console.log(cnf.evaluate({A: true, B: true, C: true}) === true);
console.log(cnf.evaluate({A: true, B: false, C: true}) === true);
console.log(cnf.evaluate({A: false, B: true, C: false}) === false);
console.log(cnf.evaluate({A: false, B: false, C: true}) === true);
console.log(cnf.evaluate({A: false, B: true, C: true}) === true);
console.log(cnf.evaluate({A: false, B: false, C: true}) === true);

console.log(t().evaluate({}) === true);
console.log(f().evaluate({}) === false);

var a = v('A');
var b = v('B');
var c = v('C');
var d = v('D');

console.log(a.evaluate({A: true}) === true);
console.log(a.evaluate({A: false}) === false);

console.log(not(a).evaluate({A: false}) === true);
console.log(not(a).evaluate({A: true}) === false);

console.log(and(a, b).evaluate({A: true, B: true}) === true);
console.log(and(a, b).evaluate({A: true, B: false}) === false);
console.log(and(a, b).evaluate({A: false, B: true}) === false);
console.log(and(a, b).evaluate({A: false, B: false}) === false);

console.log(or(a, b).evaluate({A: true, B: true}) === true);
console.log(or(a, b).evaluate({A: true, B: false}) === true);
console.log(or(a, b).evaluate({A: false, B: true}) === true);
console.log(or(a, b).evaluate({A: false, B: false}) === false);

console.log(imp(a, b).evaluate({A: true, B: true}) === true);
console.log(imp(a, b).evaluate({A: true, B: false}) === false);
console.log(imp(a, b).evaluate({A: false, B: true}) === true);
console.log(imp(a, b).evaluate({A: false, B: false}) === true);

console.log(iff(a, b).evaluate({A: true, B: true}) === true);
console.log(iff(a, b).evaluate({A: true, B: false}) === false);
console.log(iff(a, b).evaluate({A: false, B: true}) === false);
console.log(iff(a, b).evaluate({A: false, B: false}) === true);

/// Evaluate 3

console.log(clause.evaluate3({}) === undefined);
console.log(clause.evaluate3({A: false}) === undefined);
console.log(clause.evaluate3({A: true}) === true);
console.log(clause.evaluate3({A: false, B: true, C: false}) === undefined);
console.log(clause.evaluate3({A: false, B: true, C: false, D: true}) === false);
console.log(clause.evaluate3({A: false, B: true, C: false, D: false}) === true);

console.log(cnf.evaluate3({}) === undefined);
console.log(cnf.evaluate3({A: true}) === undefined);
console.log(cnf.evaluate3({A: true, B: true, C: false}) === false);
console.log(cnf.evaluate3({A: true, B: false, C: true}) === true);
console.log(cnf.evaluate3({A: true, B: true, C: true}) === true);
console.log(cnf.evaluate3({A: true, B: false, C: true}) === true);
console.log(cnf.evaluate3({A: false, B: true, C: false}) === false);
console.log(cnf.evaluate3({A: false, B: false, C: true}) === true);
console.log(cnf.evaluate3({A: false, B: true, C: true}) === true);
console.log(cnf.evaluate3({A: false, B: false, C: true}) === true);

console.log(t().evaluate3({}) === true);
console.log(f().evaluate3({}) === false);


console.log(a.evaluate3({}) === undefined);
console.log(a.evaluate3({A: true}) === true);
console.log(a.evaluate3({A: false}) === false);

console.log(not(a).evaluate3({}) === undefined);
console.log(not(a).evaluate3({A: false}) === true);
console.log(not(a).evaluate3({A: true}) === false);

console.log(and(a, b).evaluate3({}) === undefined);
console.log(and(a, b).evaluate3({A: true}) === undefined);
console.log(and(a, b).evaluate3({A: false}) === false);
console.log(and(a, b).evaluate3({B: true}) === undefined);
console.log(and(a, b).evaluate3({B: false}) === false);
console.log(and(a, b).evaluate3({A: true, B: true}) === true);
console.log(and(a, b).evaluate3({A: true, B: false}) === false);
console.log(and(a, b).evaluate3({A: false, B: true}) === false);
console.log(and(a, b).evaluate3({A: false, B: false}) === false);

console.log(or(a, b).evaluate3({}) === undefined);
console.log(or(a, b).evaluate3({A: true}) === true);
console.log(or(a, b).evaluate3({A: false}) === undefined);
console.log(or(a, b).evaluate3({B: true}) === true);
console.log(or(a, b).evaluate3({B: false}) === undefined);
console.log(or(a, b).evaluate3({A: true, B: true}) === true);
console.log(or(a, b).evaluate3({A: true, B: false}) === true);
console.log(or(a, b).evaluate3({A: false, B: true}) === true);
console.log(or(a, b).evaluate3({A: false, B: false}) === false);

console.log(imp(a, b).evaluate3({}) === undefined);
console.log(imp(a, b).evaluate3({A: true}) === undefined);
console.log(imp(a, b).evaluate3({A: false}) === true);
console.log(imp(a, b).evaluate3({B: true}) === true);
console.log(imp(a, b).evaluate3({B: false}) === undefined);
console.log(imp(a, b).evaluate3({A: true, B: true}) === true);
console.log(imp(a, b).evaluate3({A: true, B: false}) === false);
console.log(imp(a, b).evaluate3({A: false, B: true}) === true);
console.log(imp(a, b).evaluate3({A: false, B: false}) === true);

console.log(iff(a, b).evaluate3({}) === undefined);
console.log(iff(a, b).evaluate3({A: true}) === undefined);
console.log(iff(a, b).evaluate3({A: false}) === undefined);
console.log(iff(a, b).evaluate3({B: true}) === undefined);
console.log(iff(a, b).evaluate3({B: false}) === undefined);
console.log(iff(a, b).evaluate3({A: true, B: true}) === true);
console.log(iff(a, b).evaluate3({A: true, B: false}) === false);
console.log(iff(a, b).evaluate3({A: false, B: true}) === false);
console.log(iff(a, b).evaluate3({A: false, B: false}) === true);

/// ttEntails

console.log(!ttTautology(and(a, not(a))));
console.log(!ttSatisfiable(and(a, not(a))));

console.log(!ttTautology(and(a, not(b))));
console.log(ttSatisfiable(and(a, not(b))));

console.log(ttTautology(or(a, not(a))));
console.log(ttSatisfiable(or(a, not(a))));

console.log(ttTautology(imp(and(imp(a, b), imp(b, c)), imp(a, c))));
console.log(ttSatisfiable(imp(and(imp(a, b), imp(b, c)), imp(a, c))));
