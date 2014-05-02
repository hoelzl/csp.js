/**
 * Created by tc on 27/Apr/2014.
 */
/// <reference path="./collections.ts" />

var variableCounter = 0;

function anonymousVariableName () {
    return '_' + variableCounter++;
}


// Evaluabales are things that can be evaluated to a Boolean value given a
// valuation for the variables.
interface Evaluable {
    evaluate (valuation: IFMap<Variable, boolean>): boolean;   // true or false
    evaluate3 (valuation: IFMap<Variable, boolean>): boolean;  // true, false or undefined
}


// Things that have variables as substructure.  The most obvious class that
// inherits this interface is `Term', but things like `BinaryOperator' or
// Clauses have variables and are not terms.
interface HasVariables {
    variables(): IFSet<Variable>;
}

// The superclass of all Terms.
interface Term extends Evaluable, HasVariables {
}


// Common base class for binary operators; right now the only shared
// functionality is the computation of the variables.
class BinaryOperator implements HasVariables {
    constructor (public lhs: Term, public rhs: Term) {}
    variables () {
        return this.lhs.variables().union(this.rhs.variables());
    }
}

// A Literal is either a Variable or a negated Variable.
interface Literal extends Term {
}


/// True and False

class Top implements Term {
    toString (): string {
        return 'true';
    }
    evaluate (valuation): boolean {
        return true;
    }
    evaluate3 (valuation): boolean {
        return true;
    }
    variables () {
        return fset<Variable>();
    }
}

// Define some convenient function names to build terms.
function t (): Term {
    return new Top();
}

class Bottom implements Term {
    toString (): string {
        return 'false';
    }
    evaluate (valuation): boolean {
        return false;
    }
    evaluate3 (valuation): boolean {
        return false;
    }
    variables () {
        return fset<Variable>();
    }
}

function f (): Term {
    return new Bottom();
}


/// Implementation of Literals and General Terms

// A table for interning all variables.  Stores the mapping variable name (as
// string) to variable object.  Therefore variables should not be created with
// new but with `makeVariable' or `v'.
var variables = {};

// The class for variables.  Variables are interned and can be compared with
// ===.
class Variable implements Literal {
    constructor (public name: string = anonymousVariableName()) {
        variables[name] = this;
    }
    toString (): string {
        return this.name;
    }
    // In TypeScript Boolean values can also be `undefined', and this is also
    // the return value we get from accessing a missing element in an IFMap.
    // Therefore we check this case and throw an error, to avoid silent
    // failures.
    evaluate (valuation: IFMap<Variable, boolean>): boolean {
        var value = valuation.value(this);
        if (value === undefined) {
            throw('Cannot evaluate undefined variable ' + this.name);
        }
        return  value;
    }
    evaluate3 (valuation: IFMap<Variable, boolean>): boolean {
        // console.log('Variable.evaluate3:', valuation);
        return valuation.value(this);
    }
    variables () {
        return fset(this);
    }
}

// The factory function for variables.  Checks whether a variable with the
// given name already exists in the variable table and returns this variable;
// creates a new instance if a variable with the same name does not already
// exist.  The argument `name' can also be an existing variable which is
// simply returned.
function makeVariable (name: any = anonymousVariableName()) {
    if (name instanceof Variable) {
        return name;
    }
    if (typeof name === 'string') {
        var variable = variables[name];
        if (variable) {
            return  variable;
        }
        return new Variable(name);
    }
    throw('Cannot create subterm from ' + name);
}


// A short name for `makeVariable'
var v = makeVariable;


// Create a valuation (i.e., an IFMap<Variable,boolean>) from an object.
// Since anything but objects is cumbersome to write down as literal, and
// plain objects are not particularly nice as data structures for recursive
// programs, we write environments as objects and use `eta' to convert them to
// the required collection type.
function eta (object): IFMap<Variable, boolean> {
    var result = fmap<Variable, boolean>();
    Object.getOwnPropertyNames(object).forEach(p => {
        result = result.add(makeVariable(p), object[p]);
    });
    return result;
}


