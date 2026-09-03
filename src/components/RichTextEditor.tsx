import { useEffect, useRef } from "react";

const COMMANDS: { cmd: string; label: string; title: string }[] = [
  { cmd: "bold", label: "N", title: "Negrito" },
  { cmd: "italic", label: "I", title: "Itálico" },
  { cmd: "underline", label: "S", title: "Sublinhado" },
  { cmd: "justifyLeft", label: "⯇", title: "Alinhar à esquerda" },
  { cmd: "justifyCenter", label: "≡", title: "Centralizar" },
  { cmd: "justifyRight", label: "⯈", title: "Alinhar à direita" },
  { cmd: "insertUnorderedList", label: "•", title: "Lista" },
];

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-xl border border-ink/15 bg-white/70">
      <div className="flex flex-wrap gap-1 border-b border-ink/10 p-1.5">
        {COMMANDS.map((c) => (
          <button
            key={c.cmd}
            type="button"
            title={c.title}
            onMouseDown={(e) => {
              e.preventDefault();
              document.execCommand(c.cmd);
              if (ref.current) onChange(ref.current.innerHTML);
            }}
            className="size-7 rounded-md text-[12px] font-semibold text-ink hover:bg-steel/60"
          >
            {c.label}
          </button>
        ))}
        <button
          type="button"
          title="Inserir nome do destinatário"
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand("insertText", false, "{name}");
            if (ref.current) onChange(ref.current.innerHTML);
          }}
          className="ml-auto rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-inksoft hover:bg-steel/60"
        >
          {"{name}"}
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="letter-body min-h-40 px-3 py-2.5 text-[14px] text-ink outline-none"
      />
    </div>
  );
}
