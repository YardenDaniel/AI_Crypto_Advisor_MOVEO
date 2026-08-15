import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import {
  resetUnauthorizedHandling,
  setUnauthorizedHandler,
} from '../api/unauthorized'

afterEach(() => {
  cleanup()
  resetUnauthorizedHandling()
  setUnauthorizedHandler(null)
})
