
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
  onEditClick?: () => void;
}

const ProfileImagePreview = ({
  imageUrl,
  altText = "Profile Image",
  onEditClick,
}: ProfileImagePreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      <div
        className="cursor-pointer transition-all hover:opacity-80 hover:shadow-lg w-full h-full relative group"
        onClick={handleImageClick}
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
        
        {onEditClick && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick();
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="text-white h-8 w-8 bg-black bg-opacity-50 rounded-full"
            >
              <span className="sr-only">Edit profile picture</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </Button>
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
          {onEditClick && (
            <div className="flex justify-center mt-4">
              <Button onClick={onEditClick}>
                Edit Profile
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileImagePreview;
