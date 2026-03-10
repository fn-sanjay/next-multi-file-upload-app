export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-black grid place-items-center">
      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" aria-label="Loading" />
    </div>
  );
}

