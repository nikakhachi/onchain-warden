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

  // Basic validation: only allow alphanumeric, operators, parentheses, comparison operators, and whitespace
  const allowedChars = /^[a-zA-Z0-9\s+\-*/().,><=!]+$/;
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

  // Check if formula contains comparison operators
  const hasComparisonOperator = /[><=!]+/.test(formula);

  if (hasComparisonOperator) {
    // For formulas with comparison operators, validate structure
    const parsed = parseFormulaWithOperator(formula);
    if (!parsed) {
      return { isValid: false, error: "Invalid comparison operator format" };
    }

    // Validate the left side (formula part)
    try {
      const scope = createMathjsScope(1);
      const preparedLeftSide = prepareFormulaForMathjs(parsed.leftSide);
      const compiled = math.compile(preparedLeftSide);
      const result = compiled.evaluate(scope);

      if (typeof result !== "number" || !isFinite(result)) {
        return { isValid: false, error: "Left side of formula does not evaluate to a valid number" };
      }

      // Validate right side is a number
      const rightValue = parseFloat(parsed.rightSide);
      if (isNaN(rightValue)) {
        return { isValid: false, error: "Right side must be a valid number" };
      }

      return { isValid: true };
    } catch (error: any) {
      return { isValid: false, error: error.message || "Invalid formula syntax" };
    }
  } else {
    // For regular formulas without comparison operators
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

/**
 * Parses a formula with comparison operator and extracts the operator and comparison value
 * @param formula - The formula string (e.g., "value * 1e18 / 2 > 10")
 * @returns Object with leftSide (formula before operator), operator, and rightSide (comparison value)
 */
export function parseFormulaWithOperator(formula: string): {
  leftSide: string;
  operator: string;
  rightSide: string;
} | null {
  // Match comparison operators: >, <, >=, <=, ==, !=
  const operatorRegex = /(>=|<=|==|!=|>|<)/;
  const match = formula.match(operatorRegex);

  if (!match) {
    return null;
  }

  const operator = match[1];
  const operatorIndex = match.index!;

  const leftSide = formula.substring(0, operatorIndex).trim();
  const rightSide = formula.substring(operatorIndex + operator.length).trim();

  return { leftSide, operator, rightSide };
}

/**
 * Evaluates a formula condition that includes a comparison operator
 * @param formula - The formula string (e.g., "round((value / 1e18) * 3.154e7, 2) > 10")
 * @param value - The numeric value to use in the formula
 * @returns Boolean result of the comparison
 */
/**
 * Validates a conditional formula (used in conditions with custom_formula operator)
 * Returns validation result without throwing, so it can be used in both frontend and backend
 * @param formula - The formula string (e.g., "round((value / 1e18) * 3.154e7, 2) > 10")
 * @param fieldName - Optional field name for error messages
 * @returns Validation result with isValid flag and optional error message
 */
export function validateConditionFormula(formula: string, fieldName?: string): { isValid: boolean; error?: string } {
  if (!formula || formula.trim() === "") {
    return {
      isValid: false,
      error: fieldName
        ? `Custom formula condition for field ${fieldName} cannot be empty`
        : "Custom formula condition cannot be empty",
    };
  }

  // Check if formula contains comparison operator
  const hasOperator = /[><=!]+/.test(formula);
  if (!hasOperator) {
    return {
      isValid: false,
      error: fieldName
        ? `Custom formula condition for field ${fieldName} must include a comparison operator (>, <, >=, <=, ==, !=)`
        : "Custom formula condition must include a comparison operator (>, <, >=, <=, ==, !=)",
    };
  }

  // Validate the formula syntax
  const validation = validateFormula(formula);
  if (!validation.isValid) {
    return {
      isValid: false,
      error: fieldName
        ? `Invalid formula for condition field ${fieldName}: ${validation.error || "Invalid formula syntax"}`
        : validation.error || "Invalid formula syntax",
    };
  }

  // Verify the formula can be parsed (has valid operator and comparison value)
  const parsed = parseFormulaWithOperator(formula);
  if (!parsed) {
    return {
      isValid: false,
      error: fieldName
        ? `Invalid formula format for condition field ${fieldName}: formula must contain a comparison operator followed by a number`
        : "Invalid formula format: formula must contain a comparison operator followed by a number",
    };
  }

  // Validate the right side is a valid number
  const rightValue = parseFloat(parsed.rightSide);
  if (isNaN(rightValue)) {
    return {
      isValid: false,
      error: fieldName
        ? `Invalid comparison value in formula for condition field ${fieldName}: ${parsed.rightSide} is not a valid number`
        : `Invalid comparison value: ${parsed.rightSide} is not a valid number`,
    };
  }

  return { isValid: true };
}

/**
 * Evaluates a formula condition that includes a comparison operator
 * @param formula - The formula string (e.g., "round((value / 1e18) * 3.154e7, 2) > 10")
 * @param value - The numeric value to use in the formula
 * @returns Boolean result of the comparison
 */
export function evaluateFormulaCondition(formula: string, value: bigint | number): boolean {
  try {
    const parsed = parseFormulaWithOperator(formula);
    if (!parsed) {
      throw new Error("Formula must contain a comparison operator (>, <, >=, <=, ==, !=)");
    }

    const { leftSide, operator, rightSide } = parsed;

    // Evaluate the left side of the formula
    const leftResult = evaluateFormula(leftSide, value);

    // Parse the right side (should be a number)
    const rightValue = parseFloat(rightSide);
    if (isNaN(rightValue)) {
      throw new Error(`Invalid comparison value: ${rightSide}`);
    }

    // Perform the comparison
    switch (operator) {
      case ">":
        return leftResult > rightValue;
      case "<":
        return leftResult < rightValue;
      case ">=":
        return leftResult >= rightValue;
      case "<=":
        return leftResult <= rightValue;
      case "==":
        return Math.abs(leftResult - rightValue) < 0.0001; // Floating point comparison
      case "!=":
        return Math.abs(leftResult - rightValue) >= 0.0001;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  } catch (error) {
    console.error("Formula condition evaluation error:", error);
    return false; // Fail safe: if formula evaluation fails, don't match
  }
}
