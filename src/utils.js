const add = (a, b) => {
  return a + b;
};

const subtract = (a, b) => {
  return a - b;
};

const divide = (a, b) => {
  if (b == 0) return 0;
  const result = a / b;
  return result;
};

module.exports = { add, subtract, divide };
