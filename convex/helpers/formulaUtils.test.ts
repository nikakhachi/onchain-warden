/**
 * Test file for formulaUtils.ts
 * Tests both validateFormula and evaluateFormula functions
 * Run with: npx tsx convex/helpers/formulaUtils.test.ts
 */

import { validateFormula, evaluateFormula, parseFormulaWithOperator, evaluateFormulaCondition } from "./formulaUtils";

// Mock formatUnits function for testing
function mockFormatUnits(value: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const quotient = value / divisor;
  const remainder = value % divisor;
  if (remainder === BigInt(0)) {
    return quotient.toString();
  }
  return `${quotient}.${remainder.toString().padStart(decimals, "0")}`;
}

// Test cases: [formula, expectedValid, testValue?, decimals?, expectedResult?]
const testCases: Array<{
  formula: string;
  expectedValid: boolean;
  testValue?: bigint | number;
  decimals?: number;
  expectedResult?: number;
  description: string;
}> = [
  // Basic arithmetic operations
  { formula: "value + 10", expectedValid: true, testValue: 5, expectedResult: 15, description: "Simple addition" },
  { formula: "value - 5", expectedValid: true, testValue: 10, expectedResult: 5, description: "Simple subtraction" },
  { formula: "value * 2", expectedValid: true, testValue: 3, expectedResult: 6, description: "Simple multiplication" },
  { formula: "value / 2", expectedValid: true, testValue: 10, expectedResult: 5, description: "Simple division" },
  {
    formula: "value * 2 + 5",
    expectedValid: true,
    testValue: 3,
    expectedResult: 11,
    description: "Multiple operations",
  },
  {
    formula: "(value + 5) * 2",
    expectedValid: true,
    testValue: 3,
    expectedResult: 16,
    description: "Parentheses grouping",
  },
  {
    formula: "value + value * 2",
    expectedValid: true,
    testValue: 5,
    expectedResult: 15,
    description: "Order of operations",
  },

  // Using pow function
  { formula: "pow(value, 2)", expectedValid: true, testValue: 5, expectedResult: 25, description: "Power of 2" },
  { formula: "pow(value, 3)", expectedValid: true, testValue: 3, expectedResult: 27, description: "Power of 3" },
  {
    formula: "pow(2, value)",
    expectedValid: true,
    testValue: 4,
    expectedResult: 16,
    description: "2 to the power of value",
  },
  {
    formula: "pow(1 + value, 2)",
    expectedValid: true,
    testValue: 2,
    expectedResult: 9,
    description: "Power with addition",
  },
  {
    formula: "pow(value, 0.5)",
    expectedValid: true,
    testValue: 16,
    expectedResult: 4,
    description: "Square root using pow",
  },
  {
    formula: "(pow(1 + value, 365) - 1) * 100",
    expectedValid: true,
    testValue: 0.01,
    expectedResult: (Math.pow(1.01, 365) - 1) * 100,
    description: "Daily to annual APY conversion",
  },
  {
    formula: "pow(value, 2) + pow(value, 3)",
    expectedValid: true,
    testValue: 2,
    expectedResult: 12,
    description: "Multiple pow operations",
  },

  // Using sqrt function
  { formula: "sqrt(value)", expectedValid: true, testValue: 16, expectedResult: 4, description: "Square root" },
  {
    formula: "sqrt(value * 4)",
    expectedValid: true,
    testValue: 4,
    expectedResult: 4,
    description: "Square root of multiplication",
  },
  {
    formula: "sqrt(pow(value, 2))",
    expectedValid: true,
    testValue: 5,
    expectedResult: 5,
    description: "Sqrt of power",
  },
  {
    formula: "pow(sqrt(value), 2)",
    expectedValid: true,
    testValue: 9,
    expectedResult: 9,
    description: "Power of sqrt",
  },

  // Using abs function
  {
    formula: "abs(value)",
    expectedValid: true,
    testValue: -5,
    expectedResult: 5,
    description: "Absolute value of negative",
  },
  {
    formula: "abs(value)",
    expectedValid: true,
    testValue: 5,
    expectedResult: 5,
    description: "Absolute value of positive",
  },
  {
    formula: "abs(value - 10)",
    expectedValid: true,
    testValue: 15,
    expectedResult: 5,
    description: "Absolute value of subtraction",
  },
  {
    formula: "abs(value) * 2",
    expectedValid: true,
    testValue: -3,
    expectedResult: 6,
    description: "Absolute value in multiplication",
  },

  // Using exp function
  {
    formula: "exp(value)",
    expectedValid: true,
    testValue: 1,
    expectedResult: Math.E,
    description: "Exponential function",
  },
  { formula: "exp(0)", expectedValid: true, testValue: 5, expectedResult: 1, description: "Exponential of 0" },
  {
    formula: "exp(value) * 2",
    expectedValid: true,
    testValue: 0,
    expectedResult: 2,
    description: "Exponential in multiplication",
  },

  // Using min/max functions
  { formula: "min(value, 10)", expectedValid: true, testValue: 5, expectedResult: 5, description: "Min function" },
  {
    formula: "min(value, 10)",
    expectedValid: true,
    testValue: 15,
    expectedResult: 10,
    description: "Min function with larger value",
  },
  { formula: "max(value, 10)", expectedValid: true, testValue: 5, expectedResult: 10, description: "Max function" },
  {
    formula: "max(value, 10)",
    expectedValid: true,
    testValue: 15,
    expectedResult: 15,
    description: "Max function with larger value",
  },
  {
    formula: "min(value, 20) + max(value, 5)",
    expectedValid: true,
    testValue: 10,
    expectedResult: 20,
    description: "Min and max combined",
  },

  // Using floor/ceil/round functions
  { formula: "floor(value)", expectedValid: true, testValue: 5.7, expectedResult: 5, description: "Floor function" },
  { formula: "ceil(value)", expectedValid: true, testValue: 5.3, expectedResult: 6, description: "Ceil function" },
  { formula: "round(value)", expectedValid: true, testValue: 5.5, expectedResult: 6, description: "Round function" },
  {
    formula: "floor(value) + ceil(value)",
    expectedValid: true,
    testValue: 5.5,
    expectedResult: 11,
    description: "Floor and ceil combined",
  },
  {
    formula: "round(value * 2)",
    expectedValid: true,
    testValue: 5.3,
    expectedResult: 11,
    description: "Round of multiplication",
  },

  // Using round with decimal places argument
  {
    formula: "round(value, 0)",
    expectedValid: true,
    testValue: 5.7,
    expectedResult: 6,
    description: "Round to 0 decimals (same as integer round)",
  },
  {
    formula: "round(value, 1)",
    expectedValid: true,
    testValue: 5.67,
    expectedResult: 5.7,
    description: "Round to 1 decimal place",
  },
  {
    formula: "round(value, 2)",
    expectedValid: true,
    testValue: 5.678,
    expectedResult: 5.68,
    description: "Round to 2 decimal places",
  },
  {
    formula: "round(value, 2)",
    expectedValid: true,
    testValue: 5.675,
    expectedResult: 5.68,
    description: "Round to 2 decimal places (rounds up)",
  },
  {
    formula: "round(value, 2)",
    expectedValid: true,
    testValue: 5.674,
    expectedResult: 5.67,
    description: "Round to 2 decimal places (rounds down)",
  },
  {
    formula: "round(value, 3)",
    expectedValid: true,
    testValue: 5.6789,
    expectedResult: 5.679,
    description: "Round to 3 decimal places",
  },
  {
    formula: "round(value, 4)",
    expectedValid: true,
    testValue: 5.67895,
    expectedResult: 5.679,
    description: "Round to 4 decimal places",
  },
  {
    formula: "round(value, 2)",
    expectedValid: true,
    testValue: 123.456789,
    expectedResult: 123.46,
    description: "Round large number to 2 decimals",
  },
  {
    formula: "round(value, 1)",
    expectedValid: true,
    testValue: 123.456789,
    expectedResult: 123.5,
    description: "Round large number to 1 decimal",
  },
  {
    formula: "round(value, 0)",
    expectedValid: true,
    testValue: 123.456789,
    expectedResult: 123,
    description: "Round large number to 0 decimals",
  },
  {
    formula: "round(value, 2)",
    expectedValid: true,
    testValue: 0.001234,
    expectedResult: 0,
    description: "Round small number to 2 decimals",
  },
  {
    formula: "round(value, 4)",
    expectedValid: true,
    testValue: 0.001234,
    expectedResult: 0.0012,
    description: "Round small number to 4 decimals",
  },
  {
    formula: "round(value, 2)",
    expectedValid: true,
    testValue: -5.678,
    expectedResult: -5.68,
    description: "Round negative number to 2 decimals",
  },
  {
    formula: "round(value, 1)",
    expectedValid: true,
    testValue: -5.65,
    expectedResult: -5.6,
    description: "Round negative number to 1 decimal",
  },
  {
    formula: "round(value * 100, 2)",
    expectedValid: true,
    testValue: 5.678,
    expectedResult: 567.8,
    description: "Round after multiplication",
  },
  {
    formula: "round(value / 100, 2)",
    expectedValid: true,
    testValue: 567.8,
    expectedResult: 5.68,
    description: "Round after division",
  },
  {
    formula: "round(pow(value, 2), 2)",
    expectedValid: true,
    testValue: 5.678,
    expectedResult: 32.24,
    description: "Round after power operation",
  },
  {
    formula: "round(sqrt(value), 3)",
    expectedValid: true,
    testValue: 10,
    expectedResult: 3.162,
    description: "Round after square root",
  },
  {
    formula: "round(value, 2) + round(value, 1)",
    expectedValid: true,
    testValue: 5.678,
    expectedResult: 5.68 + 5.7,
    description: "Multiple round operations",
  },
  {
    formula: "round(round(value, 3), 2)",
    expectedValid: true,
    testValue: 5.6789,
    expectedResult: 5.68,
    description: "Nested round operations",
  },
  {
    formula: "round(min(value, 10), 2)",
    expectedValid: true,
    testValue: 5.678,
    expectedResult: 5.68,
    description: "Round after min function",
  },
  {
    formula: "round(max(value, 5), 1)",
    expectedValid: true,
    testValue: 5.678,
    expectedResult: 5.7,
    description: "Round after max function",
  },
  {
    formula: "round(abs(value), 2)",
    expectedValid: true,
    testValue: -5.678,
    expectedResult: 5.68,
    description: "Round after abs function",
  },
  {
    formula: "round(value, 2)",
    expectedValid: true,
    testValue: 6.792827703686274,
    expectedResult: 6.79,
    description: "Round complex decimal to 2 places",
  },
  {
    formula: "round(value, 3)",
    expectedValid: true,
    testValue: 6.792827703686274,
    expectedResult: 6.793,
    description: "Round complex decimal to 3 places",
  },
  {
    formula: "round(value, 4)",
    expectedValid: true,
    testValue: 6.792827703686274,
    expectedResult: 6.7928,
    description: "Round complex decimal to 4 places",
  },
  {
    formula: "round(value, 6)",
    expectedValid: true,
    testValue: 6.792827703686274,
    expectedResult: 6.792828,
    description: "Round complex decimal to 6 places",
  },

  // Large number tests for pow function
  {
    formula: "pow(value, 2)",
    expectedValid: true,
    testValue: 1000,
    expectedResult: 1000000,
    description: "Power of 2 with large number",
  },
  {
    formula: "pow(value, 3)",
    expectedValid: true,
    testValue: 100,
    expectedResult: 1000000,
    description: "Power of 3 with large number",
  },
  {
    formula: "pow(2, value)",
    expectedValid: true,
    testValue: 10,
    expectedResult: 1024,
    description: "2 to the power of large number",
  },
  {
    formula: "pow(10, value)",
    expectedValid: true,
    testValue: 6,
    expectedResult: 1000000,
    description: "10 to the power of large number",
  },
  {
    formula: "pow(value, 0.5)",
    expectedValid: true,
    testValue: 1000000,
    expectedResult: 1000,
    description: "Square root using pow with large number",
  },
  {
    formula: "pow(value, 2) + pow(value, 3)",
    expectedValid: true,
    testValue: 100,
    expectedResult: 10000 + 1000000, // pow(100, 2) = 10000, pow(100, 3) = 1000000
    description: "Multiple pow operations with large numbers",
  },
  {
    formula: "pow(pow(value, 2), 2)",
    expectedValid: true,
    testValue: 10,
    expectedResult: 10000,
    description: "Nested pow with large number",
  },

  // Large number tests for sqrt function
  {
    formula: "sqrt(value)",
    expectedValid: true,
    testValue: 1000000,
    expectedResult: 1000,
    description: "Square root of large number",
  },
  {
    formula: "sqrt(value)",
    expectedValid: true,
    testValue: 100000000,
    expectedResult: 10000,
    description: "Square root of very large number",
  },
  {
    formula: "sqrt(value * 4)",
    expectedValid: true,
    testValue: 250000,
    expectedResult: 1000,
    description: "Square root of large multiplication",
  },
  {
    formula: "sqrt(pow(value, 2))",
    expectedValid: true,
    testValue: 1000,
    expectedResult: 1000,
    description: "Sqrt of power with large number",
  },
  {
    formula: "pow(sqrt(value), 2)",
    expectedValid: true,
    testValue: 1000000,
    expectedResult: 1000000,
    description: "Power of sqrt with large number",
  },
  {
    formula: "sqrt(value) * sqrt(value)",
    expectedValid: true,
    testValue: 10000,
    expectedResult: 10000,
    description: "Multiple sqrt operations with large number",
  },

  // Large number tests for abs function
  {
    formula: "abs(value)",
    expectedValid: true,
    testValue: -1000000,
    expectedResult: 1000000,
    description: "Absolute value of large negative number",
  },
  {
    formula: "abs(value)",
    expectedValid: true,
    testValue: 1000000,
    expectedResult: 1000000,
    description: "Absolute value of large positive number",
  },
  {
    formula: "abs(value - 1000000)",
    expectedValid: true,
    testValue: 1500000,
    expectedResult: 500000,
    description: "Absolute value of large subtraction",
  },
  {
    formula: "abs(value) * 2",
    expectedValid: true,
    testValue: -500000,
    expectedResult: 1000000,
    description: "Absolute value in multiplication with large number",
  },
  {
    formula: "abs(value) + abs(value)",
    expectedValid: true,
    testValue: -1000000,
    expectedResult: 2000000,
    description: "Multiple abs operations with large number",
  },

  // Large number tests for exp function
  {
    formula: "exp(value)",
    expectedValid: true,
    testValue: 5,
    expectedResult: Math.exp(5),
    description: "Exponential function with larger number",
  },
  {
    formula: "exp(value)",
    expectedValid: true,
    testValue: 10,
    expectedResult: Math.exp(10),
    description: "Exponential function with large number",
  },
  {
    formula: "exp(value) * 1000",
    expectedValid: true,
    testValue: 2,
    expectedResult: Math.exp(2) * 1000,
    description: "Exponential in multiplication with large multiplier",
  },
  {
    formula: "exp(value / 100)",
    expectedValid: true,
    testValue: 100,
    expectedResult: Math.exp(1),
    description: "Exponential with division of large number",
  },

  // Large number tests for min/max functions
  {
    formula: "min(value, 1000000)",
    expectedValid: true,
    testValue: 500000,
    expectedResult: 500000,
    description: "Min function with large numbers",
  },
  {
    formula: "min(value, 1000000)",
    expectedValid: true,
    testValue: 2000000,
    expectedResult: 1000000,
    description: "Min function with very large number",
  },
  {
    formula: "max(value, 1000000)",
    expectedValid: true,
    testValue: 500000,
    expectedResult: 1000000,
    description: "Max function with large numbers",
  },
  {
    formula: "max(value, 1000000)",
    expectedValid: true,
    testValue: 2000000,
    expectedResult: 2000000,
    description: "Max function with very large number",
  },
  {
    formula: "min(value, 2000000) + max(value, 500000)",
    expectedValid: true,
    testValue: 1000000,
    expectedResult: 2000000,
    description: "Min and max combined with large numbers",
  },

  // Large number tests for floor/ceil/round functions
  {
    formula: "floor(value)",
    expectedValid: true,
    testValue: 1234567.89,
    expectedResult: 1234567,
    description: "Floor function with large decimal number",
  },
  {
    formula: "ceil(value)",
    expectedValid: true,
    testValue: 1234567.12,
    expectedResult: 1234568,
    description: "Ceil function with large decimal number",
  },
  {
    formula: "round(value)",
    expectedValid: true,
    testValue: 1234567.5,
    expectedResult: 1234568,
    description: "Round function with large decimal number",
  },
  {
    formula: "floor(value / 1000) * 1000",
    expectedValid: true,
    testValue: 1234567,
    expectedResult: 1234000,
    description: "Floor with large number rounding",
  },
  {
    formula: "ceil(value / 1000) * 1000",
    expectedValid: true,
    testValue: 1234567,
    expectedResult: 1235000,
    description: "Ceil with large number rounding",
  },

  // Using 'x' alias
  { formula: "x + 10", expectedValid: true, testValue: 5, expectedResult: 15, description: "Using x alias" },
  { formula: "pow(x, 2)", expectedValid: true, testValue: 4, expectedResult: 16, description: "Power with x alias" },
  { formula: "x * x", expectedValid: true, testValue: 3, expectedResult: 9, description: "X multiplied by itself" },

  // Complex nested formulas
  {
    formula: "pow(1 + value / 100, 365) - 1",
    expectedValid: true,
    testValue: 1,
    expectedResult: Math.pow(1.01, 365) - 1,
    description: "Complex APY calculation",
  },
  {
    formula: "(value / 10000) * 100",
    expectedValid: true,
    testValue: 500,
    expectedResult: 5,
    description: "Basis points to percentage",
  },
  {
    formula: "value * pow(1.05, 12)",
    expectedValid: true,
    testValue: 100,
    expectedResult: 100 * Math.pow(1.05, 12),
    description: "Compound interest",
  },
  {
    formula: "sqrt(pow(value, 2) + pow(value, 2))",
    expectedValid: true,
    testValue: 3,
    expectedResult: Math.sqrt(18),
    description: "Nested sqrt and pow",
  },
  {
    formula: "abs(value - 100) / 100 * 100",
    expectedValid: true,
    testValue: 110,
    expectedResult: 10,
    description: "Percentage deviation",
  },
  {
    formula: "min(max(value, 0), 100)",
    expectedValid: true,
    testValue: 150,
    expectedResult: 100,
    description: "Clamp between 0 and 100",
  },
  {
    formula: "floor(value / 10) * 10",
    expectedValid: true,
    testValue: 47,
    expectedResult: 40,
    description: "Round down to nearest 10",
  },
  {
    formula: "ceil(value / 10) * 10",
    expectedValid: true,
    testValue: 43,
    expectedResult: 50,
    description: "Round up to nearest 10",
  },

  // Complex nested formulas with large numbers
  {
    formula: "pow(1 + value / 100, 365) - 1",
    expectedValid: true,
    testValue: 5,
    expectedResult: Math.pow(1.05, 365) - 1,
    description: "Complex APY calculation with larger rate",
  },
  {
    formula: "pow(1 + value / 100, 365) - 1",
    expectedValid: true,
    testValue: 10,
    expectedResult: Math.pow(1.1, 365) - 1,
    description: "Complex APY calculation with large rate",
  },
  {
    formula: "(value / 10000) * 100",
    expectedValid: true,
    testValue: 50000,
    expectedResult: 500,
    description: "Basis points to percentage with large number",
  },
  {
    formula: "value * pow(1.05, 12)",
    expectedValid: true,
    testValue: 1000000,
    expectedResult: 1000000 * Math.pow(1.05, 12),
    description: "Compound interest with large principal",
  },
  {
    formula: "sqrt(pow(value, 2) + pow(value, 2))",
    expectedValid: true,
    testValue: 1000,
    expectedResult: Math.sqrt(2000000),
    description: "Nested sqrt and pow with large number",
  },
  {
    formula: "abs(value - 1000000) / 1000000 * 100",
    expectedValid: true,
    testValue: 1100000,
    expectedResult: 10,
    description: "Percentage deviation with large numbers",
  },
  {
    formula: "min(max(value, 0), 1000000)",
    expectedValid: true,
    testValue: 1500000,
    expectedResult: 1000000,
    description: "Clamp between 0 and large number",
  },
  {
    formula: "floor(value / 1000) * 1000",
    expectedValid: true,
    testValue: 1234567,
    expectedResult: 1234000,
    description: "Round down to nearest 1000",
  },
  {
    formula: "ceil(value / 1000) * 1000",
    expectedValid: true,
    testValue: 1234567,
    expectedResult: 1235000,
    description: "Round up to nearest 1000",
  },
  {
    formula: "sqrt(pow(value, 2) + pow(value * 2, 2))",
    expectedValid: true,
    testValue: 1000,
    expectedResult: Math.sqrt(1000000 + 4000000),
    description: "Complex nested sqrt and pow with large numbers",
  },
  {
    formula: "pow(abs(value), 2)",
    expectedValid: true,
    testValue: -1000,
    expectedResult: 1000000,
    description: "Power of absolute value with large number",
  },
  {
    formula: "abs(pow(value, 3))",
    expectedValid: true,
    testValue: -100,
    expectedResult: 1000000,
    description: "Absolute value of power with large number",
  },
  {
    formula: "max(min(value, 2000000), 500000)",
    expectedValid: true,
    testValue: 3000000,
    expectedResult: 2000000,
    description: "Complex min/max clamp with large numbers",
  },
  {
    formula: "floor(value / 100) * 100",
    expectedValid: true,
    testValue: 1234567,
    expectedResult: 1234500,
    description: "Round down to nearest 100 with large number",
  },
  {
    formula: "ceil(value / 100) * 100",
    expectedValid: true,
    testValue: 1234567,
    expectedResult: 1234600,
    description: "Round up to nearest 100 with large number",
  },
  {
    formula: "round(value / 1000) * 1000",
    expectedValid: true,
    testValue: 1234567,
    expectedResult: 1235000,
    description: "Round to nearest 1000 with large number",
  },
  {
    formula: "pow(sqrt(value), 4)",
    expectedValid: true,
    testValue: 10000,
    expectedResult: 100000000,
    description: "Power of sqrt with large number",
  },
  {
    formula: "sqrt(pow(value, 4))",
    expectedValid: true,
    testValue: 100,
    expectedResult: 10000,
    description: "Sqrt of high power with large number",
  },
  {
    formula: "exp(value / 100) * 1000",
    expectedValid: true,
    testValue: 100,
    expectedResult: Math.exp(1) * 1000,
    description: "Exponential with division and large multiplier",
  },
  {
    formula: "pow(exp(value / 100), 2)",
    expectedValid: true,
    testValue: 100,
    expectedResult: Math.pow(Math.exp(1), 2),
    description: "Power of exponential with large number",
  },

  // Formulas with decimals and large numbers
  {
    formula: "value * 2",
    expectedValid: true,
    testValue: BigInt("1000000000000000000"),
    decimals: 18,
    expectedResult: 2,
    description: "With 18 decimals",
  },
  {
    formula: "value / 100",
    expectedValid: true,
    testValue: BigInt("50000000000000000000"),
    decimals: 18,
    expectedResult: 0.5,
    description: "Division with decimals",
  },
  {
    formula: "pow(value, 2)",
    expectedValid: true,
    testValue: BigInt("2000000000000000000"),
    decimals: 18,
    expectedResult: 4,
    description: "Power with decimals",
  },
  {
    formula: "pow(value, 2)",
    expectedValid: true,
    testValue: BigInt("1000000000000000000000000"),
    decimals: 18,
    expectedResult: 1000000000000, // pow(1000000, 2) = 1000000000000
    description: "Power with decimals and large number",
  },
  {
    formula: "sqrt(value)",
    expectedValid: true,
    testValue: BigInt("1000000000000000000000000"),
    decimals: 18,
    expectedResult: 1000,
    description: "Square root with decimals and large number",
  },
  {
    formula: "value * pow(2, 10)",
    expectedValid: true,
    testValue: BigInt("1000000000000000000"),
    decimals: 18,
    expectedResult: 1024,
    description: "Multiplication with power and decimals",
  },
  {
    formula: "abs(value)",
    expectedValid: true,
    testValue: BigInt("5000000000000000000000000"),
    decimals: 18,
    expectedResult: 5000000,
    description: "Absolute value with decimals and large number",
  },
  {
    formula: "floor(value)",
    expectedValid: true,
    testValue: BigInt("1234567890000000000000000"),
    decimals: 18,
    expectedResult: 1234567, // floor(1234567.89) = 1234567
    description: "Floor with decimals and large number",
  },
  {
    formula: "ceil(value)",
    expectedValid: true,
    testValue: BigInt("1234567890000000000000000"),
    decimals: 18,
    expectedResult: 1234568, // ceil(1234567.89) = 1234568
    description: "Ceil with decimals and large number",
  },
  {
    formula: "round(value)",
    expectedValid: true,
    testValue: BigInt("1234567890000000000000000"),
    decimals: 18,
    expectedResult: 1234568, // round(1234567.89) = 1234568 (rounds up from .89)
    description: "Round with decimals and large number",
  },
  {
    formula: "pow(value, 2) + sqrt(value)",
    expectedValid: true,
    testValue: BigInt("1000000000000000000000000"),
    decimals: 18,
    expectedResult: 1000000000000 + 1000, // pow(1000000, 2) + sqrt(1000000) = 1000000000000 + 1000
    description: "Complex formula with decimals and large numbers",
  },
  {
    formula: "min(value, 1000000)",
    expectedValid: true,
    testValue: BigInt("5000000000000000000000000"),
    decimals: 18,
    expectedResult: 1000000, // min(5000000, 1000000) = 1000000
    description: "Min with decimals and large number",
  },
  {
    formula: "max(value, 1000000)",
    expectedValid: true,
    testValue: BigInt("5000000000000000000000000"),
    decimals: 18,
    expectedResult: 5000000,
    description: "Max with decimals and large number",
  },
  {
    formula: "(pow(1 + value, 365) - 1) * 100",
    expectedValid: true,
    testValue: BigInt("10000000000000000"), // 0.01 with 18 decimals (1%)
    decimals: 18,
    expectedResult: (Math.pow(1.01, 365) - 1) * 100,
    description: "APY conversion with decimals and large number",
  },
  {
    formula: "sqrt(pow(value, 2) + pow(value, 2))",
    expectedValid: true,
    testValue: BigInt("3000000000000000000000000"),
    decimals: 18,
    expectedResult: Math.sqrt(18000000000000),
    description: "Nested sqrt and pow with decimals and large numbers",
  },

  // wsrUSD/USDC Borrow Rate
  {
    formula: "round((((value / 1e18) * 3.154e7) + pow((value / 1e18)* 3.154e7, 2) / 2) * 100, 2)",
    expectedValid: true,
    testValue: BigInt("1879903779"),
    expectedResult: 6.1,
    description: "wsrUSD/USDC Borrow Rate",
  },

  // Edge cases
  { formula: "", expectedValid: true, description: "Empty formula" },
  { formula: "value", expectedValid: true, testValue: 42, expectedResult: 42, description: "Just value" },
  { formula: "x", expectedValid: true, testValue: 42, expectedResult: 42, description: "Just x" },
  { formula: "0", expectedValid: true, testValue: 5, expectedResult: 0, description: "Constant zero" },
  { formula: "100", expectedValid: true, testValue: 5, expectedResult: 100, description: "Constant value" },
  { formula: "value + 0", expectedValid: true, testValue: 5, expectedResult: 5, description: "Addition with zero" },
  {
    formula: "value * 1",
    expectedValid: true,
    testValue: 5,
    expectedResult: 5,
    description: "Multiplication with one",
  },
  { formula: "value / 1", expectedValid: true, testValue: 5, expectedResult: 5, description: "Division by one" },

  // Invalid formulas
  { formula: "value +", expectedValid: false, description: "Incomplete expression" },
  { formula: "(value + 5", expectedValid: false, description: "Unmatched opening parenthesis" },
  { formula: "value + 5)", expectedValid: false, description: "Unmatched closing parenthesis" },
  { formula: "value @ 5", expectedValid: false, description: "Invalid character @" },
  { formula: "value # 5", expectedValid: false, description: "Invalid character #" },
];

