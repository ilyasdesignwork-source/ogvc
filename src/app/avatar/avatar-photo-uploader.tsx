"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AvatarPhotoUploaderProps = {
  currentPhotoUrl: string | null;
};

const MAX_FILE_SIZE_BYTES = 1024 * 1024;
const TARGET_RATIO = 3 / 4;

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Не удалось прочитать изображение"));
    };
    img.src = objectUrl;
  });
}

async function centerCropToWebp(file: File) {
  const image = await loadImage(file);
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;

  const sourceRatio = sourceWidth / sourceHeight;
  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;
  let cropX = 0;
  let cropY = 0;

  if (sourceRatio > TARGET_RATIO) {
    cropWidth = Math.round(sourceHeight * TARGET_RATIO);
    cropX = Math.round((sourceWidth - cropWidth) / 2);
  } else {
    cropHeight = Math.round(sourceWidth / TARGET_RATIO);
    cropY = Math.round((sourceHeight - cropHeight) / 2);
  }

  const canvas = document.createElement("canvas");
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Не удалось подготовить canvas");
  }

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight,
  );

  let quality = 0.92;
  let blob: Blob | null = null;
  while (quality >= 0.5) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );
    if (blob && blob.size <= MAX_FILE_SIZE_BYTES) {
      break;
    }
    quality -= 0.08;
  }

  if (!blob) {
    throw new Error("Не удалось подготовить изображение");
  }

  if (blob.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("После авто-кропа фото больше 1MB");
  }

  return new File([blob], "avatar.webp", { type: "image/webp" });
}

export default function AvatarPhotoUploader({
  currentPhotoUrl,
}: AvatarPhotoUploaderProps) {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl);
  const [status, setStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    try {
      setStatus("Готовим фото: авто-кроп и сжатие...");
      const processedFile = await centerCropToWebp(selectedFile);
      const localPreview = URL.createObjectURL(processedFile);
      setPreviewUrl(localPreview);

      setIsUploading(true);
      const formData = new FormData();
      formData.append("photo", processedFile);

      const response = await fetch("/api/avatar/photo", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok || result.error) {
        throw new Error(result.error ?? "Не удалось загрузить фото");
      }

      setStatus(result.message ?? "Фото обновлено");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ошибка при обработке фото";
      setStatus(message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/70 p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="h-64 w-56 overflow-hidden rounded-xl border border-zinc-800 bg-black">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Фотография пилота"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-sm text-zinc-500">
              Фото еще не загружено
            </div>
          )}
        </div>

        <div className="w-full max-w-md space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-red-500">Фото</p>
          <p className="text-sm text-zinc-300">
            Авто-кроп по центру (3:4). Ограничение итогового файла: не более 1MB.
          </p>
          <input
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={onFileChange}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          />
          {status ? (
            <p className="rounded-md border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-200">
              {status}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
