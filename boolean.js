/**
* Created by tc on 27/Apr/2014.
*/
/// <reference path="./collections.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var variableCounter = 0;

function anonymousVariableName() {
    return '_' + variableCounter++;
}

var BinaryOperator = (function () {
    function BinaryOperator(lhs, rhs) {
        this.lhs = lhs;
        this.rhs = rhs;
    }
    BinaryOperator.prototype.variables = function () {
        return this.lhs.variables().union(this.rhs.variables());
    };
    return BinaryOperator;
})();

var Top = (function () {
    function Top() {
    }
    Top.prototype.toString = function () {
        return 'true';
    };
    Top.prototype.evaluate = function (valuation) {
        return true;
    };
    Top.prototype.evaluate3 = function (valuation) {
        return true;
    };
    Top.prototype.variables = function () {
        return fset();
    };
    return Top;
})();

function t() {
    return new Top();
}

var Bottom = (function () {
    function Bottom() {
    }
    Bottom.prototype.toString = function () {
        return 'false';
    };
    Bottom.prototype.evaluate = function (valuation) {
        return false;
    };
    Bottom.prototype.evaluate3 = function (valuation) {
        return false;
    };
    Bottom.prototype.variables = function () {
        return fset();
    };
    return Bottom;
})();

function f() {
    return new Bottom();
}

/// Implementation of Literals and General Terms
var variables = {};

var Variable = (function () {
    function Variable(name) {
        if (typeof name === "undefined") { name = anonymousVariableName(); }
        this.name = name;
        variables[name] = this;
    }
    Variable.prototype.toString = function () {
        return this.name;
    };
    Variable.prototype.evaluate = function (valuation) {
        var value = valuation.value(this);
        if (value === undefined) {
            throw ('Cannot evaluate undefined variable ' + this.name);
        }
        return value;
    };
    Variable.prototype.evaluate3 = function (valuation) {
        // console.log('Variable.evaluate3:', valuation);
        return valuation.value(this);
    };
    Variable.prototype.variables = function () {
        return fset(this);
    };
    return Variable;
})();

function makeVariable(name) {
    if (typeof name === "undefined") { name = anonymousVariableName(); }
    if (name instanceof Variable) {
        return name;
    }
    if (typeof name === 'string') {
        var variable = variables[name];
        if (variable) {
            return variable;
        }
        return new Variable(name);
    }
    throw ('Cannot create subterm from ' + name);
}

var v = makeVariable;

// Create a valuation (i.e., an IFMap<Variable,boolean>) from an object.
function eta(object) {
    var result = fmap();
    Object.getOwnPropertyNames(object).forEach(function (p) {
        result = result.add(makeVariable(p), object[p]);
    });
    return result;
}

var negations = {};

var Negation = (function () {
    function Negation(subterm) {
        this.subterm = subterm;
        if (subterm instanceof Variable) {
            negations[subterm.name] = this;
        }
    }
    Negation.prototype.toString = function () {
        // TODO: Need to put parentheses around subterm (somtimes).
        return '¬' + this.subterm.toString();
    };
    Negation.prototype.evaluate = function (valuation) {
        return !this.subterm.evaluate(valuation);
    };
    Negation.prototype.evaluate3 = function (valuation) {
        var value = this.subterm.evaluate3(valuation);
        if (value === undefined) {
            return undefined;
        }
        return !value;
    };
    Negation.prototype.variables = function () {
        return this.subterm.variables();
    };
    return Negation;
})();

function makeLiteral(l) {
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
    throw ('Cannot negate' + v);
}

var And = (function (_super) {
    __extends(And, _super);
    function And(lhs, rhs) {
        _super.call(this, lhs, rhs);
        this.lhs = lhs;
        this.rhs = rhs;
    }
    And.prototype.evaluate = function (valuation) {
        return this.lhs.evaluate(valuation) && this.rhs.evaluate(valuation);
    };
    And.prototype.evaluate3 = function (valuation) {
        var vl = this.lhs.evaluate3(valuation);
        var vr = this.rhs.evaluate3(valuation);
        if (vl === false || vr === false) {
            return false;
        }
        if (vl === undefined || vr === undefined) {
            return undefined;
        }
        return true;
    };
    return And;
})(BinaryOperator);

function and(lhs, rhs) {
    return new And(lhs, rhs);
}

var Or = (function (_super) {
    __extends(Or, _super);
    function Or(lhs, rhs) {
        _super.call(this, lhs, rhs);
        this.lhs = lhs;
        this.rhs = rhs;
    }
    Or.prototype.evaluate = function (valuation) {
        return this.lhs.evaluate(valuation) || this.rhs.evaluate(valuation);
    };
    Or.prototype.evaluate3 = function (valuation) {
        var vl = this.lhs.evaluate3(valuation);
        var vr = this.rhs.evaluate3(valuation);
        if (vl === true || vr === true) {
            return true;
        }
        if (vl === undefined || vr === undefined) {
            return undefined;
        }
        return false;
    };
    return Or;
})(BinaryOperator);

function or(lhs, rhs) {
    return new Or(lhs, rhs);
}