// Run tests
// console.log("🧪 Testing formulaUtils.ts\n");
// console.log("=".repeat(80));

// Test cases for conditional formulas (formulas with operators)
const conditionalTestCases: Array<{
  formula: string;
  testValue: bigint | number;
  expectedResult: boolean;
  description: string;
  decimals?: number;
}> = [
  // Basic comparisons with integers
  {
    formula: "value > 10",
    testValue: 15,
    expectedResult: true,
    description: "Greater than with integer - true case",
  },
  {
    formula: "value > 10",
    testValue: 5,
    expectedResult: false,
    description: "Greater than with integer - false case",
  },
  {
    formula: "value < 100",
    testValue: 50,
    expectedResult: true,
    description: "Less than with integer - true case",
  },
  {
    formula: "value < 100",
    testValue: 150,
    expectedResult: false,
    description: "Less than with integer - false case",
  },
  {
    formula: "value >= 50",
    testValue: 50,
    expectedResult: true,
    description: "Greater than or equal - equal case",
  },
  {
    formula: "value >= 50",
    testValue: 60,
    expectedResult: true,
    description: "Greater than or equal - greater case",
  },
  {
    formula: "value >= 50",
    testValue: 40,
    expectedResult: false,
    description: "Greater than or equal - less case",
  },
  {
    formula: "value <= 100",
    testValue: 100,
    expectedResult: true,
    description: "Less than or equal - equal case",
  },
  {
    formula: "value <= 100",
    testValue: 90,
    expectedResult: true,
    description: "Less than or equal - less case",
  },
  {
    formula: "value <= 100",
    testValue: 110,
    expectedResult: false,
    description: "Less than or equal - greater case",
  },
  {
    formula: "value == 42",
    testValue: 42,
    expectedResult: true,
    description: "Equal operator - equal case",
  },
  {
    formula: "value == 42",
    testValue: 43,
    expectedResult: false,
    description: "Equal operator - not equal case",
  },
  {
    formula: "value != 42",
    testValue: 43,
    expectedResult: true,
    description: "Not equal operator - not equal case",
  },
  {
    formula: "value != 42",
    testValue: 42,
    expectedResult: false,
    description: "Not equal operator - equal case",
  },

  // Comparisons with float numbers
  {
    formula: "value > 10.5",
    testValue: 15.75,
    expectedResult: true,
    description: "Greater than with float - true case",
  },
  {
    formula: "value > 10.5",
    testValue: 5.25,
    expectedResult: false,
    description: "Greater than with float - false case",
  },
  {
    formula: "value < 100.99",
    testValue: 50.5,
    expectedResult: true,
    description: "Less than with float - true case",
  },
  {
    formula: "value >= 50.25",
    testValue: 50.25,
    expectedResult: true,
    description: "Greater than or equal with float - equal case",
  },
  {
    formula: "value >= 50.25",
    testValue: 50.24,
    expectedResult: false,
    description: "Greater than or equal with float - less case",
  },
  {
    formula: "value <= 100.75",
    testValue: 100.75,
    expectedResult: true,
    description: "Less than or equal with float - equal case",
  },
  {
    formula: "value == 42.5",
    testValue: 42.5,
    expectedResult: true,
    description: "Equal operator with float - equal case",
  },
  {
    formula: "value == 42.5",
    testValue: 42.499,
    expectedResult: false,
    description: "Equal operator with float - not equal case (within tolerance)",
  },
  {
    formula: "value != 42.5",
    testValue: 42.6,
    expectedResult: true,
    description: "Not equal operator with float - not equal case",
  },

  // Complex formulas with operators
  {
    formula: "value * 2 > 100",
    testValue: 60,
    expectedResult: true,
    description: "Multiplication in formula - true case",
  },
  {
    formula: "value * 2 > 100",
    testValue: 40,
    expectedResult: false,
    description: "Multiplication in formula - false case",
  },
  {
    formula: "value / 1e18 * 100 >= 50",
    testValue: BigInt("500000000000000000000"), // 500 * 1e18
    expectedResult: true,
    description: "Division with scientific notation - true case",
  },
  {
    formula: "value / 1e18 * 100 >= 50",
    testValue: BigInt("300000000000000000"), // 0.3 * 1e18 = 0.3, 0.3 * 100 = 30, 30 < 50
    expectedResult: false,
    description: "Division with scientific notation - false case",
  },
  {
    formula: "(value + 10) * 2 < 200",
    testValue: 50,
    expectedResult: true,
    description: "Parentheses in formula - true case",
  },
  {
    formula: "(value + 10) * 2 < 200",
    testValue: 150,
    expectedResult: false,
    description: "Parentheses in formula - false case",
  },
  {
    formula: "pow(value, 2) > 100",
    testValue: 11,
    expectedResult: true,
    description: "Power function in formula - true case",
  },
  {
    formula: "pow(value, 2) > 100",
    testValue: 9,
    expectedResult: false,
    description: "Power function in formula - false case",
  },
  {
    formula: "sqrt(value) >= 10",
    testValue: 100,
    expectedResult: true,
    description: "Square root in formula - equal case",
  },
  {
    formula: "sqrt(value) >= 10",
    testValue: 81,
    expectedResult: false,
    description: "Square root in formula - less case",
  },
  {
    formula: "round(value / 1e18, 2) > 10.5",
    testValue: BigInt("11000000000000000000"), // 11 * 1e18
    expectedResult: true,
    description: "Round function with decimals - true case",
  },
  {
    formula: "round(value / 1e18, 2) > 10.5",
    testValue: BigInt("10000000000000000000"), // 10 * 1e18
    expectedResult: false,
    description: "Round function with decimals - false case",
  },
  {
    formula: "min(max(value, 0), 100) <= 50",
    testValue: 30,
    expectedResult: true,
    description: "Min/Max functions in formula - true case",
  },
  {
    formula: "min(max(value, 0), 100) <= 50",
    testValue: 75,
    expectedResult: false,
    description: "Min/Max functions in formula - false case",
  },
  {
    formula: "abs(value - 100) < 10",
    testValue: 95,
    expectedResult: true,
    description: "Absolute value in formula - true case",
  },
  {
    formula: "abs(value - 100) < 10",
    testValue: 85,
    expectedResult: false,
    description: "Absolute value in formula - false case",
  },
  {
    formula: "(pow(1 + value / 1e18, 365) - 1) * 100 > 5.25",
    testValue: BigInt("1000000000000000000"), // 1 * 1e18
    expectedResult: true,
    description: "Complex APY formula - true case",
  },
  {
    formula: "round((value / 1e18) * 3.154e7, 2) > 10.5",
    testValue: BigInt("400000000000000000"), // 0.4 * 1e18
    expectedResult: true,
    description: "Complex formula with round and scientific notation - true case",
  },
  {
    formula: "value * 2.5 + 10.75 > 100.5",
    testValue: 40,
    expectedResult: true,
    description: "Float multiplication and addition - true case",
  },
  {
    formula: "value * 2.5 + 10.75 > 100.5",
    testValue: 30,
    expectedResult: false,
    description: "Float multiplication and addition - false case",
  },
  {
    formula: "floor(value / 100) * 100 == 10000.0",
    testValue: 10050,
    expectedResult: true,
    description: "Floor function with equal operator - true case",
  },
  {
    formula: "ceil(value / 1000) * 1000 <= 20000.5",
    testValue: 19500,
    expectedResult: true,
    description: "Ceil function with less than or equal - true case",
  },
  {
    formula: "exp(value / 10) >= 2.718",
    testValue: 10,
    expectedResult: true,
    description: "Exponential function - true case",
  },

  // More complex formulas with multiple nested functions
  {
    formula: "round((pow(1 + value / 1e18, 365) - 1) * 100, 2) > 10.5",
    testValue: BigInt("1000000000000000000"), // 1 * 1e18
    expectedResult: true,
    description: "Complex APY with round - true case",
  },
  {
    formula: "round((pow(1 + value / 1e18, 365) - 1) * 100, 2) > 10.5",
    testValue: BigInt("100000000000000"), // 0.0001 * 1e18 (0.01% daily rate, gives ~3.7% APY)
    expectedResult: false,
    description: "Complex APY with round - false case",
  },
  {
    formula: "sqrt(pow(value / 1e18, 2) + pow(value / 1e18, 3)) * 100 >= 15.25",
    testValue: BigInt("200000000000000000"), // 0.2 * 1e18
    expectedResult: true,
    description: "Nested sqrt and pow functions - true case",
  },
  {
    formula: "min(max(round(value / 1e18, 2), 0), 1000) * 1.5 > 500.75",
    testValue: BigInt("400000000000000000000"), // 400 * 1e18
    expectedResult: true,
    description: "Nested min, max, and round - true case",
  },
  {
    formula: "abs(value - 1e18) / 1e18 * 100 + pow(value / 1e18, 0.5) >= 50.5",
    testValue: BigInt("1500000000000000000"), // 1.5 * 1e18
    expectedResult: true,
    description: "Complex abs with pow and addition - true case",
  },
  {
    formula: "floor(ceil(value / 1e18 / 10) * 10) / 100 * 1.25 > 10.5",
    testValue: BigInt("1000000000000000000000"), // 1000 * 1e18
    expectedResult: true,
    description: "Nested floor and ceil - true case",
  },
  {
    formula: "(pow(1 + value / 1e18, 12) - 1) * 100 + sqrt(value / 1e18) * 10 >= 15.75",
    testValue: BigInt("1000000000000000000"), // 1 * 1e18
    expectedResult: true,
    description: "Complex APY with sqrt addition - true case",
  },
  {
    formula: "round(min(max(value / 1e18 * 100, 0), 1000) * 1.5, 2) <= 1500.99",
    testValue: BigInt("10000000000000000000"), // 10 * 1e18
    expectedResult: true,
    description: "Deeply nested round, min, max - true case",
  },
  {
    formula: "abs(pow(value / 1e18 - 1, 2)) * 100 + exp(value / 1e18 / 10) >= 20.5",
    testValue: BigInt("2000000000000000000"), // 2 * 1e18
    expectedResult: true,
    description: "Complex abs with pow and exp - true case",
  },
  {
    formula: "sqrt(pow(value / 1e18, 2) + pow(value / 1e18, 3) + pow(value / 1e18, 4)) * 50 > 100.25",
    testValue: BigInt("2000000000000000000"), // 2 * 1e18
    expectedResult: true,
    description: "Multiple pow operations in sqrt - true case",
  },
  {
    formula: "round((value / 1e18) * 3.154e7 + pow((value / 1e18) * 3.154e7, 2) / 2, 2) > 10.5",
    testValue: BigInt("400000000000000000"), // 0.4 * 1e18
    expectedResult: true,
    description: "Complex formula with multiple operations and scientific notation - true case",
  },
  {
    formula: "min(max(abs(value - 1e18) / 1e18 * 100, 0), 1000) * 1.5 + sqrt(value / 1e18) * 10 > 500.75",
    testValue: BigInt("50000000000000000000"), // 50 * 1e18
    expectedResult: true,
    description: "Very complex nested functions with multiple operations - true case",
  },
  {
    formula: "round((pow(1 + value / 1e18, 365) - 1) * 100 + (pow(1 + value / 1e18, 30) - 1) * 100, 2) >= 15.25",
    testValue: BigInt("1000000000000000000"), // 1 * 1e18
    expectedResult: true,
    description: "Multiple APY calculations combined - true case",
  },
  {
    formula: "sqrt(abs(value - 1e18) / 1e18) * 100 + pow(value / 1e18, 0.5) * 50 >= 75.5",
    testValue: BigInt("1500000000000000000"), // 1.5 * 1e18
    expectedResult: true,
    description: "Complex sqrt and abs with pow - true case",
  },
  {
    formula: "exp(value / 1e18 / 10) * 100 + log(value / 1e18 + 1) * 10 >= 50.25",
    testValue: BigInt("10000000000000000000"), // 10 * 1e18
    expectedResult: true,
    description: "Exp and log functions combined - true case",
  },
  {
    formula: "round(min(max(value / 1e18 * 100, 0), 1000) * 1.5 + sqrt(value / 1e18) * 10, 2) <= 2000.99",
    testValue: BigInt("10000000000000000000"), // 10 * 1e18
    expectedResult: true,
    description: "Very complex nested round, min, max, sqrt - true case",
  },
  {
    formula: "(pow(1 + value / 1e18, 365) - 1) * 100 + round(value / 1e18 * 3.154e7, 2) > 20.5",
    testValue: BigInt("1000000000000000000"), // 1 * 1e18
    expectedResult: true,
    description: "APY calculation with round addition - true case",
  },
  {
    formula: "abs(pow(value / 1e18 - 1, 3)) * 100 + min(max(value / 1e18, 0), 100) * 2 >= 150.75",
    testValue: BigInt("3000000000000000000"), // 3 * 1e18
    expectedResult: true,
    description: "Complex abs with pow and min/max - true case",
  },
  {
    formula: "sqrt(pow(value / 1e18, 2) + pow(value / 1e18, 3)) * 100 + floor(value / 1e18 / 10) * 10 >= 200.5",
    testValue: BigInt("2000000000000000000"), // 2 * 1e18
    expectedResult: true,
    description: "Complex sqrt with multiple pow and floor - true case",
  },
  {
    formula:
      "round((value / 1e18) * 3.154e7 + pow((value / 1e18) * 3.154e7, 2) / 2 + pow((value / 1e18) * 3.154e7, 3) / 6, 2) > 15.25",
    testValue: BigInt("500000000000000000"), // 0.5 * 1e18
    expectedResult: true,
    description: "Very complex formula with multiple pow operations and scientific notation - true case",
  },
  {
    formula: "min(max(round(value / 1e18, 2), 0), 1000) * 1.5 + abs(value / 1e18 - 500) * 0.1 >= 750.25",
    testValue: BigInt("510000000000000000000"), // 510 * 1e18
    expectedResult: true,
    description: "Very complex nested min, max, round, and abs - true case",
  },
  {
    formula:
      "sqrt(pow(value / 1e18, 2) + pow(value / 1e18, 3) + pow(value / 1e18, 4) + pow(value / 1e18, 5)) * 25 > 50.5",
    testValue: BigInt("3000000000000000000"), // 3 * 1e18
    expectedResult: true,
    description: "Extremely complex sqrt with multiple pow operations - true case",
  },
  {
    formula:
      "(pow(1 + value / 1e18, 365) - 1) * 100 + (pow(1 + value / 1e18, 30) - 1) * 100 + (pow(1 + value / 1e18, 7) - 1) * 100 >= 25.75",
    testValue: BigInt("1000000000000000000"), // 1 * 1e18
    expectedResult: true,
    description: "Multiple APY calculations with different periods - true case",
  },
  {
    formula:
      "round(abs(value - 1e18) / 1e18 * 100 + sqrt(value / 1e18) * 10 + pow(value / 1e18, 0.5) * 5, 2) <= 200.99",
    testValue: BigInt("1500000000000000000"), // 1.5 * 1e18
    expectedResult: true,
    description: "Complex round with abs, sqrt, and pow - true case",
  },
  {
    formula: "exp(value / 1e18 / 10) * 100 + log(value / 1e18 + 1) * 10 + sqrt(value / 1e18) * 5 >= 100.25",
    testValue: BigInt("10000000000000000000"), // 10 * 1e18
    expectedResult: true,
    description: "Complex exp, log, and sqrt combination - true case",
  },
  {
    formula:
      "min(max(round(value / 1e18, 2), 0), 1000) * 1.5 + sqrt(value / 1e18) * 10 + abs(value / 1e18 - 500) * 0.1 > 1000.75",
    testValue: BigInt("600000000000000000000"), // 600 * 1e18
    expectedResult: true,
    description: "Extremely complex nested functions with multiple operations - true case",
  },
];

