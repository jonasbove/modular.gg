import {getFunctions} from '../api/templates/functions';

let client = {};
const functions = getFunctions(client);

test('Gives output number', async () => 
expect(await (() => {
    let obj = {inputNumber: 33};
    return functions.node_Number(obj).outputNumber;
})()).toBe(33)
);

test('Greater Than', () => 
expect((() => {
    let obj = {a: 4, b: 3};
    return functions.node_GreaterThan(obj).result;
})()).toBe(true)
);

test('Greater Than', () => 
expect((() => {
    let obj = {a: 1, b: 900};
    return functions.node_GreaterThan(obj).result;
})()).toBe(false)
);

test('Generates random number', () => 
expect((() => {
    let obj = {max: 1000, min: 400};
    let res = functions.node_RandomNumber(obj).num;
    return isNaN(res);
})()).toBe(false)
);

test('Generates random number', () => 
expect((() => {
    let obj = {max: 1000, min: 1};
    let res = functions.node_RandomNumber(obj).num;
    return res > 1 && res < 1000;
})()).toBe(true)
);

test('Convert number to text', () => 
expect((() => {
    let obj = {num: 4};
    let res = functions.node_ConvertNumToText(obj);
    return typeof(res.text) === 'string';
})()).toBe(true)
);

test('Add two numbers', async () => 
expect(await (() => {
    let obj = {a: 4, b: 3};
    return functions.node_Add(obj).sum;
})()).toBe(7)
);

test('Subtracts two numbers', async () => 
expect(await (() => {
    let obj = {a: 4, b: 3};
    return functions.node_Sub(obj).subtraction;
})()).toBe(1)
);

test('Multiply two numbers', async () => 
expect(await (() => {
    let obj = {a: 4, b: 3};
    return functions.node_Multiply(obj).product;
})()).toBe(12)
);

test('Squares a number', async () => 
expect(await (() => {
    let obj = {a: 9};
    return functions.node_Sqrt(obj).square;
})()).toBe(3)
);

test('Divides two numbers', async () => 
expect(await (() => {
    let obj = {a: 4, b: 2};
    return functions.node_Div(obj).div;
})()).toBe(2)
);