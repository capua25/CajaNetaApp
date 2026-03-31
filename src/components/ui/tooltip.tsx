interface TooltipProps {
  content: string
  children: React.ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="relative inline-flex items-center group/tooltip">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 z-50 text-center leading-relaxed"
      >
        {content}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  )
}
