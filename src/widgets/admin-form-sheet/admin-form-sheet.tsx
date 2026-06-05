'use client';

import { cn } from '@/shared/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet';

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
} as const;

interface AdminFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: keyof typeof sizeClasses;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AdminFormSheet({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  children,
  footer,
}: AdminFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          'flex h-full w-full flex-col gap-0 p-0',
          sizeClasses[size]
        )}
      >
        <SheetHeader className="shrink-0 border-b px-6 pt-6 pb-4">
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t px-6 py-4">{footer}</div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
