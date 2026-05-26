// Generic stylized button. Variants:
//   - primary  : large glowing "play" style
//   - secondary: framed metal button
//   - ghost    : low-emphasis (used in footer)

const VARIANTS = {
  primary:
    'bg-rust-button text-bone-100 gothic uppercase tracking-widest border border-black/70 shadow-plate hover:brightness-110 active:brightness-95',
  secondary:
    'bg-metal-plate text-bone-200 gothic uppercase tracking-widest border border-black/70 shadow-plate hover:text-bone-100 hover:border-brass-500/60',
  ghost:
    'bg-transparent text-bone-300 hover:text-bone-100 border border-transparent hover:border-black/60',
};

const SIZES = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-6 text-2xl',
};

export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  className = '',
  disabled = false,
  ...rest
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        'rounded-sm transition select-none',
        VARIANTS[variant],
        SIZES[size],
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
