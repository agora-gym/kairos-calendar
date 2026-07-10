export type CalendarDay = Readonly<{
  date: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
}>

const isoDate = (date: Date): string => date.toISOString().slice(0, 10)

export const createMonthGrid = (
  month: Date,
  today = new Date(),
): readonly CalendarDay[] => {
  const firstOfMonth = new Date(
    Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1),
  )
  const gridStart = new Date(firstOfMonth)
  gridStart.setUTCDate(firstOfMonth.getUTCDate() - firstOfMonth.getUTCDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setUTCDate(gridStart.getUTCDate() + index)
    return {
      date: isoDate(date),
      dayNumber: date.getUTCDate(),
      isCurrentMonth: date.getUTCMonth() === firstOfMonth.getUTCMonth(),
      isToday: isoDate(date) === isoDate(today),
    }
  })
}

export const moveMonth = (month: Date, offset: number): Date =>
  new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + offset, 1))

export const formatMonth = (month: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(month)
