import * as sum from './sum.js';

test('adds 1 + 2 to equal 3', () => {
  expect(sum.sum(1, 2)).toBe(3);
});