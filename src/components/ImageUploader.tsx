
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface ImageUploaderProps {
  onImagesSelected: (files: File[], previewUrl: string | null) => void;
}

export const ImageUploader = ({ onImagesSelected }: ImageUploaderProps) => {
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      if (fileArray.length > 1000) {
        toast({
          title: "Too many files",
          description: "Please select up to 1000 images",
          variant: "destructive",
        });
        return;
      }
      const url = fileArray.length > 0 ? URL.createObjectURL(fileArray[0]) : null;
      onImagesSelected(fileArray, url);
    }
  };

  return (
    <Input
      type="file"
      accept="image/*"
      multiple
      onChange={handleImageChange}
      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
    />
  );
};

