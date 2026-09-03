export function StarRating({
  value,
  onChange,
  size = 22,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="flex gap-1 leading-none" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
          onClick={() => onChange?.(n)}
          className={
            (n <= value ? "text-seal" : "text-ink/20") +
            (readOnly ? "" : " transition-transform hover:scale-110")
          }
        >
          ★
        </button>
      ))}
    </div>
  );
}