let passed = 0;
let failed = 0;

// Test validateFormula
// console.log("\n📋 Testing validateFormula():\n");
testCases.forEach((testCase, index) => {
  const result = validateFormula(testCase.formula);
  const success = result.isValid === testCase.expectedValid;

  if (success) {
    passed++;
    // console.log(`✅ Test ${index + 1}: ${testCase.description}`);
    // console.log(`   Formula: "${testCase.formula}"`);
    // if (!testCase.expectedValid && result.error) {
    //   console.log(`   Error: ${result.error}`);
    // }
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: ${testCase.description}`);
    console.log(`   Formula: "${testCase.formula}"`);
    console.log(`   Expected: ${testCase.expectedValid ? "valid" : "invalid"}`);
    console.log(`   Got: ${result.isValid ? "valid" : "invalid"}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }
  //   console.log();
});

// Test evaluateFormula for valid formulas
// console.log("\n📋 Testing evaluateFormula():\n");
testCases.forEach((testCase, index) => {
  if (!testCase.expectedValid || testCase.testValue === undefined || testCase.expectedResult === undefined) {
    return; // Skip invalid formulas or tests without expected results
  }

  try {
    // Convert BigInt with decimals to number if needed
    let testValue: bigint | number = testCase.testValue;
    if (testCase.decimals !== undefined && typeof testValue === "bigint") {
      // Convert BigInt to number with decimals (e.g., 1000000000000000000n with 18 decimals = 1)
      const divisor = BigInt(10 ** testCase.decimals);
      testValue = Number(testValue) / Number(divisor);
    } else if (typeof testValue === "bigint") {
      testValue = Number(testValue);
    }

    const result = evaluateFormula(testCase.formula, testValue);
    const tolerance = 0.0001; // For floating point comparison
    const success = Math.abs(result - testCase.expectedResult) < tolerance;

    if (success) {
      passed++;
      //   console.log(`✅ Test ${index + 1}: ${testCase.description}`);
      //   console.log(`   Formula: "${testCase.formula}"`);
      //   console.log(`   Input: ${testCase.testValue}${testCase.decimals ? ` (${testCase.decimals} decimals)` : ""}`);
      //   console.log(`   Expected: ${testCase.expectedResult}`);
      //   console.log(`   Got: ${result}`);
    } else {
      failed++;
      console.log(`❌ Test ${index + 1}: ${testCase.description}`);
      console.log(`   Formula: "${testCase.formula}"`);
      console.log(`   Input: ${testCase.testValue}${testCase.decimals ? ` (${testCase.decimals} decimals)` : ""}`);
      console.log(`   Expected: ${testCase.expectedResult}`);
      console.log(`   Got: ${result}`);
      console.log(`   Difference: ${Math.abs(result - testCase.expectedResult)}`);
    }
  } catch (error: any) {
    failed++;
    console.log(`❌ Test ${index + 1}: ${testCase.description}`);
    console.log(`   Formula: "${testCase.formula}"`);
    console.log(`   Input: ${testCase.testValue}${testCase.decimals ? ` (${testCase.decimals} decimals)` : ""}`);
    console.log(`   Error: ${error.message}`);
  }
  //   console.log();
});

