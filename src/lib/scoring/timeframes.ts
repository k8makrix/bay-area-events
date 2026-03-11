import {
  startOfDay, endOfDay, addDays, nextFriday, nextMonday,
  startOfMonth, addMonths, isFriday, isSaturday, isSunday,
  setHours, getDay, endOfWeek, startOfWeek,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

const PACIFIC_TZ = "America/Los_Angeles";

export type Timeframe = "today" | "tomorrow" | "thisWeekend" | "nextWeek" | "nextMonth";

export interface DateRange {
  start: Date;
  end: Date;
}

function nowPacific(): Date {
  return toZonedTime(new Date(), PACIFIC_TZ);
}

export function getDateRange(timeframe: Timeframe): DateRange {
  const now = nowPacific();

  switch (timeframe) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };

    case "tomorrow":
      const tomorrow = addDays(now, 1);
      return { start: startOfDay(tomorrow), end: endOfDay(tomorrow) };

    case "thisWeekend": {
      const dayOfWeek = getDay(now);
      let fridayStart: Date;

      // If it's already Friday-Sunday, start from today
      if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
        fridayStart = dayOfWeek === 0
          ? startOfDay(now) // Sunday, show today
          : dayOfWeek === 6
            ? startOfDay(addDays(now, -1)) // Saturday, start from Friday
            : startOfDay(now); // Friday
      } else {
        fridayStart = startOfDay(nextFriday(now));
      }

      const start = setHours(fridayStart, 17); // Friday 5 PM
      const sundayEnd = endOfDay(addDays(fridayStart, dayOfWeek === 0 ? 0 : 2));

      return { start: dayOfWeek >= 5 || dayOfWeek === 0 ? startOfDay(now) : start, end: sundayEnd };
    }

    case "nextWeek": {
      const monday = nextMonday(now);
      const sunday = endOfDay(addDays(monday, 6));
      return { start: startOfDay(monday), end: sunday };
    }

    case "nextMonth": {
      // First three weekends of next month
      const nextMonthStart = startOfMonth(addMonths(now, 1));
      const thirdWeekend = addDays(nextMonthStart, 21);
      return { start: startOfDay(nextMonthStart), end: endOfDay(thirdWeekend) };
    }

    default:
      return { start: startOfDay(now), end: endOfDay(addDays(now, 7)) };
  }
}
