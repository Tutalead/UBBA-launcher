// Outer ornamental "metal" frame that wraps the whole launcher.
// Decorative corners are pure CSS — no image assets required.
export default function Frame({ children }) {
  return (
    <div className="h-full w-full p-3 bg-grit bg-ink-900">
      <div className="relative h-full w-full flex flex-col plate overflow-hidden">
        {/* Decorative rivets at the four corners */}
        <span className="absolute top-2 left-2 rivet" />
        <span className="absolute top-2 right-2 rivet" />
        <span className="absolute bottom-2 left-2 rivet" />
        <span className="absolute bottom-2 right-2 rivet" />

        {/* Inner content */}
        <div className="flex flex-col flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
