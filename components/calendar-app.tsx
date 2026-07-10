'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { createMonthGrid, formatMonth, moveMonth } from '../lib/calendar'
import type { CalendarEvent } from '../lib/events'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

const localInputValue = (date: Date): string => {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const initialTimes = (): Readonly<{ startsAt: string; endsAt: string }> => {
  const start = new Date()
  start.setMinutes(0, 0, 0)
  start.setHours(start.getHours() + 1)
  const end = new Date(start)
  end.setHours(end.getHours() + 1)
  return { startsAt: localInputValue(start), endsAt: localInputValue(end) }
}

export const CalendarApp = (): React.ReactNode => {
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
  })
  const [events, setEvents] = useState<readonly CalendarEvent[]>([])
  const [title, setTitle] = useState('')
  const [times, setTimes] = useState(initialTimes)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const days = useMemo(() => createMonthGrid(month), [month])

  useEffect(() => {
    void fetch('/api/events')
      .then(
        async (response) =>
          (await response.json()) as { events: CalendarEvent[] },
      )
      .then(({ events: loadedEvents }) => setEvents(loadedEvents))
      .catch(() => setError('Could not load events.'))
      .finally(() => setLoading(false))
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError('')
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        startsAt: new Date(times.startsAt).toISOString(),
        endsAt: new Date(times.endsAt).toISOString(),
      }),
    })
    const body = (await response.json()) as {
      event?: CalendarEvent
      error?: string
      fields?: Record<string, string>
    }
    if (!response.ok || !body.event) {
      setError(
        Object.values(body.fields ?? {})[0] ??
          body.error ??
          'Could not save event.',
      )
      return
    }
    setEvents((current) => [...current, body.event as CalendarEvent])
    setTitle('')
  }

  const remove = async (id: number): Promise<void> => {
    const response = await fetch(`/api/events/${String(id)}`, {
      method: 'DELETE',
    })
    if (response.ok)
      setEvents((current) => current.filter((event) => event.id !== id))
    else setError('Could not delete event.')
  }

  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>()
    for (const event of events) {
      const day = event.startsAt.slice(0, 10)
      grouped.set(day, [...(grouped.get(day) ?? []), event])
    }
    return grouped
  }, [events])

  return (
    <main>
      <header className="hero">
        <div>
          <p className="eyebrow">Personal calendar</p>
          <h1>Kairos</h1>
          <p className="lede">Make time visible. Keep the day intentional.</p>
        </div>
        <div className="status" aria-live="polite">
          <span className="status-dot" />{' '}
          {loading ? 'Syncing…' : `${String(events.length)} events`}
        </div>
      </header>

      <section className="workspace" aria-label="Calendar workspace">
        <div className="calendar-card">
          <div className="calendar-toolbar">
            <button
              type="button"
              onClick={() => setMonth((value) => moveMonth(value, -1))}
              aria-label="Previous month"
            >
              ←
            </button>
            <h2>{formatMonth(month)}</h2>
            <button
              type="button"
              onClick={() => setMonth((value) => moveMonth(value, 1))}
              aria-label="Next month"
            >
              →
            </button>
          </div>
          <div className="weekdays" aria-hidden="true">
            {weekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div
            className="calendar-grid"
            role="grid"
            aria-label={formatMonth(month)}
          >
            {days.map((day) => (
              <div
                className={`day ${day.isCurrentMonth ? '' : 'day-muted'} ${day.isToday ? 'day-today' : ''}`}
                data-testid="calendar-day"
                key={day.date}
                role="gridcell"
              >
                <time dateTime={day.date}>{day.dayNumber}</time>
                <div className="day-events">
                  {(eventsByDay.get(day.date) ?? []).map((event) => (
                    <button
                      className="event-pill"
                      key={event.id}
                      onClick={() => void remove(event.id)}
                      title={`Delete ${event.title}`}
                      type="button"
                    >
                      {event.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="composer">
          <p className="eyebrow">Quick add</p>
          <h2>Protect the time</h2>
          <form onSubmit={(event) => void submit(event)}>
            <label>
              Event title
              <input
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Deep work"
                required
              />
            </label>
            <label>
              Starts
              <input
                name="startsAt"
                type="datetime-local"
                value={times.startsAt}
                onChange={(event) =>
                  setTimes((current) => ({
                    ...current,
                    startsAt: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Ends
              <input
                name="endsAt"
                type="datetime-local"
                value={times.endsAt}
                onChange={(event) =>
                  setTimes((current) => ({
                    ...current,
                    endsAt: event.target.value,
                  }))
                }
                required
              />
            </label>
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
            <button className="primary" type="submit">
              Add to calendar
            </button>
          </form>
          <p className="delete-note">
            Tip: select an event in the grid to remove it.
          </p>
        </aside>
      </section>
    </main>
  )
}
