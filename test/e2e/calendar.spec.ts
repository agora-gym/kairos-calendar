import { expect, test } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

test('renders a six-week calendar grid', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Kairos' })).toBeVisible()
  await expect(page.getByTestId('calendar-day')).toHaveCount(42)
})

test('creates an event from quick add', async ({ page }) => {
  await page.goto('/')
  const title = `E2E focus ${String(Date.now())}`
  await page.getByLabel('Event title').fill(title)
  await page.getByRole('button', { name: 'Add to calendar' }).click()
  await expect(page.getByTitle(`Delete ${title}`)).toBeVisible()
})

test('shows a field-specific invalid range error', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Event title').fill('Impossible meeting')
  await page.getByLabel('Starts').fill('2026-07-09T14:00')
  await page.getByLabel('Ends').fill('2026-07-09T13:00')
  await page.getByRole('button', { name: 'Add to calendar' }).click()
  await expect(page.locator('.form-error')).toContainText(
    'End time must be after start time',
  )
})
