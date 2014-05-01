/**
 * Created by tc on 27/Apr/2014.
 */

/// <reference path="./collections.ts" />
/// <reference path="./boolean.ts" />


console.log(not('A') === not('A'));

var clause: Clause = new Clause(['A', not('B'),
    makeVariable('C'), not(makeVariable('D'))]);

// console.log(clause.evaluate(eta({A: true})) === true);
console.log(clause.evaluate(eta({A: false, B: true, C: false, D: true})) === false);
console.log(clause.evaluate(eta({A: false, B: true, C: false, D: false})) === true);

var cnf: Cnf = new Cnf([['A', not('B'), 'C'],
    [not('A'), not('B'), 'C']]);

console.log(cnf.evaluate(eta({A: true, B: true, C: false})) === false);
console.log(cnf.evaluate(eta({A: true, B: false, C: true})) === true);
console.log(cnf.evaluate(eta({A: true, B: true, C: true})) === true);
console.log(cnf.evaluate(eta({A: true, B: false, C: true})) === true);
console.log(cnf.evaluate(eta({A: false, B: true, C: false})) === false);
console.log(cnf.evaluate(eta({A: false, B: false, C: true})) === true);
console.log(cnf.evaluate(eta({A: false, B: true, C: true})) === true);
console.log(cnf.evaluate(eta({A: false, B: false, C: true})) === true);

console.log(t().evaluate(eta({})) === true);
console.log(f().evaluate(eta({})) === false);

var a = v('A');
var b = v('B');
var c = v('C');
var d = v('D');

console.log(a.evaluate(eta({A: true})) === true);
console.log(a.evaluate(eta({A: false})) === false);

console.log(not(a).evaluate(eta({A: false})) === true);
console.log(not(a).evaluate(eta({A: true})) === false);

console.log(and(a, b).evaluate(eta({A: true, B: true})) === true);
console.log(and(a, b).evaluate(eta({A: true, B: false})) === false);
console.log(and(a, b).evaluate(eta({A: false, B: true})) === false);
console.log(and(a, b).evaluate(eta({A: false, B: false})) === false);

console.log(or(a, b).evaluate(eta({A: true, B: true})) === true);
console.log(or(a, b).evaluate(eta({A: true, B: false})) === true);
console.log(or(a, b).evaluate(eta({A: false, B: true})) === true);
console.log(or(a, b).evaluate(eta({A: false, B: false})) === false);

console.log(imp(a, b).evaluate(eta({A: true, B: true})) === true);
console.log(imp(a, b).evaluate(eta({A: true, B: false})) === false);
console.log(imp(a, b).evaluate(eta({A: false, B: true})) === true);
console.log(imp(a, b).evaluate(eta({A: false, B: false})) === true);

console.log(iff(a, b).evaluate(eta({A: true, B: true})) === true);
console.log(iff(a, b).evaluate(eta({A: true, B: false})) === false);
console.log(iff(a, b).evaluate(eta({A: false, B: true})) === false);
console.log(iff(a, b).evaluate(eta({A: false, B: false})) === true);

/// Evaluate 3

console.log(clause.evaluate3(eta({})) === undefined);
console.log(clause.evaluate3(eta({A: false})) === undefined);
console.log(clause.evaluate3(eta({A: true})) === true);
console.log(clause.evaluate3(eta({A: false, B: true, C: false})) === undefined);
console.log(clause.evaluate3(eta({A: false, B: true, C: false, D: true})) === false);
console.log(clause.evaluate3(eta({A: false, B: true, C: false, D: false})) === true);

console.log(cnf.evaluate3(eta({})) === undefined);
console.log(cnf.evaluate3(eta({A: true})) === undefined);
console.log(cnf.evaluate3(eta({A: true, B: true, C: false})) === false);
console.log(cnf.evaluate3(eta({A: true, B: false, C: true})) === true);
console.log(cnf.evaluate3(eta({A: true, B: true, C: true})) === true);
console.log(cnf.evaluate3(eta({A: true, B: false, C: true})) === true);
console.log(cnf.evaluate3(eta({A: false, B: true, C: false})) === false);
console.log(cnf.evaluate3(eta({A: false, B: false, C: true})) === true);
console.log(cnf.evaluate3(eta({A: false, B: true, C: true})) === true);
console.log(cnf.evaluate3(eta({A: false, B: false, C: true})) === true);

