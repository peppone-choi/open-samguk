# apps/web

**Next.js frontend**

## OVERVIEW

React frontend: App Router, tRPC client, Tailwind CSS. Port 3000.

## STRUCTURE

```
src/
├── app/
│   ├── (auth)/      # login/, register/, servers/
│   └── (game)/      # Game pages (map/, nation/, troop/)
├── components/
│   ├── game/        # GeneralBasicCard, CommandSelectForm, MessagePanel
│   └── ui/          # shadcn/ui components
├── contexts/        # AuthContext, GeneralContext
└── utils/trpc.ts    # tRPC client setup
```

## WHERE TO LOOK

| Task           | Location                      |
| -------------- | ----------------------------- |
| Add page       | `app/(game)/[route]/page.tsx` |
| Game component | `components/game/`            |
| UI primitive   | `components/ui/` (shadcn)     |
| Auth state     | `contexts/AuthContext.tsx`    |

## STYLING

- Backgrounds: `bg0` (dark), `bg1` (medium), `bg2` (light)
- Max widths: `max-w-[1000px]` desktop, `max-w-[500px]` mobile
- Log colors: `<R>text</>` → red span (MessagePanel)

## PATTERNS

```tsx
"use client";
import { TopBackBar } from "@/components/game";
import { trpc } from "@/utils/trpc";

export default function SomePage() {
  const { data } = trpc.game.getSomething.useQuery();
  return (
    <div className="max-w-[1000px] mx-auto">
      <TopBackBar title="Title" />
    </div>
  );
}
```

## CONVENTIONS

- Game pages under `(game)/` route group
- Use `TopBackBar` for navigation
- tRPC for all API calls (no direct fetch)
