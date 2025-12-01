# Components

This directory contains the React components for the Sturgeon AI application.

## Directory Structure

```
components/
├── layout/          # Layout components (TopBar, Sidebar, Footer, etc.)
│   └── TopBar.tsx   # Application header with navigation and sign out
└── ui/              # Reusable UI components (Button, Input, etc.)
    └── Button.tsx   # Button component with variants
```

## Components

### TopBar

**Location**: `components/layout/TopBar.tsx`

A header component that displays the application title and a sign-out button.

**Features**:
- Displays "Sturgeon AI – Government Contracting & Grants" branding
- Sign out button with NextAuth integration
- Responsive design with Tailwind CSS
- Dark theme with slate color palette

**Usage**:
```tsx
import { TopBar } from '@/components/layout/TopBar';

export default function MyPage() {
  return (
    <div>
      <TopBar />
      {/* Page content */}
    </div>
  );
}
```

### Button

**Location**: `components/ui/Button.tsx`

A reusable button component with multiple variants.

**Props**:
- `variant`: "default" | "ghost" (default: "default")
- `children`: Button content
- All standard HTML button attributes

**Usage**:
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="ghost" onClick={handleClick}>
  Click me
</Button>
```

## Authentication

The TopBar component uses NextAuth for authentication. Make sure to:

1. Set up the `NEXTAUTH_SECRET` environment variable in production
2. Configure your authentication providers in `pages/api/auth/[...nextauth].ts`
3. Review and implement proper security measures (see security warnings in the auth config)

## Styling

All components use Tailwind CSS for styling. The configuration is in `tailwind.config.js`.

### Color Palette
- Primary background: `slate-950`
- Borders: `slate-800`
- Text: `slate-200`, `slate-400`
- Interactive elements: Custom variants per component

## Development

To add new components:

1. Create the component file in the appropriate directory (`layout/` or `ui/`)
2. Follow the existing naming conventions (PascalCase)
3. Export the component as a named export
4. Add TypeScript interfaces for props
5. Document the component in this README
