# UI Components

## Input Component

A styled input component with dark theme Tailwind CSS styling.

### Usage

```tsx
import { Input } from '../components/ui/Input';

// Basic usage
<Input placeholder="Enter text..." />

// With type
<Input type="email" placeholder="email@example.com" />

// With custom styling
<Input placeholder="Search..." className="border-blue-500" />

// Disabled state
<Input placeholder="Disabled" disabled />

// All standard HTML input attributes are supported
<Input 
  type="password"
  placeholder="Password"
  required
  minLength={8}
  onChange={(e) => console.log(e.target.value)}
/>
```

### Props

The Input component accepts all standard HTML input attributes (`React.InputHTMLAttributes<HTMLInputElement>`), including:

- `type` - Input type (text, email, password, etc.)
- `placeholder` - Placeholder text
- `disabled` - Disable the input
- `required` - Mark as required
- `onChange` - Change event handler
- `value` - Controlled input value
- `className` - Additional CSS classes (merged with default styles)
- And all other standard input attributes

### Styling

The component uses Tailwind CSS with the following default styles:
- Dark background: `bg-slate-900`
- Border: `border-slate-700`
- Text color: `text-slate-50`
- Placeholder: `text-slate-500`
- Focus ring: `ring-blue-600`
- Full width, rounded corners, padding included