// Table for interning negations.
var negations = {};

// The class for negations.  Strictly speaking this is only a literal when its
// subterm is a variable; therefore we should probably have an abstract class
// or interface with concrete subclasses for the different cases, but this
// seems like overkill for such a simple program.
class Negation implements Literal {
    constructor (public subterm: Term) {
        if (subterm instanceof Variable) {
            negations[(<Variable>subterm).name] = this;
        }
    }
    toString (): string {
        // TODO: Need to put parentheses around subterm (somtimes).
        return '¬' + this.subterm.toString();
    }
    evaluate (valuation): boolean {
        return !this.subterm.evaluate(valuation);
    }
    evaluate3 (valuation): boolean {
        var value = this.subterm.evaluate3(valuation);
        if (value === undefined) {
            return undefined;
        }
        return !value;
    }
    variables () {
        return this.subterm.variables();
    }
}

function makeLiteral(l: any) {
    if (l instanceof Variable || l instanceof Negation) {
        return l;
    }
    return makeVariable(l);
}

// Create a negation. Interns negation terms with a variable as subterm.
// Automatically removes double negations, so it's not correct to use this to
// create arbitrary terms, but this feature is useful for building CNFs.
function not(v) {
    var negation;
    if (v instanceof Variable) {
        negation = negations[v.name];
        if (negation) {
            return negation;
        }
        return new Negation(v);
    }
    if (typeof v === 'string') {
        negation = negations[v];
        if (negation) {
            return negation;
        }
        return new Negation(makeVariable(v));
    }
    if (v instanceof Negation) {
        return v.var;
    }
    throw('Cannot negate' + v);
}

// Classes for the various operators.  Should be relatively straightforward.

class And extends BinaryOperator implements Term {
    constructor (public lhs: Term, public rhs: Term) {
        super(lhs, rhs);
    }
    evaluate (valuation) {
        return this.lhs.evaluate(valuation) && this.rhs.evaluate(valuation);
    }
    evaluate3 (valuation) {
        var vl = this.lhs.evaluate3(valuation);
        var vr = this.rhs.evaluate3(valuation);
        if (vl === false || vr === false) {
            return false;
        }
        if (vl === undefined || vr === undefined) {
            return undefined;
        }
        return true;
    }
}

function and (lhs, rhs) {
    return new And(lhs, rhs);
}

class Or extends BinaryOperator implements Term {
    constructor (public lhs: Term, public rhs: Term) {
        super(lhs, rhs);
    }
    evaluate (valuation) {
        return this.lhs.evaluate(valuation) || this.rhs.evaluate(valuation);
    }
    evaluate3 (valuation) {
        var vl = this.lhs.evaluate3(valuation);
        var vr = this.rhs.evaluate3(valuation);
        if (vl === true || vr === true) {
            return true;
        }
        if (vl === undefined || vr === undefined) {
            return undefined;
        }
        return false;
    }
}

function or (lhs, rhs) {
    return new Or(lhs, rhs);
}

class Implication extends BinaryOperator implements Term {
    constructor (public lhs: Term, public rhs: Term) {
        super(lhs, rhs);
    }
    evaluate (valuation) {
        return !this.lhs.evaluate(valuation) || this.rhs.evaluate(valuation);
    }
    evaluate3 (valuation) {
        var vl = this.lhs.evaluate3(valuation);
        var vr = this.rhs.evaluate3(valuation);
        if (vl === false || vr === true) {
            return true;
        }
        if (vl === true && vr === false) {
            return false;
        }
        return undefined;
    }
}

function imp (lhs, rhs) {
    return new Implication(lhs, rhs);
}

class Equivalence extends BinaryOperator implements Term {
    constructor (public lhs: Term, public rhs: Term) {
        super(lhs, rhs);
    }
    evaluate (valuation) {
        return this.lhs.evaluate(valuation) === this.rhs.evaluate(valuation);
    }
    evaluate3 (valuation) {
        var vl = this.lhs.evaluate3(valuation);
        var vr = this.rhs.evaluate3(valuation);
        if (vl === undefined || vr === undefined) {
            return undefined;
        }
        return vl === vr;
    }
}

