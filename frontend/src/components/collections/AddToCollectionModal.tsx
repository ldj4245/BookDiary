"use client";

import { useEffect, useState } from "react";
import { FolderPlus, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { listCollections, addCollectionItem, removeCollectionItem } from "@/lib/api/client";
import type { Collection } from "@/types";
import { toast } from "sonner";

interface AddToCollectionModalProps {
  userBookId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToCollectionModal({ userBookId, open, onOpenChange }: AddToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      listCollections()
        .then(setCollections)
        .catch(() => toast.error("컬렉션 목록을 불러오지 못했습니다."))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const toggleCollection = async (collection: Collection) => {
    const isIncluded = collection.userBookIds.includes(userBookId);
    setProcessingId(collection.id);
    
    try {
      if (isIncluded) {
        await removeCollectionItem(collection.id, userBookId);
        setCollections(cols => cols.map(c => 
          c.id === collection.id ? { ...c, userBookIds: c.userBookIds.filter(id => id !== userBookId) } : c
        ));
        toast.success(`'${collection.name}'에서 제거되었습니다.`);
      } else {
        await addCollectionItem(collection.id, userBookId);
        setCollections(cols => cols.map(c => 
          c.id === collection.id ? { ...c, userBookIds: [...c.userBookIds, userBookId] } : c
        ));
        toast.success(`'${collection.name}'에 추가되었습니다.`);
      }
    } catch {
      toast.error("오류가 발생했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="size-5 text-primary" />
            컬렉션에 담기
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-2 pr-2">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">불러오는 중...</div>
          ) : collections.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              만들어진 컬렉션이 없습니다.<br/>컬렉션 메뉴에서 먼저 생성해주세요.
            </div>
          ) : (
            collections.map((col) => {
              const isIncluded = col.userBookIds.includes(userBookId);
              const isProcessing = processingId === col.id;
              
              return (
                <button
                  key={col.id}
                  onClick={() => void toggleCollection(col)}
                  disabled={isProcessing}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    isIncluded 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border/60 hover:bg-muted/50 text-foreground"
                  } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span className="font-semibold">{col.name}</span>
                  {isIncluded && <Check className="size-5" />}
                </button>
              );
            })
          )}
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
