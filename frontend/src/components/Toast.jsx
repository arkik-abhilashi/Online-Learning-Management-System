import { useNotification } from '../contexts/NotificationContext';

export default function Toast() {
  const { toasts } = useNotification();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 left-4 flex flex-col gap-2 z-50">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-2 rounded shadow text-white ${
          t.type === 'error' ? 'bg-red-500' : t.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
        }`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
