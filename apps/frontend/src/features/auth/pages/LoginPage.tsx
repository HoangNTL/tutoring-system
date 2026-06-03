import LoginForm from '@/features/auth/components/LoginForm'
import Footer from '@/layouts/components/Footer'
import Header from '@/layouts/components/Header'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
