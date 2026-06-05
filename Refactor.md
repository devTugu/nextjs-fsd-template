# FSD Architecture Refactor Prompt for Cursor
## Clean Up Hybrid Structure to Pure FSD

---

## 🎯 Task
Refactor the Next.js project from hybrid structure (FSD in `/src` mixed with root-level `/components`, `/lib`, `/types`) to a **clean, pure FSD structure** where ALL code lives in `/src` following Feature-Sliced Design.

---

## 🔄 Migration Plan

### Step 1: Move Shadcn UI Components

**FROM:** `/components/ui/*`  
**TO:** `/src/shared/ui/`

```bash
# Action: Move all files from components/ui/ to src/shared/ui/
# Files to move:
- /components/ui/button.tsx → /src/shared/ui/button.tsx
- /components/ui/input.tsx → /src/shared/ui/input.tsx
- /components/ui/card.tsx → /src/shared/ui/card.tsx
- /components/ui/label.tsx → /src/shared/ui/label.tsx
- /components/ui/*.tsx → /src/shared/ui/*.tsx
```

Then create **`/src/shared/ui/index.ts`** with all re-exports:
```typescript
export { Button } from './button';
export { Input } from './input';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
export { Label } from './label';
export * from '@/components/ui/*'; // Remove this line after all moved
```

**Update import statements:**
- FROM: `import { Button } from '@/components/ui/button'`
- TO: `import { Button } from '@/shared/ui'`

---

### Step 2: Move Utilities to Shared Layer

**FROM:** `/lib/utils.ts`  
**TO:** `/src/shared/lib/utils.ts`

```typescript
// /src/shared/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export * from './validators'; // Re-export validators
export * from './formatters'; // Re-export formatters
```

**Update all imports:**
- FROM: `import { cn } from '@/lib/utils'`
- TO: `import { cn } from '@/shared/lib'`

---

### Step 3: Move Global Types to Entities

**FROM:** `/types/*`  
**TO:** `/src/entities/*/types/`

```
/types/routes.d.ts → /src/config/routes.ts (or shared/config/)
/types/validator.ts → /src/shared/lib/validators.ts
/types/cache-life.d.ts → /src/shared/config/cache.ts
```

**Action:**
- Global type definitions → `/src/shared/config/types.ts`
- Route types → `/src/shared/config/routes.ts`
- Validator types → `/src/shared/lib/validators.ts`

---

### Step 4: Move Providers to Processes

**FROM:** `/app/providers.tsx`  
**TO:** `/src/processes/providers.tsx`

```typescript
// /src/processes/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Update `/app/layout.tsx`:**
```typescript
// FROM
import { Providers } from './providers';

// TO
import { Providers } from '@/processes/providers';
```

---

### Step 5: Update TypeScript Config Paths

**`tsconfig.json`:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./app/*"],
      "@/public/*": ["./public/*"]
    },
    "baseUrl": "."
  }
}
```

This ensures:
- `@/shared/*` → `/src/shared/*`
- `@/entities/*` → `/src/entities/*`
- `@/features/*` → `/src/features/*`
- `@/widgets/*` → `/src/widgets/*`
- `@/processes/*` → `/src/processes/*`

---

### Step 6: Delete Root-Level Folders

After migration, **DELETE these folders:**
```bash
rm -rf /components
rm -rf /lib
rm -rf /types
```

**Keep only:**
- `/app` - Next.js routes
- `/src` - All FSD logic
- `/public` - Static assets
- Root config files (tsconfig.json, package.json, etc.)

---

## 🔍 File-by-File Migration

### Scenario: Using Button Component

**BEFORE (Current - Hybrid):**
```typescript
// app/(main)/page.tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Page() {
  return <Button className={cn('px-4')}>Click me</Button>;
}
```

**AFTER (Pure FSD):**
```typescript
// app/(main)/page.tsx
import { Button } from '@/shared/ui';
import { cn } from '@/shared/lib';

export default function Page() {
  return <Button className={cn('px-4')}>Click me</Button>;
}
```

---

### Scenario: Using API Utilities

**BEFORE:**
```typescript
// src/features/auth/api/mutations.ts
import { cn } from '@/lib/utils';
import { axiosInstance } from '@/shared/api';
```

**AFTER:**
```typescript
// src/features/auth/api/mutations.ts
import { cn } from '@/shared/lib';
import { axiosInstance } from '@/shared/api';
```

---

## 📋 Updated Project Structure (After Refactor)

