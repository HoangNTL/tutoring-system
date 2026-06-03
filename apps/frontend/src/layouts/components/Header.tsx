import huceLogo from '@/assets/icons/logo-dai-hoc-xay-dung.svg'

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-[#0f4c81] text-white">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5 px-3 py-4 sm:px-4 lg:px-5">
        <div className="flex items-center gap-3">
          <img
            src={huceLogo}
            alt="Trường Đại Học Xây Dựng"
            className="h-10 w-auto max-w-[120px] sm:h-12"
          />

          <div className="space-y-0">
            <h1 className="text-sm font-bold uppercase tracking-wide text-white sm:text-base">
              Trường Đại Học Xây Dựng
            </h1>

            <p className="text-xs text-sky-100/80">
              Hanoi University of Civil Engineering
            </p>
          </div>
        </div>

        <div className="hidden text-right md:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300 lg:text-sm">
            Hệ thống đăng ký học phụ đạo
          </p>

          <p className="text-xs text-sky-100/80 lg:text-sm">
            Dành cho sinh viên nước ngoài
          </p>
        </div>
      </div>
    </header>
  )
}