function iff (lhs, rhs) {
    return new Equivalence(lhs, rhs);
}


/// Clauses and CNF

// Note that Clauses and CNFs are not defined as Terms.

// Evaluate a set of literals for a clause, i.e., return the disjunction of
// their truth values.
function evaluateLiteralSet(literals: IFSet<Literal>, valuation) {
    if (literals.isEmpty()) {
        return false;
    }
    var choice = literals.pickElement();
    return choice.element.evaluate(valuation) ||
        evaluateLiteralSet(choice.newSet, valuation);
}

// Evaluate the set of literals in a clause, taking care to correctly thread
// undefined values through the evaluation.
//
function evaluate3LiteralSet(literals: IFSet<Literal>, valuation) {
    // console.log('evaluate3LiteralSet:', literals.toString(), valuation.toString());
    if (literals.isEmpty()) {
        return false;
    }
    var choice = literals.pickElement();
    var choiceValue = choice.element.evaluate3(valuation);
    // If at least one member is true the whole clause evaluates to true.
    if (choiceValue) {
        // console.log('evaluate3LiteralSet:', choice.element.toString(), true);
        return true;
    }
    // If a member is false it does not influence the evaluation; the clause is
    // true if one other member is true, undefined if no other member is true
    // and at least one is undefined, and false otherwise.
    if (choiceValue === false) {
        // console.log('evaluate3LiteralSet:', choice.element.toString(), false);
        return evaluate3LiteralSet(choice.newSet, valuation);
    }
    // If a member is undefined the clause cannot become false: if another
    // member is true the whole clause becomes true, otherwise the whole clause
    // becomes false.  This is achieved by disjoining the result of evaluating
    // the other literals with `undefined'.
    return evaluate3LiteralSet(choice.newSet, valuation) || undefined;
}

// Evaluate the set of clauses in a CNF, i.e., return the conjunction of the
// clause values.
function evaluateClauseSet(clauses: IFSet<Clause>, valuation) {
    if (clauses.isEmpty()) {
        return true;
    }
    var choice = clauses.pickElement();
    return choice.element.evaluate(valuation) &&
        evaluateClauseSet(choice.newSet, valuation);
}

// Evaluates the set of clauses in a formula in CNF taking care of undefined
// values.
function evaluate3ClauseSet(clauses: IFSet<Clause>, valuation) {
    // console.log('evaluate3ClauseSet:', clauses.toString(), valuation.toString());
    if (clauses.isEmpty()) {
        return true;
    }
    var choice = clauses.pickElement();
    var choiceValue = choice.element.evaluate3(valuation);
    // If at least one clause in a CNF is false the whole CNF becomes false,
    // irrespective of the values of the other clauses.
    if (choiceValue === false) {
        // console.log('evaluate3ClausesSet:', choice.element.toString(), false);
        return false;
    }
    // If a member clause is true it does not influence the evaluation of the
    // CNF, the CNF is false if at least one other member is false, undefined if
    // no member is false and at least one member is undefined, and true only if
    // all other members are true.
    if (choiceValue === true) {
        // console.log('evaluate3ClausesSet:', choice.element.toString(), true);
        return evaluate3ClauseSet(choice.newSet, valuation);
    }
    // If a member is undefined the CNF cannot become true: If another member is
    // false the whole CNF if false, otherwise the whole clause becomes
    // undefined.
    if (evaluate3ClauseSet(choice.newSet, valuation) === false) {
        // console.log('evaluate3ClausesSet:', choice.newSet.toString(),
        //    "false because of undefined");
        return false;
    }
    // console.log('evaluate3ClausesSet:', choice.element.toString(), undefined);
    return undefined;
}

