import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TextField } from './TextField'

describe('TextField', () => {
  it('associates the label with the input', () => {
    render(<TextField label="Email" />)

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('announces a validation error', () => {
    render(<TextField label="Password" error="This field is required" />)

    const input = screen.getByLabelText('Password')

    expect(input).toHaveAccessibleErrorMessage('This field is required')
  })
})
