/**
 * Created by tc on 1/May/2014.
 */

// An implementation of functional lists.

interface IFList<T> {
    first: T;
    rest: IFList<T>;
    isEmpty (): boolean;
}

class EmptyFList<T> implements IFList<T> {
    get first (): T {
        return undefined;
    }

    get rest (): IFList<T> {
        return this;
    }

    isEmpty (): boolean {
        return true;
    }

    toString (): string {
        return '[]';
    }
}

class FList<T> implements IFList<T> {
    constructor (public first: T, public rest: IFList<T>) {}

    isEmpty (): boolean {
        return false;
    }

    toString (): string {
        var result = '[', separator = '';
        var remainder: IFList<T> = this;
        while (remainder.first) {
            result += separator + remainder.first;
            separator = ', ';
            remainder = remainder.rest;
        }
        result += ']';
        return result;
    }
}

function flist<T> (... members: T[]) {
    var result = new EmptyFList<T>();
    for (var i = members.length - 1; i >= 0; --i) {
        result = new FList(members[i], result);
    }
    return result;
}

// An inefficient implementation of functional maps.

interface IPair<K,V> {
    key: K;
    value: V;
}

interface IFMap<K,V> {
    // These two memebers do not really belong in this interface; but since I
    // am not developing a general purpose library  here, I'll opt for the
    // simpler implementation that this interface provides.
    first: IPair<K,V>;
    rest: IFMap<K,V>;

    // Returns true, if `key' is contained in the map, false otherwise.
    contains (key: K): boolean;

    // Returns the value for `key', or `undefined' if `key' is not contained in
    // the map.
    value (key: K): V;

    // REturn a map containing the mappings of `this' and mapping `key' to
    // `value'.  If a value for `key' is already in the map it is shadowed by
    // the new value.
    add (key: K, value: V): IFMap<K,V>;
}

class EmptyFMap<K,V> implements IFMap<K,V> {
    get first (): IPair<K,V> {
        return undefined;
    }
    get rest (): IFMap<K,V> {
        return this;
    }
    contains (key: K): boolean {
        return false;
    }
    value (key: K): V {
        return undefined;
    }
    add (key: K, value: V) {
        return new FMap({key: key, value: value}, this);
    }
    toString (): string {
        return '<>';
    }
}

class FMap<K,V> implements IFMap<K,V> {
    constructor (public first: IPair<K,V>, public rest: IFMap<K,V>) {}

    contains (key: K): boolean {
        if (this.first.key === key) {
            return true;
        }
        return this.rest.contains(key);
    }

    value (key: K): V {
        if (this.first.key === key) {
            return this.first.value;
        }
        return this.rest.value(key);
    }

    add (key: K, value: V) {
        return new FMap({key: key, value: value}, this);
    }

    toString (): string {
        var result = '<', separator = '';
        var remainder: IFMap<K,V> = this;
        while (remainder.first) {
            result += separator + remainder.first.key + ' = ' +
              remainder.first.value;
            separator = ', ';
            remainder = remainder.rest;
        }
        result += '>';
        return result;
    }
}


function fmap<K,V> (... members: IPair<K,V>[]) {
    var result = new EmptyFMap<K,V>();
    for (var i = members.length - 1; i >= 0; --i) {
        result = new FMap(members[i], result);
    }
    return result;
}


// An extremely inefficient implementation of functional sets.

interface Choice<T> {
    element: T;
    newSet: IFSet<T>;
}


// The interface IFSet<T> describes functional sets with members of type `T'.
// No operation in this interface modifies the original set; they all return a
// new set (that may share structure with the original set).
interface IFSet<T> {
    // These two memebers do not really belong in this interface; but since I
    // am not developing a general purpose library  here, I'll opt for the
    // simpler implementation that this interface provides.
    first: T;
    rest: IFSet<T>;

    // True if the set is empty.
    isEmpty (): boolean;