// Test parseFormulaWithOperator
// console.log("\n📋 Testing parseFormulaWithOperator():\n");
const parseTestCases = [
  { formula: "value > 10", expectedLeft: "value", expectedOp: ">", expectedRight: "10" },
  { formula: "value * 2 < 100", expectedLeft: "value * 2", expectedOp: "<", expectedRight: "100" },
  { formula: "pow(value, 2) >= 50", expectedLeft: "pow(value, 2)", expectedOp: ">=", expectedRight: "50" },
  {
    formula: "round(value / 1e18, 2) <= 10.5",
    expectedLeft: "round(value / 1e18, 2)",
    expectedOp: "<=",
    expectedRight: "10.5",
  },
  { formula: "value == 42", expectedLeft: "value", expectedOp: "==", expectedRight: "42" },
  { formula: "value != 0", expectedLeft: "value", expectedOp: "!=", expectedRight: "0" },
];

parseTestCases.forEach((testCase, index) => {
  const result = parseFormulaWithOperator(testCase.formula);
  if (
    result &&
    result.leftSide === testCase.expectedLeft &&
    result.operator === testCase.expectedOp &&
    result.rightSide === testCase.expectedRight
  ) {
    passed++;
  } else {
    failed++;
    console.log(`❌ Parse Test ${index + 1}: "${testCase.formula}"`);
    console.log(
      `   Expected: left="${testCase.expectedLeft}", op="${testCase.expectedOp}", right="${testCase.expectedRight}"`,
    );
    console.log(
      `   Got: ${result ? `left="${result.leftSide}", op="${result.operator}", right="${result.rightSide}"` : "null"}`,
    );
  }
});

