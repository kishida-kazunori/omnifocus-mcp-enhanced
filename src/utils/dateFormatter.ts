/**
 * Utility functions for date formatting
 */

/**
 * Generate locale-independent AppleScript snippet that constructs a date variable.
 * Uses numeric year/month/day assignment via `current date` to avoid
 * locale-dependent `date "..."` string parsing.
 */
export function generateAppleScriptDateVar(isoDate: string, varName: string, indent: string = ''): string {
    if (!isoDate || isoDate.trim() === '') {
        throw new Error('Date string cannot be empty');
    }
    // Regex parse to avoid timezone issues with new Date() constructor
    // (new Date("YYYY-MM-DD") parses as UTC, getDate() returns local TZ → off-by-one)
    const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
        throw new Error(`Invalid date string: ${isoDate}`);
    }
    const [, yearStr, monthStr, dayStr] = match;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    if (month < 1 || month > 12) {
        throw new Error(`Invalid month: ${month} in date string: ${isoDate}`);
    }
    if (day < 1 || day > 31) {
        throw new Error(`Invalid day: ${day} in date string: ${isoDate}`);
    }

    // Set day=1 first to prevent overflow when changing month
    // (e.g. if current date is Jan 31, changing month to Feb would overflow to Mar 3)
    // Wrap in "using terms from scripting additions" so that current date / day /
    // month / year / time are resolved as standard AppleScript terms even inside
    // an OmniFocus "tell" block (otherwise OmniFocus intercepts them → error -1723)
    const lines = [
        `using terms from scripting additions`,
        `set ${varName} to current date`,
        `set day of ${varName} to 1`,
        `set year of ${varName} to ${year}`,
        `set month of ${varName} to ${month}`,
        `set day of ${varName} to ${day}`,
        `set time of ${varName} to 0`,
        `end using terms from`,
    ];
    return lines.join('\n' + indent);
}
