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
        var result = this.lhs.variables();
        result.union(this.rhs.variables());
        return result;
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
    Top.prototype.variables = function () {
        return new collections.Set();
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
    Bottom.prototype.variables = function () {
        return new collections.Set();
    };
    return Bottom;
})();

function f() {
    return new Top();
}

/// Implementation of Literals and General Terms
var variables = {};

var Variable = (function () {
    function Variable(name) {
        if (typeof name === "undefined") { name = anonymousVariableName(); }
        this.name = name;
        this.name = name;
        variables[name] = this;
    }
    Variable.prototype.toString = function () {
        return this.name;
    };
    Variable.prototype.evaluate = function (valuation) {
        return valuation[this.name];
    };
    Variable.prototype.variables = function () {
        var result = new collections.Set();
        result.add(this);
        return result;
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
    throw ('Cannot create variable from ' + name);
}

var v = makeVariable;

var negations = {};

var Negation = (function () {
    function Negation(variable) {
        this.variable = variable;
        negations[variable.name] = this;
    }
    Negation.prototype.toString = function () {
        return '¬' + this.variable.name;
    };
    Negation.prototype.evaluate = function (valuation) {
        var value = valuation[this.variable.name];
        if (value === undefined) {
            return undefined;
        }
        return !value;
    };
    Negation.prototype.variables = function () {
        var result = new collections.Set();
        result.add(this.variable);
        return result;
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
        var vl = this.lhs.evaluate(valuation);
        var vr = this.rhs.evaluate(valuation);
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
        var vl = this.lhs.evaluate(valuation);
        var vr = this.rhs.evaluate(valuation);
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
        var vl = this.lhs.evaluate(valuation);
        var vr = this.rhs.evaluate(valuation);
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
        var vl = this.lhs.evaluate(valuation);
        var vr = this.rhs.evaluate(valuation);
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
var Clause = (function (_super) {
    __extends(Clause, _super);
    function Clause(literalArray) {
        _super.call(this);
        for (var i = 0; i < literalArray.length; i++) {
            this.add(makeLiteral(literalArray[i]));
        }
    }
    Clause.prototype.evaluate = function (valuation) {
        var result = false;
        this.forEach(function (l) {
            var value = l.evaluate(valuation);
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
    };
    return Clause;
})(collections.Set);

var Cnf = (function (_super) {
    __extends(Cnf, _super);
    function Cnf(clauseArrays) {
        _super.call(this);
        for (var i = 0; i < clauseArrays.length; i++) {
            this.add(new Clause(clauseArrays[i]));
        }
    }
    Cnf.prototype.evaluate = function (valuation) {
        var result = true;
        this.forEach(function (c) {
            var value = c.evaluate(valuation);
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
    };
    return Cnf;
})(collections.Set);

/// Truth-table evaluation
function ttTautology(term) {
    return ttEntails(t(), term);
}

function ttEntails(kb, term) {
    return ttCheckAll(kb, term, term.variables(), {});
}

function ttCheckAll(kb, term, vars, valuation) {
    if (vars.isEmpty()) {
        if (kb.evaluate(valuation)) {
            return term.evaluate(valuation);
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

function ttSatisfiable(term) {
    return ttCheckAny(term, term.variables(), {});
}

function ttCheckAny(term, vars, valuation) {
    if (vars.isEmpty()) {
        return term.evaluate(valuation);
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
//# sourceMappingURL=boolean.js.map
