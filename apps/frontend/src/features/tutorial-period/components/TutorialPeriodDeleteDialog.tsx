import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import type { TutorialPeriod } from '@/features/tutorial-period/types/tutorialPeriod.types'

type TutorialPeriodDeleteDialogProps = {
  tutorialPeriod: TutorialPeriod | null
  isDeleting: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export function TutorialPeriodDeleteDialog({
  tutorialPeriod,
  isDeleting,
  onConfirm,
  onOpenChange,
}: TutorialPeriodDeleteDialogProps) {
  return (
    <AlertDialog open={tutorialPeriod !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa đợt phụ đạo</AlertDialogTitle>
          <AlertDialogDescription>
            {tutorialPeriod
              ? `Bạn có chắc chắn muốn xóa "${tutorialPeriod.title}" không? Hành động này chỉ áp dụng cho đợt ở trạng thái DRAFT.`
              : 'Xác nhận xóa đợt phụ đạo.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