console.log(t().evaluate3(eta({})) === true);
console.log(f().evaluate3(eta({})) === false);


console.log(a.evaluate3(eta({})) === undefined);
console.log(a.evaluate3(eta({A: true})) === true);
console.log(a.evaluate3(eta({A: false})) === false);

console.log(not(a).evaluate3(eta({})) === undefined);
console.log(not(a).evaluate3(eta({A: false})) === true);
console.log(not(a).evaluate3(eta({A: true})) === false);

console.log(and(a, b).evaluate3(eta({})) === undefined);
console.log(and(a, b).evaluate3(eta({A: true})) === undefined);
console.log(and(a, b).evaluate3(eta({A: false})) === false);
console.log(and(a, b).evaluate3(eta({B: true})) === undefined);
console.log(and(a, b).evaluate3(eta({B: false})) === false);
console.log(and(a, b).evaluate3(eta({A: true, B: true})) === true);
console.log(and(a, b).evaluate3(eta({A: true, B: false})) === false);
console.log(and(a, b).evaluate3(eta({A: false, B: true})) === false);
console.log(and(a, b).evaluate3(eta({A: false, B: false})) === false);

console.log(or(a, b).evaluate3(eta({})) === undefined);
console.log(or(a, b).evaluate3(eta({A: true})) === true);
console.log(or(a, b).evaluate3(eta({A: false})) === undefined);
console.log(or(a, b).evaluate3(eta({B: true})) === true);
console.log(or(a, b).evaluate3(eta({B: false})) === undefined);
console.log(or(a, b).evaluate3(eta({A: true, B: true})) === true);
console.log(or(a, b).evaluate3(eta({A: true, B: false})) === true);
console.log(or(a, b).evaluate3(eta({A: false, B: true})) === true);
console.log(or(a, b).evaluate3(eta({A: false, B: false})) === false);

console.log(imp(a, b).evaluate3(eta({})) === undefined);
console.log(imp(a, b).evaluate3(eta({A: true})) === undefined);
console.log(imp(a, b).evaluate3(eta({A: false})) === true);
console.log(imp(a, b).evaluate3(eta({B: true})) === true);
console.log(imp(a, b).evaluate3(eta({B: false})) === undefined);
console.log(imp(a, b).evaluate3(eta({A: true, B: true})) === true);
console.log(imp(a, b).evaluate3(eta({A: true, B: false})) === false);
console.log(imp(a, b).evaluate3(eta({A: false, B: true})) === true);
console.log(imp(a, b).evaluate3(eta({A: false, B: false})) === true);

console.log(iff(a, b).evaluate3(eta({})) === undefined);
console.log(iff(a, b).evaluate3(eta({A: true})) === undefined);
console.log(iff(a, b).evaluate3(eta({A: false})) === undefined);
console.log(iff(a, b).evaluate3(eta({B: true})) === undefined);
console.log(iff(a, b).evaluate3(eta({B: false})) === undefined);
console.log(iff(a, b).evaluate3(eta({A: true, B: true})) === true);
console.log(iff(a, b).evaluate3(eta({A: true, B: false})) === false);
console.log(iff(a, b).evaluate3(eta({A: false, B: true})) === false);
console.log(iff(a, b).evaluate3(eta({A: false, B: false})) === true);

/// ttEntails

console.log(!ttTautology(and(a, not(a))));
console.log(!ttSatisfiable(and(a, not(a))));

console.log(!ttTautology(and(a, not(b))));
console.log(ttSatisfiable(and(a, not(b))));

console.log(ttTautology(or(a, not(a))));
console.log(ttSatisfiable(or(a, not(a))));

console.log(ttTautology(imp(and(imp(a, b), imp(b, c)), imp(a, c))));
console.log(ttSatisfiable(imp(and(imp(a, b), imp(b, c)), imp(a, c))));


/// DPLL

console.log(!dpll1(and(a, not(a))));
console.log(dpll1(and(a, not(b))));
console.log(dpll1(or(a, not(a))));
console.log(dpll1(imp(and(imp(a, b), imp(b, c)), imp(a, c))));
console.log(dpll1(cnf));