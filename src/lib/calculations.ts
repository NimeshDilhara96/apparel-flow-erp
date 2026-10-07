/**
 * Core Business Logic Calculations for ApparelFlow ERP
 * Extracted as pure functions for easy Unit Testing.
 */

// 1. Traffic Light Logic
export function determineTrafficLight(expected: number, actual: number): 'GREEN' | 'YELLOW' | 'RED' {
  if (actual < expected) return 'RED';    // Shortage
  if (actual > expected) return 'YELLOW'; // Excess
  return 'GREEN';                         // Exact Match
}

// 2. Fabric Wastage Calculation
export function calculateWastage(actualYards: number, stdYardsPerGarment: number, targetQty: number): number {
  const expectedFabric = stdYardsPerGarment * targetQty;
  if (expectedFabric === 0) return 0; // Prevent division by zero
  return ((actualYards - expectedFabric) / expectedFabric) * 100;
}
