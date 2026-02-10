import { describe, it, expect } from 'vitest';
import { generateAppleScriptDateVar } from '../dateFormatter.js';

describe('generateAppleScriptDateVar', () => {
    it('generates correct year, month, and day assignments', () => {
        const result = generateAppleScriptDateVar('2026-03-15', 'theDueDate');
        expect(result).toContain('set theDueDate to current date');
        expect(result).toContain('set year of theDueDate to 2026');
        expect(result).toContain('set month of theDueDate to 3');
        expect(result).toContain('set day of theDueDate to 15');
        expect(result).toContain('set time of theDueDate to 0');
    });

    it('uses the custom variable name in all set statements', () => {
        const result = generateAppleScriptDateVar('2026-03-15', 'myCustomVar');
        const setLines = result.split('\n').filter(l => l.trimStart().startsWith('set '));
        expect(setLines.length).toBeGreaterThan(0);
        for (const line of setLines) {
            expect(line).toContain('myCustomVar');
        }
    });

    it('handles first day of month (day=1, month=1)', () => {
        const result = generateAppleScriptDateVar('2026-01-01', 'v');
        expect(result).toContain('set month of v to 1');
        expect(result).toContain('set day of v to 1');
    });

    it('handles last day of month (day=31)', () => {
        const result = generateAppleScriptDateVar('2026-01-31', 'v');
        expect(result).toContain('set day of v to 31');
    });

    it('handles leap year date (Feb 29)', () => {
        const result = generateAppleScriptDateVar('2024-02-29', 'v');
        expect(result).toContain('set month of v to 2');
        expect(result).toContain('set day of v to 29');
    });

    it('ignores time portion of ISO datetime string', () => {
        const result = generateAppleScriptDateVar('2026-01-09T14:30:00', 'v');
        expect(result).toContain('set year of v to 2026');
        expect(result).toContain('set month of v to 1');
        expect(result).toContain('set day of v to 9');
    });

    it('throws on empty string', () => {
        expect(() => generateAppleScriptDateVar('', 'v')).toThrow('Date string cannot be empty');
    });

    it('throws on invalid date string', () => {
        expect(() => generateAppleScriptDateVar('not-a-date', 'v')).toThrow('Invalid date string');
    });

    it('throws on out-of-range month', () => {
        expect(() => generateAppleScriptDateVar('2026-13-01', 'v')).toThrow('Invalid month');
    });

    it('throws on out-of-range day', () => {
        expect(() => generateAppleScriptDateVar('2026-01-32', 'v')).toThrow('Invalid day');
    });

    it('applies indent to all lines after the first', () => {
        const result = generateAppleScriptDateVar('2026-03-15', 'v', '    ');
        const lines = result.split('\n');
        // First line has no indent
        expect(lines[0]).toBe('using terms from scripting additions');
        // Subsequent lines are indented
        for (let i = 1; i < lines.length; i++) {
            expect(lines[i]).toMatch(/^    /);
        }
    });

    it('uses no extra whitespace when indent is omitted', () => {
        const result = generateAppleScriptDateVar('2026-03-15', 'v');
        const lines = result.split('\n');
        for (const line of lines) {
            expect(line).toMatch(/^(using |set |end )/);
        }
    });

    it('sets day to 1 before changing month to prevent overflow', () => {
        const result = generateAppleScriptDateVar('2026-03-15', 'v');
        const dayTo1Index = result.indexOf('set day of v to 1');
        const monthIndex = result.indexOf('set month of v to 3');
        expect(dayTo1Index).toBeLessThan(monthIndex);
    });

    it('wraps output in "using terms from scripting additions"', () => {
        const result = generateAppleScriptDateVar('2026-03-15', 'v');
        const lines = result.split('\n');
        expect(lines[0]).toBe('using terms from scripting additions');
        expect(lines[lines.length - 1]).toMatch(/end using terms from/);
    });
});