// Test evaluateFormulaCondition
// console.log("\n📋 Testing evaluateFormulaCondition():\n");
conditionalTestCases.forEach((testCase, index) => {
  try {
    // Convert BigInt with decimals to number if needed
    let testValue: bigint | number = testCase.testValue;
    if (testCase.decimals !== undefined && typeof testValue === "bigint") {
      const divisor = BigInt(10 ** testCase.decimals);
      testValue = Number(testValue) / Number(divisor);
    } else if (typeof testValue === "bigint") {
      testValue = Number(testValue);
    }

    const result = evaluateFormulaCondition(testCase.formula, testValue);
    const success = result === testCase.expectedResult;

    if (success) {
      passed++;
      // console.log(`✅ Conditional Test ${index + 1}: ${testCase.description}`);
      // console.log(`   Formula: "${testCase.formula}"`);
      // console.log(`   Input: ${testCase.testValue}${testCase.decimals ? ` (${testCase.decimals} decimals)` : ""}`);
      // console.log(`   Expected: ${testCase.expectedResult}`);
      // console.log(`   Got: ${result}`);
    } else {
      failed++;
      console.log(`❌ Conditional Test ${index + 1}: ${testCase.description}`);
      console.log(`   Formula: "${testCase.formula}"`);
      console.log(`   Input: ${testCase.testValue}${testCase.decimals ? ` (${testCase.decimals} decimals)` : ""}`);
      console.log(`   Expected: ${testCase.expectedResult}`);
      console.log(`   Got: ${result}`);
    }
  } catch (error: any) {
    failed++;
    console.log(`❌ Conditional Test ${index + 1}: ${testCase.description}`);
    console.log(`   Formula: "${testCase.formula}"`);
    console.log(`   Input: ${testCase.testValue}${testCase.decimals ? ` (${testCase.decimals} decimals)` : ""}`);
    console.log(`   Error: ${error.message}`);
  }
});

// Summary
// console.log("=".repeat(80));
console.log("\n📊 Test Summary:");
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📈 Total: ${passed + failed}`);
console.log(`   🎯 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%\n`);

if (failed === 0) {
  console.log("🎉 All tests passed!\n");
  process.exit(0);
} else {
  console.log("⚠️  Some tests failed. Please review the output above.\n");
  process.exit(1);
}
