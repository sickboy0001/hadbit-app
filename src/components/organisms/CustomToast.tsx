// src/components/molecules/SuccessToastWithEditButton.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner"; // toast.dismiss を使用するため

interface CustomToastProps {
  toastId: string | number; // sonnerのtoastIdの型に合わせて調整
  message: string;
  submessage: string;
  buttonTitle?: string;
  onEditClick?: () => void;
}

const CustomToast: React.FC<CustomToastProps> = ({
  toastId,
  message,
  submessage,
  buttonTitle,
  onEditClick,
}) => {
  const handleEdit = () => {
    if (onEditClick) {
      onEditClick();
    }
    toast.dismiss(toastId); // トーストを閉じる
  };

  return (
    <div
      className="flex w-full max-w-md items-center space-x-3 rounded-md border bg-background p-4 shadow-lg"
      // sonnerのデフォルトスタイルに近づけるためのクラス
    >
      <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-500" />
      <div className="grid flex-1 gap-1">
        <p className="text-sm font-semibold">{message}</p>
        <p className="text-sm text-muted-foreground">{submessage}</p>
      </div>
      {onEditClick && buttonTitle && (
        <Button variant="outline" size="sm" onClick={handleEdit}>
          {buttonTitle}
        </Button>
      )}
    </div>
  );
};

export default CustomToast;
