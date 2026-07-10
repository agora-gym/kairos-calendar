import { describe, expect, it } from 'vitest'

import { createMonthGrid, formatMonth, moveMonth } from '../../lib/calendar'

describe('month grid', () => {
  it('always renders six complete weeks', () => {
    expect(createMonthGrid(new Date('2026-07-01T00:00:00Z'))).toHaveLength(42)
  })

  it('starts on Sunday before the first of the month', () => {
    expect(createMonthGrid(new Date('2026-07-01T00:00:00Z'))[0]?.date).toBe(
      '2026-06-28',
    )
  })

  it('marks spillover days outside the current month', () => {
    const grid = createMonthGrid(new Date('2026-07-01T00:00:00Z'))
    expect(grid[0]?.isCurrentMonth).toBe(false)
    expect(grid.find(({ date }) => date === '2026-07-01')?.isCurrentMonth).toBe(
      true,
    )
  })

  it('marks today by calendar date', () => {
    const grid = createMonthGrid(
      new Date('2026-07-01T00:00:00Z'),
      new Date('2026-07-09T23:30:00Z'),
    )
    expect(grid.find(({ date }) => date === '2026-07-09')?.isToday).toBe(true)
  })

  it('moves cleanly across year boundaries', () => {
    expect(
      moveMonth(new Date('2026-12-01T00:00:00Z'), 1).toISOString(),
    ).toContain('2027-01-01')
  })

  it('formats the month in UTC', () => {
    expect(formatMonth(new Date('2026-07-01T00:00:00Z'))).toBe('July 2026')
  })
})
