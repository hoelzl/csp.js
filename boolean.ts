/**
 * Created by tc on 27/Apr/2014.
 */
/// <reference path="./collections.ts" />

var variableCounter = 0;

function anonymousVariableName () {
    return '_' + variableCounter++;
}

interface Evaluable {
    evaluate (valuation): boolean;   // true or false
    evaluate3 (valuation): boolean;  // true, false or undefined
}

interface HasVariables {
    variables(): collections.Set<Variable>;
}

interface Term extends Evaluable, HasVariables {
}

class BinaryOperator implements HasVariables {
    constructor (public lhs: Term, public rhs: Term) {}
    variables () {
        var result = this.lhs.variables();
        result.union(this.rhs.variables());
        return result;
    }
}

interface Literal extends Term {
}

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
        return new collections.Set<Variable>();
    }
}

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
        return new collections.Set<Variable>();
    }
}

function f (): Term {
    return new Bottom();
}

/// Implementation of Literals and General Terms

var variables = {};

class Variable implements Literal {
    constructor (public name: string = anonymousVariableName()) {
        this.name = name;
        variables[name] = this;
    }
    toString (): string {
        return this.name;
    }
    evaluate (valuation): boolean {
        var value = valuation[this.name];
        if (value === undefined) {
            throw('Cannot evaluate undefined variable ' + this.name);
        }
        return  value;
    }
    evaluate3 (valuation): boolean {
        return valuation[this.name];
    }
    variables () {
        var result = new collections.Set<Variable>();
        result.add(this);
        return result;
    }
}

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

var v = makeVariable;

var negations = {};

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
        var result = new collections.Set<Variable>();
        result.union(this.subterm.variables());
        return result;
    }
}

function makeLiteral(l: any) {
    if (l instanceof Variable || l instanceof Negation) {
        return l;
    }
    return makeVariable(l);
}

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

class Clause extends collections.Set<Literal> implements Evaluable {
    constructor (literalArray: Array<any>) {
        super();
        for (var i = 0; i < literalArray.length; i++) {
            this.add(makeLiteral(literalArray[i]));
        }
    }
    evaluate (valuation): boolean {
        var result = false;
        this.forEach(l => {
            if (l.evaluate(valuation)) {
                result = true;
                // Break from loop.
                return false;
            }
            // Continue loop.
            return true;
        });
        return result;
    }
    evaluate3 (valuation): boolean {
        var result = false;
        this.forEach(l => {
            var value = l.evaluate3(valuation);
            if (value) {
                result = true;
                // Break from loop.
                return false;
            } else {
                if (value === undefined) {
                    result = undefined;
                }
                // Continue loop.
                return true;
            }
        });
        return result;
    }
}


class Cnf extends collections.Set<Clause> implements Evaluable {
    constructor (clauseArrays: Array<any>) {
        super();
        for (var i = 0; i < clauseArrays.length; i++) {
            this.add(new Clause(clauseArrays[i]));
        }
    }
    evaluate (valuation): boolean {
        var result = true;
        this.forEach(c => {
            if (!c.evaluate(valuation)) {
                result = false;
                // Break from loop.
                return false;
            }
            // Continue loop.
            return true;
        });
        return result;
    }
    evaluate3 (valuation): boolean {
        var result = true;
        this.forEach(c => {
            var value = c.evaluate3(valuation);
            if (value === false) {
                result = false;
                // Break from loop.
                return false;
            } else {
                if (value === undefined) {
                    result = undefined;
                }
                // Continue loop.
                return true;
            }
        });
        return result;
    }
}


/// Truth-table evaluation

function ttTautology (term: Term): boolean {
    return ttEntails(t(), term);
}

function ttEntails (kb: Term, term: Term): boolean {
    return ttCheckAll(kb, term, term.variables(), {});
}

function ttCheckAll (kb: Term, term: Term, vars: collections.Set<Variable>,
                     valuation: Object) {
    if (vars.isEmpty()) {
        if (kb.evaluate3(valuation)) {
            return term.evaluate3(valuation);
        } else {
            return true;
        }
    } else {
        var v = vars.pickAny();
        valuation[v.name] = true;
        var res = ttCheckAll(kb, term, vars, valuation);
        valuation[v.name] = false;
        return res && ttCheckAll(kb, term, vars, valuation);
    }
}

function ttSatisfiable (term): boolean {
    return ttCheckAny (term, term.variables(), {});
}

function ttCheckAny (term: Term, vars: collections.Set<Variable>,
                     valuation: Object) {
    if (vars.isEmpty()) {
        return term.evaluate3(valuation);
    } else {
        var v = vars.pickAny();
        valuation[v.name] = true;
        var res = ttCheckAny(term, vars, valuation);
        if (res) {
            return true;
        }
        valuation[v.name] = false;
        return ttCheckAny(term, vars, valuation);
    }
}

