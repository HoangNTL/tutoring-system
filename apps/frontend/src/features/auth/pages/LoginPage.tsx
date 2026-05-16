import { ArrowRight, ShieldCheck } from 'lucide-react'

import LoginForm from '@/features/auth/components/LoginForm'
import Footer from '@/layouts/components/Footer'
import Header from '@/layouts/components/Header'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0f4c81_0px,#0f4c81_96px,#edf3f8_96px,#f8fbfd_100%)] text-slate-900">
      <Header />

      <main className="mx-auto flex min-h-[calc(100vh-152px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,76,129,0.18)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#0f4c81,#1e6aa5)] p-8 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_34%)]" />

            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-sky-50 backdrop-blur">
                <ShieldCheck className="size-4" />
                Cổng đăng nhập an toàn
              </div>

              <div className="space-y-4">
                <h2 className="max-w-md text-4xl leading-tight font-semibold">
                  Truy cập hệ thống quản lý học phụ đạo với giao diện đơn giản, rõ ràng.
                </h2>

                <p className="max-w-lg text-sm leading-7 text-sky-50/85">
                  Sử dụng tài khoản đã được cấp để đăng nhập. Sau khi xác thực thành công, hệ thống sẽ chuyển bạn về đúng trang đang cần truy cập.
                </p>
              </div>
            </div>

            <div className="relative grid gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm font-medium">Hỗ trợ đăng nhập</p>
                <p className="mt-1 text-sm leading-6 text-sky-50/80">
                  Nếu gặp khó khăn khi đăng nhập, vui lòng liên hệ phòng đào tạo để được hỗ trợ.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-slate-950/15 px-4 py-3 text-sm text-sky-50/85">
                <span>Quản lý tập trung qua Laravel API</span>
                <ArrowRight className="size-4" />
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center bg-white p-5 sm:p-8 lg:p-10">
            <LoginForm />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
