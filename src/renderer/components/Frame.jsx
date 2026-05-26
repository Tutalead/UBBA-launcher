// Outer ornamental "metal" frame that wraps the whole launcher.
// Decorative corners are pure CSS — no image assets required.
export default function Frame({ children }) {
  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden">
      {/* Inner content */}
      <div className="flex flex-col flex-1 min-h-0">{children}</div>
    </div>
  );
}
