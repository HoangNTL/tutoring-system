import huceLogo from '@/assets/icons/logo-dai-hoc-xay-dung.svg';

export default function Header() {
    return (
        <header className="border-b border-white/10 bg-[#0f4c81] text-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <img
                        src={huceLogo}
                        alt="Trường Đại Học Xây Dựng"
                        className="h-12 w-auto max-w-[140px] sm:h-14"
                    />

                    <div className="space-y-0.5">
                        <h1 className="text-sm font-bold uppercase tracking-wide text-white sm:text-lg">
                            Trường Đại Học Xây Dựng
                        </h1>

                        <p className="text-xs text-sky-100/80 sm:text-sm">
                            Hanoi University of Civil Engineering
                        </p>
                    </div>
                </div>

                <div className="hidden text-right md:block">
                    <p className="text-sm font-bold uppercase tracking-wide text-yellow-300">
                        Hệ thống đăng ký học phụ đạo
                    </p>

                    <p className="text-sm text-sky-100/80">
                        Dành cho sinh viên nước ngoài
                    </p>
                </div>
            </div>
        </header>
    );
}
