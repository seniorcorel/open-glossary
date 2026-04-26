import Icon from "./Icon";

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmModal({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }: Props) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/30 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded border border-sand/30 p-8 max-w-sm w-full mx-4 shadow-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${danger ? "bg-burgundy/10 text-burgundy" : "bg-cream text-walnut"}`}>
            <Icon name={danger ? "trash" : "check"} size={20} />
          </div>
          <div>
            <h3 className="font-serif text-lg text-espresso">{title}</h3>
            <p className="text-sm text-stone mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-sand/50 rounded text-sm text-walnut hover:bg-cream transition-all">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded text-sm font-medium text-white transition-all ${danger ? "bg-burgundy hover:bg-burgundy/80" : "bg-espresso hover:bg-ink"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
