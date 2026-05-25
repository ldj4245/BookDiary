"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCollection, listCollections } from "@/lib/api/client";
import type { Collection } from "@/types";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);

  const load = () => void listCollections().then(setCollections);

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createCollection({ name: name.trim(), description });
    setName("");
    setDescription("");
    setOpen(false);
    load();
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 border-b border-border/70 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            <FolderOpen className="size-3.5" />
            컬렉션
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            컬렉션
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {collections.length}개의 묶음
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="w-fit gap-2" />}>
            <Plus className="size-4" />
            새 컬렉션
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>컬렉션 만들기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>이름</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>설명</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={() => void handleCreate()}>
                만들기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {collections.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => (
            <article
              key={collection.id}
              className="rounded-lg border border-border/80 bg-card p-5"
            >
              <div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-[var(--sage-soft)] text-primary">
                <FolderOpen className="size-5" />
              </div>
              <h2 className="text-base font-semibold text-[var(--ink)]">
                {collection.name}
              </h2>
              {collection.description && (
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {collection.description}
                </p>
              )}
              <p className="mt-5 text-xs text-muted-foreground">
                {collection.userBookIds.length}권
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/80 bg-[var(--paper)] px-4 py-14 text-center">
          <FolderOpen className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            컬렉션이 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
