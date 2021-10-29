const { add, subtract, divide } = require("../utils");

it("add should return sum", () => {
  expect(add(1, 2)).toBe(3);
});

it("subtract", () => {
  expect(subtract(10, 3)).toBe(7);
});

it("divide", () => {
  expect(divide(10, 5)).toBe(2);
});

it("divide by 0", () => {
  expect(divide(10, 0)).toBe(0);
});
