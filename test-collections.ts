/**
 * Created by tc on 2/May/2014.
 */

/// <reference path="./collections.ts" />

var myFlist = flist(1, 2, 3, 4);
console.log(myFlist.toString() === '[1, 2, 3, 4]');


console.log(myFset.toString() === '{1, 2, 3, 4}');
console.log(yourFset.toString() === '{2, 4, 6, 8}');
// myFset.forEach(i => console.log(i));

console.log(fset<number>().isEmpty());
console.log(!myFset.isEmpty());

console.log(!myFset.subset(yourFset));
console.log(!yourFset.subset(myFset));
console.log(fset(1, 2, 3).subset(myFset));
console.log(fset<number>().subset(myFset));
console.log(!myFset.subset(fset<number>()));

console.log(fset<number>().equals(fset<number>()));
console.log(myFset.equals(myFset));
console.log(myFset.equals(fset(4, 3, 2, 1)));

console.log(myFset.add(5).equals(fset(1, 2, 3, 4, 5)));
console.log(fset<number>().add(1).add(2).equals(fset(1, 2)));
console.log(fset<number>().add(2).add(1).equals(fset(1, 2)));