    // Returns a new set that contains all elements of `this' and `newElement'.
    add (newElement: T): IFSet<T>;

    // Returns a new set that contalins all elements of `this' except `element'.
    remove (element: T): IFSet<T>;

    // Returns true if `this' contains `element', false otherwise.
    contains (element: T): boolean;

    // Chooses a random element from `this' and returns a choice consisiting of
    // that element and a set consisiting of all members of `this' except
    // `element'.
    pickElement (): Choice<T>;

    // Returns the union of `this' and `otherSet'.
    union (otherSet: IFSet<T>): IFSet<T>;

    // Returns true of `this' is a (non-strict) subset of `otherSet', false
    // otherwise.
    subset (otherSet: IFSet<T>): boolean;

    // Returns true if `this' and `otherSet' contain the same members.
    equals (otherSet: IFSet<T>): boolean;

    // Evaluate a function (for effect) for each member of the set.
    forEach (f: (t: T) => void): void;
}

class EmptyFSet<T> implements IFSet<T> {
    constructor () {}

    get first (): T {
        return undefined;
    }

    get rest (): IFSet<T> {
        return this;
    }

    isEmpty (): boolean {
        return true;
    }

    add (newElement: T): IFSet<T> {
        if (this.contains(newElement)) {
            return this;
        } else {
            return new FSet(newElement, this);
        }
    }

    remove (element: T): IFSet<T> {
        return this;
    }

    contains (element: T): boolean {
        return false;
    }

    pickElement (): Choice<T> {
        throw('Cannot choose an element from the empty set.');
    }

    union (otherSet: IFSet<T>): IFSet<T> {
        return otherSet;
    }

    subset (otherSet: IFSet<T>): boolean {
        return true;
    }

    equals (otherSet: IFSet<T>): boolean {
        return otherSet.subset(this);
    }

    forEach (f: (t: T) => void): void {
        // Do nothing.
    }

    toString (): string {
        return '{}';
    }
}

class FSet<T> implements IFSet<T> {
    constructor (public first: T, public rest: IFSet<T>) {}

    isEmpty () {
        return false;
    }

    add (newElement: T): IFSet<T> {
        if (this.contains(newElement)) {
            return this;
        } else {
            return new FSet<T>(newElement, this);
        }
    }

    remove (element: T): IFSet<T> {
        if (!this.contains(element)) {
            return this;
        }
        if (this.first === element) {
            return this.rest;
        } else {
            return new FSet<T>(element, this.rest.remove(element));
        }
    }

    contains (element: T): boolean {
        if (this.first === element) {
            return true;
        } else {
            return this.rest.contains(element);
        }
    }

    pickElement (): Choice<T> {
        return {element: this.first, newSet: this.rest};
    }

    union (otherSet: IFSet<T>): IFSet<T> {
        return new FSet<T>(this.first, this.rest.union(otherSet));
    }

    subset (otherSet: IFSet<T>): boolean {
        return otherSet.contains(this.first) && this.rest.subset(otherSet);
    }

    equals (otherSet: IFSet<T>): boolean {
        return this.subset(otherSet) && otherSet.subset(this);
    }

    forEach (f: (t: T) => void): void {
        f(this.first);
        this.rest.forEach(f);
    }

    toString (): string {
        var result = '{', separator = '';
        var remainingSet: IFSet<T> = this;
        while (remainingSet.first) {
            result += separator + remainingSet.first;
            separator = ', ';
            remainingSet = remainingSet.rest;
        }
        result += '}';
        return result;
    }
}

function fset<T> (... elements: T[]): IFSet<T> {
    var result = new EmptyFSet<T>();
    for (var i = elements.length - 1; i >= 0; --i) {
        result = new FSet(elements[i], result);
    }
    return result;
}

var myFset: IFSet<number> = fset(1, 2, 3, 4);
var yourFset: IFSet<number> = fset(2, 4, 6, 8);
