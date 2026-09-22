import { type APIRequestContext, expect, type Page, test } from '@playwright/test'

const USERNAME_RE = /^[a-zA-Z0-9_]{1,15}$/

type TestUser = { username: string; fullName: string; emailAddress: string; password: string }

function makeTestUser(): TestUser {
  const username = `e2e${Date.now().toString(36)}`
  if (!USERNAME_RE.test(username))
    throw new Error(`generated username breaks contract: ${username}`)
  return {
    username,
    fullName: 'E2E Test User',
    emailAddress: `${username}@e2e.test`,
    password: 'passw0rd',
  }
}

async function signUp(request: APIRequestContext): Promise<TestUser> {
  const user = makeTestUser()
  const res = await request.post('/api/users', { data: user })
  expect(res.status(), await res.text()).toBe(201)
  return user
}

async function logInViaForm(page: Page, user: TestUser) {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
  await page.getByPlaceholder('Username').fill(user.username)
  await page.getByPlaceholder('Password').fill(user.password)
  await page.getByRole('button', { name: 'Login' }).click()
}

// rails generate authentication の署名付き cookie
async function readSessionCookie(page: Page) {
  const cookies = await page.context().cookies()
  return cookies.find((c) => c.name === 'session_id')
}

test.describe('authentication (login / logout)', () => {
  test('opening a protected page while signed out redirects to /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByPlaceholder('Username')).toBeVisible()
  })

  test('logging in with valid credentials lands on home and issues the session cookie', async ({
    page,
    request,
  }) => {
    const user = await signUp(request)
    await logInViaForm(page, user)

    await expect(page).not.toHaveURL(/\/login$/)
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible()

    const session = await readSessionCookie(page)
    expect(session).toBeDefined()
    expect(session?.httpOnly).toBe(true)
    expect(session?.sameSite).toBe('Lax')
  })

  test('logging out returns to /login, drops the cookie, and blocks protected pages', async ({
    page,
    request,
  }) => {
    const user = await signUp(request)
    await logInViaForm(page, user)
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible()

    await page.getByRole('button', { name: 'Log out' }).click()
    await expect(page).toHaveURL(/\/login$/)
    expect(await readSessionCookie(page)).toBeUndefined()

    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('invalid credentials show an error and stay on the login page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
    await page.getByPlaceholder('Username').fill('nope_nobody')
    await page.getByPlaceholder('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Login' }).click()

    await expect(page.getByText('Incorrect username or password')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })
})
