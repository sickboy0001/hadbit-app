// src/components/molecules/SuccessToastWithEditButton.tsx
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner"; // toast.dismiss を使用するため
// toastId を除く CustomToastProps を定義

interface CustomToastProps {
  toastId: string | number; // sonnerのtoastIdの型に合わせて調整
  message: string;
  submessage: string;
  buttonTitle?: string;
  type?: string;
  onEditClick?: () => void;
}

// showCustomToast 関数に渡すプロパティの型 (toastId を除く)
interface ShowCustomToastOptions {
  message: string;
  submessage: string;
  buttonTitle?: string;
  type?: "success" | "error"; // type をより具体的に
  onEditClick?: () => void;
}

export const showCustomToast = (options: ShowCustomToastOptions) => {
  // CustomToast コンポーネントの定義を showCustomToast 関数のスコープ内に移動
  const CustomToastInternal: React.FC<CustomToastProps> = ({
    toastId,
    message,
    submessage,
    buttonTitle,
    type = "success",
    onEditClick,
  }) => {
    const handleEdit = () => {
      if (onEditClick) {
        onEditClick();
      }
      toast.dismiss(toastId); // トーストを閉じる
    };
    const IconComponent = type === "error" ? AlertTriangle : CheckCircle2;
    const iconColorClass = type === "error" ? "text-red-500" : "text-blue-500";
    const borderColorClass =
      type === "error" ? "border-red-400" : "border-blue-400";
    const backgroundColorClass = type === "error" ? "bg-red-50" : "bg-blue-50";

    return (
      <div
        className={`flex w-full max-w-md items-center space-x-3 rounded-md border p-4 shadow-lg ${borderColorClass} ${backgroundColorClass}`}
      >
        <IconComponent className={`h-6 w-6 flex-shrink-0 ${iconColorClass}`} />
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

  toast.custom((t) => (
    <CustomToastInternal // 関数スコープ内のコンポーネントを使用
      toastId={t}
      message={options.message}
      submessage={options.submessage}
      type={options.type}
      buttonTitle={options.buttonTitle}
      onEditClick={options.onEditClick}
    />
  ));
};
