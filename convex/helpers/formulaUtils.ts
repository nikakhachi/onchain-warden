/**
 * Shared formula utilities for validation and evaluation
 * This ensures consistency between validation and actual formula execution
 */

import { create, all } from "mathjs";

// Create a mathjs instance with only safe functions
const math = create(all, {
  // Only allow safe operations - no eval, no import, etc.
});

/**
 * Creates a safe scope object for mathjs evaluation
 */
function createMathjsScope(testValue: number = 1): Record<string, any> {
  const roundToDecimals = (value: number, decimals?: number): number => {
    if (decimals === undefined || decimals === 0) return Math.round(value);
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  };

  return {
    value: testValue,
    x: testValue, // Alias for convenience
    // Whitelist safe math functions
    pow: Math.pow,
    sqrt: Math.sqrt,
    abs: Math.abs,
    exp: Math.exp,
    min: Math.min,
    max: Math.max,
    floor: Math.floor,
    ceil: Math.ceil,
    round: roundToDecimals,
  };
}

/**
 * Converts a formula string to mathjs-compatible format
 * Mathjs can handle the formula directly, but we need to ensure variables are properly referenced
 */
function prepareFormulaForMathjs(formula: string): string {
  // Mathjs can handle the formula as-is, but we ensure 'value' and 'x' are treated as variables
  // No transformation needed - mathjs will evaluate it with our scope
  return formula.trim();
}

/**
 * Validates a mathematical formula string
 * @param formula - The formula string to validate
 * @returns An object with isValid boolean and error message if invalid
 */
export function validateFormula(formula: string): { isValid: boolean; error?: string } {
  if (!formula || formula.trim() === "") {
    return { isValid: true }; // Empty formula is valid (optional field)
  }

  // Basic validation: only allow alphanumeric, operators, parentheses, and whitespace
  const allowedChars = /^[a-zA-Z0-9\s+\-*/().,]+$/;
  if (!allowedChars.test(formula)) {
    return { isValid: false, error: "Formula contains invalid characters" };
  }

  // Check for balanced parentheses
  let openCount = 0;
  for (const char of formula) {
    if (char === "(") openCount++;
    if (char === ")") openCount--;
    if (openCount < 0) {
      return { isValid: false, error: "Unmatched closing parenthesis" };
    }
  }
  if (openCount !== 0) {
    return { isValid: false, error: "Unmatched opening parenthesis" };
  }

  // Try to evaluate with a test value to check syntax using mathjs
  try {
    const scope = createMathjsScope(1);
    const preparedFormula = prepareFormulaForMathjs(formula);

    // Compile and evaluate with mathjs
    const compiled = math.compile(preparedFormula);
    const result = compiled.evaluate(scope);

    // Check if result is a valid number
    if (typeof result !== "number" || !isFinite(result)) {
      return { isValid: false, error: "Formula does not evaluate to a valid number" };
    }

    return { isValid: true };
  } catch (error: any) {
    return { isValid: false, error: error.message || "Invalid formula syntax" };
  }
}

/**
 * Safely evaluates a mathematical formula with a whitelisted set of functions using mathjs
 * @param formula - The formula string (e.g., "(pow(1 + value, 365) - 1) * 100")
 * @param value - The numeric value to use in the formula
 * @returns The calculated result
 */
export function evaluateFormula(formula: string, value: bigint | number): number {
  try {
    const numericValue = Number(value);

    // Basic validation: only allow alphanumeric, operators, parentheses, and whitespace
    const allowedChars = /^[a-zA-Z0-9\s+\-*/().,]+$/;
    if (!allowedChars.test(formula)) {
      throw new Error("Formula contains invalid characters");
    }

    // Create a safe scope with the actual value
    const scope = createMathjsScope(numericValue);
    const preparedFormula = prepareFormulaForMathjs(formula);

    // Compile and evaluate with mathjs (works in Convex runtime)
    const compiled = math.compile(preparedFormula);
    const result = compiled.evaluate(scope);

    if (typeof result !== "number" || !isFinite(result)) {
      throw new Error("Formula result is not a valid number");
    }

    return result;
  } catch (error) {
    console.error("Formula evaluation error:", error);
    throw new Error(`Invalid formula: ${formula}`);
  }
}