```
nextjs-model/
│
├── app/                                    # Next.js App Router
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/[token]/page.tsx
│   │
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/[id]/page.tsx
│   │   └── profile/page.tsx
│   │
│   ├── layout.tsx                         # Uses @/processes/providers
│   ├── page.tsx
│   └── globals.css
│
├── src/                                    # ✨ ALL FSD CODE HERE
│   │
│   ├── shared/
│   │   ├── api/
│   │   │   ├── axiosInstance.ts
│   │   │   ├── interceptors.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── ui/                            # ✨ Shadcn components here
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── label.tsx
│   │   │   ├── form.tsx
│   │   │   ├── modal.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── utils.ts                  # ✨ cn() utility here
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useMounted.ts
│   │   │
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── routes.ts
│   │   │   ├── api.config.ts
│   │   │   └── types.ts                  # ✨ Global types here
│   │   │
│   │   └── index.ts
│   │
│   ├── entities/
│   │   ├── user/
│   │   │   ├── api/queries.ts
│   │   │   ├── types/user.ts
│   │   │   ├── ui/UserCard.tsx
│   │   │   ├── ui/UserAvatar.tsx
│   │   │   └── index.ts
│   │   ├── product/
│   │   │   ├── api/queries.ts
│   │   │   ├── types/product.ts
│   │   │   ├── ui/ProductCard.tsx
│   │   │   └── index.ts
│   │   ├── post/
│   │   │   ├── api/queries.ts
│   │   │   ├── types/post.ts
│   │   │   ├── ui/PostCard.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/mutations.ts
│   │   │   ├── model/store.ts
│   │   │   ├── types/auth.ts
│   │   │   ├── ui/SignInForm.tsx
│   │   │   ├── ui/SignUpForm.tsx
│   │   │   ├── ui/ForgotPasswordForm.tsx
│   │   │   ├── ui/AuthGuard.tsx
│   │   │   └── index.ts
│   │   ├── filters/
│   │   │   ├── model/store.ts
│   │   │   ├── types/filters.ts
│   │   │   ├── ui/FilterPanel.tsx
│   │   │   └── index.ts
│   │   ├── search/
│   │   │   ├── api/queries.ts
│   │   │   ├── model/store.ts
│   │   │   ├── ui/SearchBar.tsx
│   │   │   └── index.ts
│   │   ├── notifications/
│   │   │   ├── model/store.ts
│   │   │   ├── ui/NotificationCenter.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── widgets/
│   │   ├── header/Header.tsx
│   │   ├── footer/Footer.tsx
│   │   ├── sidebar/Sidebar.tsx
│   │   ├── product-grid/ProductGrid.tsx
│   │   └── index.ts
│   │
│   ├── processes/
│   │   ├── providers.tsx                  # ✨ React Query provider
│   │   ├── middleware.ts
│   │   ├── routes.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── public/
├── .env.local
├── .env.example
├── tsconfig.json                          # ✨ Updated paths
├── tailwind.config.ts
├── next.config.ts
├── components.json                        # Update or delete
├── package.json
└── README.md
```

---

## 🔧 Cursor Refactor Steps

### Execute in Order:

1. **Create `/src/shared/ui/` folder and move Shadcn components**
   - Move all files from `/components/ui/` to `/src/shared/ui/`
   - Create `/src/shared/ui/index.ts` with re-exports
   - Update all import statements in the project

2. **Move utilities to `/src/shared/lib/`**
   - Move `/lib/utils.ts` to `/src/shared/lib/utils.ts`
   - Update all imports of `@/lib/utils`

3. **Move providers to `/src/processes/`**
   - Move `/app/providers.tsx` to `/src/processes/providers.tsx`
   - Update imports in `/app/layout.tsx`

4. **Consolidate types**
   - Move `/types/*` content to `/src/shared/config/types.ts`
   - Move route types to `/src/shared/config/routes.ts`

5. **Update TypeScript config**
   - Update `tsconfig.json` with correct paths
   - Verify `baseUrl` is `.`

6. **Search and replace all imports**
   - `@/components/ui` → `@/shared/ui`
   - `@/lib/utils` → `@/shared/lib`
   - `./providers` → `@/processes/providers`

7. **Delete root-level folders**
   - Delete `/components`
   - Delete `/lib`
   - Delete `/types`

8. **Verify imports**
   - Run `npm run lint` to catch any broken imports
   - Run `npm run dev` to test the app

---

## ✅ Verification Checklist

After refactor, verify:

- [ ] All Shadcn components in `/src/shared/ui/`
- [ ] `cn()` utility in `/src/shared/lib/utils.ts`
- [ ] Global types in `/src/shared/config/types.ts`
- [ ] Providers in `/src/processes/providers.tsx`
- [ ] `/app/layout.tsx` imports `@/processes/providers`
- [ ] All import statements use `@/shared/*` or `@/entities/*` etc.
- [ ] No imports from deleted folders (`/components`, `/lib`, `/types`)
- [ ] `tsconfig.json` has correct paths
- [ ] `npm run dev` runs without errors
- [ ] `npm run build` succeeds
- [ ] No console errors in browser

---

## 🚀 After Refactor

Your project will be:

✅ **Pure FSD Architecture** - All code in `/src` following FSD rules  
✅ **Clean Imports** - Everything starts with `@/`  
✅ **Scalable** - Easy to add new features without refactoring  
✅ **Type Safe** - All types properly organized  
✅ **Maintainable** - Clear layer separation  

---

## 📌 Important Notes

- **Do NOT delete files** while refactoring - copy then update imports
- **Test frequently** - run `npm run dev` after each major step
- **Use Find & Replace** - for bulk import updates in your IDE
- **TypeScript errors are normal** - they'll resolve as you fix imports
- **Check `.env` files** - ensure environment variables are correct

---

**Copy this entire prompt to Cursor and execute step by step!*