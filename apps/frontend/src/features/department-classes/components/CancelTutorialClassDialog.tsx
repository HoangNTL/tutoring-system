import type { DepartmentTutorialClass } from '@/features/department-classes/types/departmentTutorialClass.types'
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

type CancelTutorialClassDialogProps = {
  tutorialClass: DepartmentTutorialClass | null
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void> | void
}

export function CancelTutorialClassDialog({
  tutorialClass,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: CancelTutorialClassDialogProps) {
  return (
    <AlertDialog
      open={tutorialClass !== null}
      onOpenChange={(nextOpen) => !isSubmitting && onOpenChange(nextOpen)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hủy lớp phụ đạo</AlertDialogTitle>
          <AlertDialogDescription>
            {tutorialClass
              ? `Bạn có chắc muốn hủy lớp phụ đạo môn "${tutorialClass.courseName}"?`
              : ''}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Đóng</AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting || tutorialClass === null}
            onClick={(event) => {
              event.preventDefault()
              void onConfirm()
            }}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
