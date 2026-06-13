export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl animate-pulse">
      <header className="mb-10 text-center flex flex-col items-center">
        <div className="h-12 bg-muted rounded-full w-3/4 mb-4" />
        <div className="h-4 bg-muted rounded w-1/4" />
      </header>

      <div className="w-full aspect-video bg-muted rounded-3xl mb-10 shadow-sm" />

      <div className="space-y-4">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
      </div>
    </main>
  );
}