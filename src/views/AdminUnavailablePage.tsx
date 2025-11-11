export function AdminUnavailablePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-semibold tracking-wide">Admin portal unavailable</h1>
        <p className="mt-3 text-sm text-gray-600">
          The administrative interface is not installed in this build. If you are an administrator,
          please contact the site maintainer or use the backend directly.
        </p>
      </div>
    </div>
  );
}



