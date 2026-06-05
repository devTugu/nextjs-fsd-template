'use client';

interface DataTableEmptyProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function DataTableEmpty({
  title = 'No results',
  description = 'Try adjusting your search or create a new record.',
  action,
}: DataTableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
      {action}
    </div>
  );
}
