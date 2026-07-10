import { mkdirSync } from 'node:fs'
import path from 'node:path'

import Database from 'better-sqlite3'

import { parseEventInput, type CalendarEvent, type EventInput } from './events'

type EventRow = Readonly<{
  id: number
  title: string
  starts_at: string
  ends_at: string
  calendar_id: string
}>

const mapEvent = (row: EventRow): CalendarEvent => ({
  id: row.id,
  title: row.title,
  startsAt: row.starts_at,
  endsAt: row.ends_at,
  calendarId: row.calendar_id,
})

const databasePath = (): string =>
  process.env.KAIROS_DATABASE_PATH ??
  path.join(process.cwd(), 'data', 'kairos.db')

let database: Database.Database | undefined

export const getDatabase = (): Database.Database => {
  if (database) return database
  const file = databasePath()
  mkdirSync(path.dirname(file), { recursive: true })
  database = new Database(file)
  database.pragma('journal_mode = WAL')
  database.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      calendar_id TEXT NOT NULL DEFAULT 'personal',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  return database
}

export const listEvents = (): readonly CalendarEvent[] =>
  (
    getDatabase()
      .prepare(
        `SELECT id, title, starts_at, ends_at, calendar_id
         FROM events ORDER BY starts_at ASC, id ASC`,
      )
      .all() as EventRow[]
  ).map(mapEvent)

export const findEvent = (id: number): CalendarEvent | undefined => {
  const row = getDatabase()
    .prepare(
      `SELECT id, title, starts_at, ends_at, calendar_id FROM events WHERE id = ?`,
    )
    .get(id) as EventRow | undefined
  return row ? mapEvent(row) : undefined
}

export const createEvent = (input: EventInput): CalendarEvent => {
  const event = parseEventInput(input)
  const result = getDatabase()
    .prepare(
      `INSERT INTO events (title, starts_at, ends_at, calendar_id)
       VALUES (@title, @startsAt, @endsAt, @calendarId)`,
    )
    .run(event)
  const created = findEvent(Number(result.lastInsertRowid))
  if (!created) throw new Error('Created event could not be read back')
  return created
}

export const updateEvent = (
  id: number,
  patch: Partial<EventInput>,
): CalendarEvent | undefined => {
  const current = findEvent(id)
  if (!current) return undefined
  const event = parseEventInput({
    title: patch.title ?? current.title,
    startsAt: patch.startsAt ?? current.startsAt,
    endsAt: patch.endsAt ?? current.endsAt,
    calendarId: patch.calendarId ?? current.calendarId,
  })
  getDatabase()
    .prepare(
      `UPDATE events
       SET title = @title, starts_at = @startsAt, ends_at = @endsAt,
           calendar_id = @calendarId
       WHERE id = @id`,
    )
    .run({ id, ...event })
  return findEvent(id)
}

export const deleteEvent = (id: number): boolean =>
  getDatabase().prepare('DELETE FROM events WHERE id = ?').run(id).changes > 0
