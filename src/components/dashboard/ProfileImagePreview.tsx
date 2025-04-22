
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ProfileImagePreviewProps {
  imageUrl: string;
  altText?: string;
}

const ProfileImagePreview = ({
  imageUrl,
  altText = "Profile Image",
}: ProfileImagePreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <div
        className="cursor-pointer transition-all hover:opacity-80 hover:shadow-lg w-full h-full"
        onClick={() => setIsOpen(true)}
      >
        <img
          src={imageUrl}
          alt={altText}
          className="rounded-full object-cover w-full h-full"
          onError={() => setImageError(true)}
          style={{ display: imageError ? 'none' : 'block' }}
        />
        {imageError && (
          <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl">
            {altText?.charAt(0) || "?"}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="relative">
            <DialogTitle>{altText}</DialogTitle>
            <DialogDescription>Click outside to close</DialogDescription>
            <DialogClose className="absolute right-2 top-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {!imageError ? (
              <img
                src={imageUrl}
                alt={altText}
                className="max-h-[70vh] max-w-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl">
                {altText?.charAt(0) || "?"}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileImagePreview;
