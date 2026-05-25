"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onSave: (value: string) => void | Promise<void>;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
};

export function InlineEditableText({
  value,
  onSave,
  placeholder = "클릭하여 입력…",
  multiline = true,
  className,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select?.();
    }
  }, [editing]);

  const commit = useCallback(async () => {
    setEditing(false);
    if (draft !== value) await onSave(draft);
  }, [draft, value, onSave]);

  if (editing) {
    const shared = {
      ref: ref as React.RefObject<HTMLTextAreaElement & HTMLInputElement>,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
        setDraft(e.target.value),
      onBlur: () => void commit(),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          void commit();
        }
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      },
      className: cn(
        "w-full rounded-md border border-border bg-white px-2 py-1.5 text-sm outline-none ring-1 ring-ring/30",
        className,
      ),
    };
    return multiline ? (
      <textarea rows={4} {...shared} />
    ) : (
      <input type="text" {...shared} />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={cn(
        "group w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/70",
        !value && "text-muted-foreground italic",
        className,
      )}
    >
      <span className="block min-h-[1.5rem] whitespace-pre-wrap">
        {value || placeholder}
      </span>
    </button>
  );
}
