import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import express from 'express'
import approvalRoutes from '../src/routes/approval.routes.js'
import authRoutes from '../src/routes/auth.routes.js'
import expenseRoutes from '../src/routes/expense.routes.js'

process.env.JWT_SECRET = 'reimburseflow-test-secret'

const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/approvals', approvalRoutes)

const server = app.listen(0)
let baseUrl
let employeeToken
let managerToken
let submittedExpenseId

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })
  return { response, data: await response.json() }
}

async function demoLogin(role) {
  const { response, data } = await request('/api/auth/demo-login', {
    method: 'POST',
    body: { role }
  })
  assert.equal(response.status, 200)
  assert.equal(data.success, true)
  return data.token
}

before(async () => {
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
  employeeToken = await demoLogin('employee')
  managerToken = await demoLogin('manager')
})

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
})

test('requires credentials for password login and a valid token for protected routes', async () => {
  const missingCredentials = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'employee@reimburseflow.com' }
  })
  assert.equal(missingCredentials.response.status, 400)

  const missingToken = await request('/api/auth/me')
  assert.equal(missingToken.response.status, 401)

  const invalidToken = await request('/api/auth/me', { token: 'invalid-token' })
  assert.equal(invalidToken.response.status, 401)

  const currentUser = await request('/api/auth/me', { token: employeeToken })
  assert.equal(currentUser.response.status, 200)
  assert.equal(currentUser.data.user.role, 'employee')
})

test('registers a company admin and rejects duplicate email addresses', async () => {
  const registration = {
    email: 'ci-registration@reimburseflow.test',
    password: 'test-password',
    fullName: 'CI Test Admin',
    companyName: 'CI Test Company'
  }
  const created = await request('/api/auth/register', {
    method: 'POST',
    body: registration
  })

  assert.equal(created.response.status, 201)
  assert.equal(created.data.user.role, 'admin')
  assert.equal(created.data.company.name, registration.companyName)

  const duplicate = await request('/api/auth/register', {
    method: 'POST',
    body: registration
  })
  assert.equal(duplicate.response.status, 400)
})

test('requires expense fields before accepting a submission', async () => {
  const result = await request('/api/expenses', {
    method: 'POST',
    token: employeeToken,
    body: { description: 'Incomplete expense' }
  })
  assert.equal(result.response.status, 400)
  assert.equal(result.data.success, false)
})

test('submits an expense and makes it visible to its owner and approver', async () => {
  const result = await request('/api/expenses', {
    method: 'POST',
    token: employeeToken,
    body: {
      description: 'CI integration test travel',
      category: 'Travel',
      amount: 42.5,
      currency: 'eur',
      merchant: 'Test Rail'
    }
  })

  assert.equal(result.response.status, 201)
  assert.equal(result.data.data.status, 'pending')
  assert.equal(result.data.data.currency, 'EUR')
  submittedExpenseId = result.data.data.id

  const ownExpenses = await request('/api/expenses/my', { token: employeeToken })
  assert.ok(ownExpenses.data.data.some((expense) => expense.id === submittedExpenseId))

  const pendingApprovals = await request('/api/approvals/pending', { token: managerToken })
  assert.ok(pendingApprovals.data.data.some((approval) => approval.expenseId === submittedExpenseId))
})

test('restricts company expense access to manager and admin roles', async () => {
  const employeeResult = await request('/api/expenses/company', { token: employeeToken })
  assert.equal(employeeResult.response.status, 403)

  const managerResult = await request('/api/expenses/company', { token: managerToken })
  assert.equal(managerResult.response.status, 200)
  assert.ok(managerResult.data.data.some((expense) => expense.id === submittedExpenseId))
})

test('allows an assigned manager to approve a submitted expense', async () => {
  const approval = await request('/api/approvals/process', {
    method: 'POST',
    token: managerToken,
    body: { expenseId: submittedExpenseId, action: 'approved', comment: 'Within policy' }
  })
  assert.equal(approval.response.status, 200)
  assert.equal(approval.data.data.status, 'approved')

  const expense = await request(`/api/expenses/${submittedExpenseId}`, { token: employeeToken })
  assert.equal(expense.response.status, 200)
  assert.equal(expense.data.data.status, 'approved')

  const history = await request(`/api/approvals/history/${submittedExpenseId}`, {
    token: employeeToken
  })
  assert.equal(history.data.data[0].status, 'approved')
})
