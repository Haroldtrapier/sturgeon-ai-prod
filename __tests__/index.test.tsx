import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Index from '../pages/index'

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}))

describe('Home Page', () => {
  it('renders main heading', () => {
    render(<Index />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('has navigation links', () => {
    render(<Index />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('displays company branding', () => {
    render(<Index />)
    expect(screen.getByText(/Sturgeon AI/i)).toBeInTheDocument()
  })
})
