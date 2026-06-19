import { useAppSelector } from '@/app/store/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { User, Shield, IdCard, Calendar, Building, Info } from 'lucide-react'
import { formatDate } from '@/shared/lib/date'

const roleLabels: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  DEPARTMENT: 'Bộ môn',
  LECTURER: 'Giảng viên',
  STUDENT: 'Sinh viên',
}

const roleColors: Record<string, string> = {
  ADMIN: 'border-rose-200 bg-rose-50 text-rose-700',
  DEPARTMENT: 'border-sky-200 bg-sky-50 text-sky-700',
  LECTURER: 'border-violet-200 bg-violet-50 text-violet-700',
  STUDENT: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user)

  if (!user) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="text-slate-500">Không tìm thấy thông tin tài khoản.</div>
      </div>
    )
  }

  // Determine display name
  let displayName = user.username
  if (user.role === 'LECTURER' && user.lecturerName) {
    displayName = user.lecturerName
  } else if (user.role === 'STUDENT' && user.studentName) {
    displayName = user.studentName
  } else if (user.role === 'DEPARTMENT' && user.departmentName) {
    displayName = user.departmentName
  }

  const roleLabel = roleLabels[user.role] ?? user.role
  const roleColorClass = roleColors[user.role] ?? 'bg-slate-50 text-slate-700'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Top Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-indigo-50/50 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-32 w-32 rounded-full bg-violet-50/50 blur-3xl" />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Avatar Icon */}
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-inner">
            <User className="size-8" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
              <Badge variant="outline" className={`font-semibold ${roleColorClass}`}>
                {roleLabel}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Tài khoản hệ thống: <span className="font-semibold text-slate-700">{user.username}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <CardHeader className="border-b border-slate-100 bg-slate-50/40 pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Info className="size-5 text-indigo-600" /> Thông tin tài khoản & Hồ sơ
          </CardTitle>
          <CardDescription>
            Chi tiết các mã nhận diện (ID) phục vụ cho quá trình kiểm thử và đồng bộ dữ liệu.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Account ID */}
            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/30 p-3">
              <Shield className="size-5 text-slate-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">
                  ID Tài khoản (User ID)
                </span>
                <span className="font-mono text-sm font-semibold text-slate-800">
                  {user.id}
                </span>
                <span className="text-[10px] text-slate-400 block italic">
                  ID tự tăng trong CSDL MySQL cục bộ
                </span>
              </div>
            </div>

            {/* Username */}
            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/30 p-3">
              <IdCard className="size-5 text-slate-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">
                  Tên đăng nhập / Mã định danh
                </span>
                <span className="font-mono text-sm font-semibold text-slate-800">
                  {user.username}
                </span>
                <span className="text-[10px] text-slate-400 block italic">
                  Dùng để đăng nhập hệ thống
                </span>
              </div>
            </div>

            {/* Legacy Role Entity ID */}
            {(user.role === 'LECTURER' || user.role === 'STUDENT' || user.role === 'DEPARTMENT') && (
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/30 p-3">
                <IdCard className="size-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">
                    {user.role === 'LECTURER' && 'ID Giảng viên (Legacy Lecturer ID)'}
                    {user.role === 'STUDENT' && 'ID Sinh viên (Legacy Student ID)'}
                    {user.role === 'DEPARTMENT' && 'ID Khoa/Bộ môn (Legacy Dept ID)'}
                  </span>
                  <span className="font-mono text-sm font-semibold text-indigo-700">
                    {user.role === 'LECTURER' && (user.lecturerId ?? 'Chưa liên kết')}
                    {user.role === 'STUDENT' && (user.studentId ?? 'Chưa liên kết')}
                    {user.role === 'DEPARTMENT' && (user.departmentId ?? 'Chưa liên kết')}
                  </span>
                  <span className="text-[10px] text-slate-400 block italic">
                    ID ánh xạ từ CSDL SQL Server của trường
                  </span>
                </div>
              </div>
            )}

            {/* Department Name for Department account */}
            {user.role === 'DEPARTMENT' && user.departmentName && (
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/30 p-3">
                <Building className="size-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">
                    Tên Khoa / Bộ môn
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {user.departmentName}
                  </span>
                </div>
              </div>
            )}

            {/* Created At */}
            {user.createdAt && (
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/30 p-3">
                <Calendar className="size-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">
                    Ngày khởi tạo tài khoản
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