var Implication = (function (_super) {
    __extends(Implication, _super);
    function Implication(lhs, rhs) {
        _super.call(this, lhs, rhs);
        this.lhs = lhs;
        this.rhs = rhs;
    }
    Implication.prototype.evaluate = function (valuation) {
        return !this.lhs.evaluate(valuation) || this.rhs.evaluate(valuation);
    };
    Implication.prototype.evaluate3 = function (valuation) {
        var vl = this.lhs.evaluate3(valuation);
        var vr = this.rhs.evaluate3(valuation);
        if (vl === false || vr === true) {
            return true;
        }
        if (vl === true && vr === false) {
            return false;
        }
        return undefined;
    };
    return Implication;
})(BinaryOperator);

function imp(lhs, rhs) {
    return new Implication(lhs, rhs);
}

var Equivalence = (function (_super) {
    __extends(Equivalence, _super);
    function Equivalence(lhs, rhs) {
        _super.call(this, lhs, rhs);
        this.lhs = lhs;
        this.rhs = rhs;
    }
    Equivalence.prototype.evaluate = function (valuation) {
        return this.lhs.evaluate(valuation) === this.rhs.evaluate(valuation);
    };
    Equivalence.prototype.evaluate3 = function (valuation) {
        var vl = this.lhs.evaluate3(valuation);
        var vr = this.rhs.evaluate3(valuation);
        if (vl === undefined || vr === undefined) {
            return undefined;
        }
        return vl === vr;
    };
    return Equivalence;
})(BinaryOperator);

function iff(lhs, rhs) {
    return new Equivalence(lhs, rhs);
}

/// Clauses and CNF
function evaluateLiteralSet(literals, valuation) {
    if (literals.isEmpty()) {
        return false;
    }
    var choice = literals.pickElement();
    return choice.element.evaluate(valuation) || evaluateLiteralSet(choice.newSet, valuation);
}

// This function evaluates the set of literals in a clause.
//
function evaluate3LiteralSet(literals, valuation) {
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

function evaluateClauseSet(clauses, valuation) {
    if (clauses.isEmpty()) {
        return true;
    }
    var choice = clauses.pickElement();
    return choice.element.evaluate(valuation) && evaluateClauseSet(choice.newSet, valuation);
}

// This function evaluates the set of clauses in a formula in CNF.
//
function evaluate3ClauseSet(clauses, valuation) {
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

var Clause = (function () {
    function Clause(literalArray) {
        var literals = fset();
        for (var i = 0; i < literalArray.length; i++) {
            literals = literals.add(makeLiteral(literalArray[i]));
        }
        this.literals = literals;
    }
    Clause.prototype.evaluate = function (valuation) {
        // console.log("Clause: evaluate()")
        return evaluateLiteralSet(this.literals, valuation);
    };
    Clause.prototype.evaluate3 = function (valuation) {
        // console.log("Clause: evaluate3()")
        return evaluate3LiteralSet(this.literals, valuation);
    };
    Clause.prototype.variables = function () {
        var result = fset();
        this.literals.forEach(function (l) {
            result = result.union(l.variables());
        });
        return result;
    };
    Clause.prototype.toString = function () {
        return this.literals.toString();
    };
    return Clause;
})();

var Cnf = (function () {
    function Cnf(clauseArrays) {
        var clauses = fset();
        for (var i = 0; i < clauseArrays.length; i++) {
            var newClause = new Clause(clauseArrays[i]);

            // console.log('Adding clause', newClause);
            clauses = clauses.add(newClause);
        }
        this.clauses = clauses;
    }
    Cnf.prototype.evaluate = function (valuation) {
        // console.log("Cnf: evaluate:", valuation.toString())
        return evaluateClauseSet(this.clauses, valuation);
    };
    Cnf.prototype.evaluate3 = function (valuation) {
        // console.log("Cnf: evaluate3:", valuation.toString())
        return evaluate3ClauseSet(this.clauses, valuation);
    };
    Cnf.prototype.variables = function () {
        var result = fset();
        this.clauses.forEach(function (c) {
            result = result.union(c.variables());
        });
        return result;
    };
    return Cnf;
})();

/// Truth-table evaluation
function ttTautology(term) {
    return ttEntails(t(), term);
}

function ttEntails(kb, term) {
    return ttCheckAll(kb, term, term.variables(), fmap());
}

function ttCheckAll(kb, term, vars, valuation) {
    if (vars.isEmpty()) {
        if (kb.evaluate(valuation)) {
            return term.evaluate(valuation);
        } else {
            return true;
        }
    } else {
        var v = vars.first;
        return ttCheckAll(kb, term, vars.rest, valuation.add(v, true)) && ttCheckAll(kb, term, vars.rest, valuation.add(v, false));
    }
}

function ttSatisfiable(term) {
    return ttCheckAny(term, term.variables(), fmap());
}

function ttCheckAny(term, vars, valuation) {
    if (vars.isEmpty()) {
        return term.evaluate3(valuation);
    } else {
        var v = vars.first;
        return ttCheckAny(term, vars.rest, valuation.add(v, true)) || ttCheckAny(term, vars.rest, valuation.add(v, false));
    }
}

function dpll1(term) {
    return dpll1Rec(term, term.variables(), fmap());
}

function dpll1Rec(term, vars, valuation) {
    var value = term.evaluate3(valuation);
    if (value !== undefined) {
        return value;
    } else {
        var v = vars.first;
        return dpll1Rec(term, vars.rest, valuation.add(v, true)) || dpll1Rec(term, vars.rest, valuation.add(v, false));
    }
}
//# sourceMappingURL=boolean.js.map
