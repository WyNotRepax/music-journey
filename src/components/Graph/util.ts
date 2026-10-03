import { Resolution } from "shared/api";

export function calcPercent(value: Date, start: Date, end: Date) {
    return ((value.getTime() - start.getTime()) /
        (end.getTime() - start.getTime())) * 100;
}
export function getAnchors(
    resolution: Resolution,
    startTime: Date,
    endTime: Date,
): Date[] {
    let dates: Date[] = [];
    if (resolution === "day") {
        dates = getDays(startTime, endTime);
    } else if (resolution === "week") {
        dates = getWeeks(startTime, endTime);
    } else if (resolution === "month") {
        dates = getMonths(startTime, endTime);
    } else {
        throw new Error(`Unknown resolution: ${resolution}`);
    }
    return dates;
}

/**
 * Collects consecutive anchors covering an interval, plus one padding anchor on each side.
 *
 * The result starts with the last anchor strictly before `startTime` and ends with the
 * first anchor strictly after `endTime`.
 *
 * @param first Anchor at or before `startTime` (the start truncated to the resolution).
 * @param startTime Start of the interval.
 * @param endTime End of the interval.
 * @param step Mutates the given date by `n` resolution units (negative steps backwards).
 * @returns Anchors in ascending order.
 */
function collect(
    first: Date,
    startTime: Date,
    endTime: Date,
    step: (d: Date, n: number) => void,
): Date[] {
    const dates: Date[] = [];
    const current = new Date(first);
    if (current >= startTime) step(current, -1);
    while (true) {
        dates.push(new Date(current));
        if (current > endTime) break;
        step(current, 1);
    }
    return dates;
}

function getDays(startTime: Date, endTime: Date): Date[] {
    const first = new Date(
        startTime.getFullYear(),
        startTime.getMonth(),
        startTime.getDate(),
    );
    return collect(first, startTime, endTime, (d, n) => d.setDate(d.getDate() + n));
}

function getWeeks(startTime: Date, endTime: Date): Date[] {
    // Postgres date_trunc('week', ...) uses ISO weeks (Monday-start), so anchors must match.
    const daysSinceMonday = (startTime.getDay() + 6) % 7;
    const first = new Date(
        startTime.getFullYear(),
        startTime.getMonth(),
        startTime.getDate() - daysSinceMonday,
    );
    return collect(first, startTime, endTime, (d, n) => d.setDate(d.getDate() + 7 * n));
}

function getMonths(startTime: Date, endTime: Date): Date[] {
    const first = new Date(startTime.getFullYear(), startTime.getMonth(), 1);
    return collect(first, startTime, endTime, (d, n) => d.setMonth(d.getMonth() + n));
}
