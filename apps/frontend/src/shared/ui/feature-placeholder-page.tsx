type FeaturePlaceholderPageProps = {
  eyebrow: string
  title: string
  description: string
}

export default function FeaturePlaceholderPage({
  eyebrow,
  title,
  description,
}: FeaturePlaceholderPageProps) {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-400">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </section>
  )
}
