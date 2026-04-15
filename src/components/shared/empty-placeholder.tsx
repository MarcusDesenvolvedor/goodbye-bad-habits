type EmptyPlaceholderProps = {
  message: string;
  className?: string;
};

export function EmptyPlaceholder({ message, className }: EmptyPlaceholderProps) {
  return (
    <p
      className={
        className ??
        "rounded-2xl border border-dashed border-ds-outline-variant/25 bg-ds-surface-container-low/40 px-5 py-8 text-center text-sm text-ds-on-surface-variant"
      }
    >
      {message}
    </p>
  );
}
