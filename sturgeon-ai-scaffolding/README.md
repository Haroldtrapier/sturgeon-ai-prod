# Sturgeon AI Monorepo

Complete monorepo scaffolding with agent-kit and chat-kit packages.

## Structure

```
sturgeon-ai-prod/
├── apps/
│   ├── web/              # Next.js frontend (move existing app here)
│   └── backend/          # Python FastAPI backend (move existing backend here)
├── packages/
│   ├── agent-kit/        # 🤖 OpenAI agent orchestration
│   ├── chat-kit/         # 💬 Chat UI components
│   └── shared/           # 🔧 Shared utilities & types
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

## Setup Instructions

### 1. Install pnpm (if not installed)
```bash
npm install -g pnpm@latest
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Build all packages
```bash
pnpm build
```

### 4. Development
```bash
pnpm dev
```

## Using the Packages

### Agent Kit

```typescript
import { createAgent } from '@sturgeon-ai/agent-kit';

const agent = createAgent({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4-turbo-preview',
});

const response = await agent.chat('Hello!');
```

### Chat Kit

```tsx
import { ChatContainer, ChatMessage, ChatInput } from '@sturgeon-ai/chat-kit';

export function Chat() {
  return (
    <ChatContainer>
      <ChatMessage role="assistant" content="Hello!" />
      <ChatInput onSubmit={(msg) => console.log(msg)} />
    </ChatContainer>
  );
}
```

## Migration Steps

1. Create `apps/` directory
2. Move current Next.js app to `apps/web/`
3. Move current backend to `apps/backend/`
4. Update import paths to use workspace packages
5. Update build configuration

## Next Steps

- [ ] Set up Turborepo for faster builds (optional)
- [ ] Add shared ESLint configuration
- [ ] Add shared Prettier configuration
- [ ] Set up CI/CD pipeline
- [ ] Add E2E tests

## License

MIT