class Clause implements Evaluable, HasVariables {
    literals: IFSet<Literal>;
    constructor (literalArray: Array<any>) {
        var literals = fset<Literal>();
        for (var i = 0; i < literalArray.length; i++) {
            literals = literals.add(makeLiteral(literalArray[i]));
        }
        this.literals = literals;
    }

    evaluate (valuation): boolean {
        // console.log("Clause: evaluate()")
        return evaluateLiteralSet(this.literals, valuation);
    }
    evaluate3 (valuation): boolean {
        // console.log("Clause: evaluate3()")
        return evaluate3LiteralSet(this.literals, valuation);
    }
    variables (): IFSet<Variable> {
        var result = fset<Variable>();
        this.literals.forEach(l => {
            result = result.union(l.variables());
        });
        return result;
    }
    toString (): string {
        return this.literals.toString();
    }
}


class Cnf implements Evaluable {
    clauses: IFSet<Clause>;
    constructor (clauseArrays: Array<any>) {
        var clauses = fset<Clause>();
        for (var i = 0; i < clauseArrays.length; i++) {
            var newClause = new Clause(clauseArrays[i]);
            // console.log('Adding clause', newClause);
            clauses = clauses.add(newClause);
        }
        this.clauses = clauses;
    }
    evaluate (valuation): boolean {
        // console.log("Cnf: evaluate:", valuation.toString())
        return evaluateClauseSet(this.clauses, valuation);
    }
    evaluate3 (valuation): boolean {
        // console.log("Cnf: evaluate3:", valuation.toString())
        return evaluate3ClauseSet(this.clauses, valuation);
    }
    variables (): IFSet<Variable> {
        var result = fset<Variable>();
        this.clauses.forEach(c => {
            result = result.union(c.variables());
        });
        return result;
    }
}


/// Truth-table evaluation

// Recursively build a truth table and check whether all rows evaluate to true.
function ttTautology (term: Term): boolean {
    return ttEntails(t(), term);
}

// Check via a truth table whether `kb' entails ``term'.
function ttEntails (kb: Term, term: Term): boolean {
    return ttCheckAll(kb, term, term.variables(), fmap<Variable, boolean>());
}


// Check all rows in the truth table for `kb' and `term' whether `kb |= term'
// holds.
function ttCheckAll (kb: Term, term: Term, vars: IFList<Variable>,
                     valuation: IFMap<Variable, boolean>) {
    if (vars.isEmpty()) {
        if (kb.evaluate(valuation)) {
            return term.evaluate(valuation);
        } else {
            return true;
        }
    } else {
        var v = vars.first;
        return ttCheckAll(kb, term, vars.rest, valuation.add(v, true))
                 && ttCheckAll(kb, term, vars.rest, valuation.add(v, false));
    }
}

// Build a truth table to check whether `term' is satisfiable.
function ttSatisfiable (term): boolean {
    return ttCheckAny (term, term.variables(), fmap<Variable, boolean>());
}

// Check whether any row of the truth table for `term' evaluates to true.
function ttCheckAny (term: Term, vars: IFList<Variable>,
                     valuation: IFMap<Variable, boolean>) {
    if (vars.isEmpty()) {
        return term.evaluate3(valuation);
    } else {
        var v = vars.first;
        return ttCheckAny(term, vars.rest, valuation.add(v, true))
                 || ttCheckAny(term, vars.rest, valuation.add(v, false));
    }
}


// The basic recursive backtracking algorithm for DPLL.  Note that this version
// misses several optiomization thet would be required to justify the name
// DPLL.  The name signifies that it's the first step towards DPLL.
function dpll1 (term): boolean {
    return dpll1Rec (term, term.variables(), fmap<Variable, boolean>());
}

function dpll1Rec (term: Term, vars: IFList<Variable>,
                   valuation: IFMap<Variable, boolean>) {
    var value = term.evaluate3(valuation);
    if (value !== undefined) {
        return value;
    } else {
        var v = vars.first;
        return dpll1Rec(term, vars.rest, valuation.add(v, true))
                 || dpll1Rec(term, vars.rest, valuation.add(v, false));
    }
}
