// Dates from the API are ISO 8601 with an offset (the backend stores timestamptz in UTC), so
// new Date() reads the right instant and Intl shows it in the viewer's own timezone and locale.
// h23: 24-hour clock everywhere (hour12: false can print "24:05" at midnight in some locales)
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const dateTimeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', hourCycle: 'h23' })
const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
// numeric: 'auto' says "today" and "yesterday" (in the viewer's language) instead of "0 days ago"
const relativeDay = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

const DAY_MS = 86_400_000

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// Calendar days in the viewer's timezone, not 24-hour blocks: 23:50 yesterday is 1 day ago at 00:10.
// round: a day with a DST change lasts 23 or 25 hours
function calendarDaysBetween(date: Date, now: Date) {
  return Math.round((startOfLocalDay(now).getTime() - startOfLocalDay(date).getTime()) / DAY_MS)
}

function capitalize(text: string) {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1)
}

// "14:05"
export function formatTime(iso: string) {
  return timeFormat.format(new Date(iso))
}

// "24 oct 2026, 14:05": for a title or tooltip next to a short time
export function formatDateTime(iso: string) {
  return dateTimeFormat.format(new Date(iso))
}

// "2026-10-16": the viewer's calendar day, to group by and for <time dateTime>
export function toLocalDay(iso: string) {
  const date = new Date(iso)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// A list's short time: "14:05" today, "Yesterday", then "26-10-16" (year-month-day, two digits each)
export function formatListTime(iso: string, now = new Date()) {
  const days = calendarDaysBetween(new Date(iso), now)
  if (days <= 0) return formatTime(iso)
  if (days === 1) return capitalize(relativeDay.format(-1, 'day'))
  return toLocalDay(iso).slice(2)
}

// "Today", "Yesterday", or "Thursday, 16 October 2026": in the viewer's timezone and locale.
// A date ahead of now (a clock off by minutes) counts as today
export function formatDayLabel(iso: string, now = new Date()) {
  const days = calendarDaysBetween(new Date(iso), now)
  if (days <= 1) return capitalize(relativeDay.format(-Math.max(days, 0), 'day'))
  return dayFormat.format(new Date(iso))
}
