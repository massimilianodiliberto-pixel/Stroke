"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteProductImage } from "@/actions/products";

interface Photo {
  id: string;
  url: string;
}

export function PhotoUploader({ productId, photos }: { productId: string; photos: Photo[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.set("file", file);
        form.set("productId", productId);
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        if (!res.ok) throw new Error("upload");
      }
      router.refresh();
    } catch {
      setError("Caricamento fallito. Riprova con un'immagine JPG/PNG.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative h-36 w-28 overflow-hidden border border-paper/15">
            <Image src={photo.url} alt="" fill sizes="112px" className="object-cover" />
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  await deleteProductImage(photo.id);
                  router.refresh();
                })
              }
              className="absolute right-1 top-1 hidden bg-ink/80 px-1.5 py-0.5 text-xs text-danger group-hover:block"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-36 w-28 items-center justify-center border border-dashed border-paper/30 text-3xl text-paper-dim hover:border-acid hover:text-acid disabled:opacity-40"
        >
          {uploading ? "…" : "+"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <p className="text-xs text-paper-dim">
        Le foto vengono ridimensionate e convertite in WebP automaticamente. La prima è la
        copertina.
      </p>
    </div>
  );
}
