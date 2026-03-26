import { useToast } from '../src/ui/toast';

export default function Toasts() {
  const { toasts, remove } = useToast();

  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <div className="toast-body">
            {t.title ? <div className="toast-title">{t.title}</div> : null}
            {t.message ? <div className="toast-message">{t.message}</div> : null}
          </div>
          <button className="toast-x" onClick={() => remove(t.id)} aria-label="Close">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

