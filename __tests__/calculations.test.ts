import { determineTrafficLight, calculateWastage } from '../src/lib/calculations';

describe('ApparelFlow Core Business Logic', () => {
  
  describe('determineTrafficLight()', () => {
    it('should return RED when actual is less than expected (Shortage)', () => {
      expect(determineTrafficLight(100, 95)).toBe('RED');
      expect(determineTrafficLight(50, 0)).toBe('RED');
    });

    it('should return YELLOW when actual is greater than expected (Excess)', () => {
      expect(determineTrafficLight(100, 105)).toBe('YELLOW');
      expect(determineTrafficLight(50, 51)).toBe('YELLOW');
    });

    it('should return GREEN when actual exactly matches expected', () => {
      expect(determineTrafficLight(100, 100)).toBe('GREEN');
      expect(determineTrafficLight(0, 0)).toBe('GREEN');
    });
  });

  describe('calculateWastage()', () => {
    it('should calculate 0% wastage if actual matches standard exactly', () => {
      // 2 yards per garment * 100 garments = 200 expected. Actual is 200.
      expect(calculateWastage(200, 2, 100)).toBe(0);
    });

    it('should calculate positive wastage % when actual exceeds standard', () => {
      // 2 yards per garment * 100 garments = 200 expected. Actual is 220 (10% excess).
      expect(calculateWastage(220, 2, 100)).toBe(10);
    });

    it('should calculate negative wastage % when actual is less than standard (Fabric Saved)', () => {
      // 2 yards per garment * 100 garments = 200 expected. Actual is 190 (5% saved).
      expect(calculateWastage(190, 2, 100)).toBe(-5);
    });

    it('should handle division by zero gracefully by returning 0', () => {
      expect(calculateWastage(100, 0, 0)).toBe(0);
    });
  });
});
