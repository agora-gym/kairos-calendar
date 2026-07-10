import { NextResponse } from 'next/server'

import { EventValidationError } from './events'

export const errorResponse = (error: unknown): NextResponse => {
  if (error instanceof EventValidationError) {
    return NextResponse.json(
      { error: error.message, fields: error.fields },
      { status: 422 },
    )
  }
  console.error(error)
  return NextResponse.json(
    { error: 'Unexpected server error.' },
    { status: 500 },
  )
}

export const parseEventId = (value: string): number | undefined => {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : undefined
}
