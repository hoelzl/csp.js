/**
* Created by tc on 1/May/2014.
*/

var EmptyFList = (function () {
    function EmptyFList() {
    }
    Object.defineProperty(EmptyFList.prototype, "first", {
        get: function () {
            return undefined;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(EmptyFList.prototype, "rest", {
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });

    EmptyFList.prototype.isEmpty = function () {
        return true;
    };

    EmptyFList.prototype.toString = function () {
        return '[]';
    };
    return EmptyFList;
})();

var FList = (function () {
    function FList(first, rest) {
        this.first = first;
        this.rest = rest;
    }
    FList.prototype.isEmpty = function () {
        return false;
    };

    FList.prototype.toString = function () {
        var result = '[', separator = '';
        var remainder = this;
        while (remainder.first) {
            result += separator + remainder.first;
            separator = ', ';
            remainder = remainder.rest;
        }
        result += ']';
        return result;
    };
    return FList;
})();

function flist() {
    var members = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        members[_i] = arguments[_i + 0];
    }
    var result = new EmptyFList();
    for (var i = members.length - 1; i >= 0; --i) {
        result = new FList(members[i], result);
    }
    return result;
}


var EmptyFMap = (function () {
    function EmptyFMap() {
    }
    Object.defineProperty(EmptyFMap.prototype, "first", {
        get: function () {
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EmptyFMap.prototype, "rest", {
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });
    EmptyFMap.prototype.contains = function (key) {
        return false;
    };
    EmptyFMap.prototype.value = function (key) {
        return undefined;
    };
    EmptyFMap.prototype.add = function (key, value) {
        return new FMap({ key: key, value: value }, this);
    };
    EmptyFMap.prototype.toString = function () {
        return '<>';
    };
    return EmptyFMap;
})();

var FMap = (function () {
    function FMap(first, rest) {
        this.first = first;
        this.rest = rest;
    }
    FMap.prototype.contains = function (key) {
        if (this.first.key === key) {
            return true;
        }
        return this.rest.contains(key);
    };

    FMap.prototype.value = function (key) {
        if (this.first.key === key) {
            return this.first.value;
        }
        return this.rest.value(key);
    };

    FMap.prototype.add = function (key, value) {
        return new FMap({ key: key, value: value }, this);
    };

    FMap.prototype.toString = function () {
        var result = '<', separator = '';
        var remainder = this;
        while (remainder.first) {
            result += separator + remainder.first.key + ' = ' + remainder.first.value;
            separator = ', ';
            remainder = remainder.rest;
        }
        result += '>';
        return result;
    };
    return FMap;
})();

function fmap() {
    var members = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        members[_i] = arguments[_i + 0];
    }
    var result = new EmptyFMap();
    for (var i = members.length - 1; i >= 0; --i) {
        result = new FMap(members[i], result);
    }
    return result;
}



var EmptyFSet = (function () {
    function EmptyFSet() {
    }
    Object.defineProperty(EmptyFSet.prototype, "first", {
        get: function () {
            return undefined;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(EmptyFSet.prototype, "rest", {
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });

    EmptyFSet.prototype.isEmpty = function () {
        return true;
    };

    EmptyFSet.prototype.add = function (newElement) {
        if (this.contains(newElement)) {
            return this;
        } else {
            return new FSet(newElement, this);
        }
    };

    EmptyFSet.prototype.remove = function (element) {
        return this;
    };

    EmptyFSet.prototype.contains = function (element) {
        return false;
    };

    EmptyFSet.prototype.pickElement = function () {
        throw ('Cannot choose an element from the empty set.');
    };

    EmptyFSet.prototype.union = function (otherSet) {
        return otherSet;
    };

    EmptyFSet.prototype.subset = function (otherSet) {
        return true;
    };

    EmptyFSet.prototype.equals = function (otherSet) {
        return otherSet.subset(this);
    };

    EmptyFSet.prototype.forEach = function (f) {
        // Do nothing.
    };

    EmptyFSet.prototype.toString = function () {
        return '{}';
    };
    return EmptyFSet;
})();

var FSet = (function () {
    function FSet(first, rest) {
        this.first = first;
        this.rest = rest;
    }
    FSet.prototype.isEmpty = function () {
        return false;
    };

    FSet.prototype.add = function (newElement) {
        if (this.contains(newElement)) {
            return this;
        } else {
            return new FSet(newElement, this);
        }
    };

    FSet.prototype.remove = function (element) {
        if (!this.contains(element)) {
            return this;
        }
        if (this.first === element) {
            return this.rest;
        } else {
            return new FSet(element, this.rest.remove(element));
        }
    };

    FSet.prototype.contains = function (element) {
        if (this.first === element) {
            return true;
        } else {
            return this.rest.contains(element);
        }
    };

    FSet.prototype.pickElement = function () {
        return { element: this.first, newSet: this.rest };
    };

    FSet.prototype.union = function (otherSet) {
        return new FSet(this.first, this.rest.union(otherSet));
    };

    FSet.prototype.subset = function (otherSet) {
        return otherSet.contains(this.first) && this.rest.subset(otherSet);
    };

    FSet.prototype.equals = function (otherSet) {
        return this.subset(otherSet) && otherSet.subset(this);
    };

    FSet.prototype.forEach = function (f) {
        f(this.first);
        this.rest.forEach(f);
    };

    FSet.prototype.toString = function () {
        var result = '{', separator = '';
        var remainingSet = this;
        while (remainingSet.first) {
            result += separator + remainingSet.first;
            separator = ', ';
            remainingSet = remainingSet.rest;
        }
        result += '}';
        return result;
    };
    return FSet;
})();

function fset() {
    var elements = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        elements[_i] = arguments[_i + 0];
    }
    var result = new EmptyFSet();
    for (var i = elements.length - 1; i >= 0; --i) {
        result = new FSet(elements[i], result);
    }
    return result;
}

var myFset = fset(1, 2, 3, 4);
var yourFset = fset(2, 4, 6, 8);
//# sourceMappingURL=collections.js.map
