import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const { addNotification } = useNotification();

  useEffect(() => {
    api.get('/student/features/wishlist').then(res => setItems(res.data.items)).catch(() => {});
  }, []);

  const removeFromWishlist = async (courseId) => {
    await api.delete(`/student/features/wishlist/${courseId}`);
    setItems(items.filter(i => i.courseId !== courseId));
    addNotification('از علاقه‌مندی‌ها حذف شد', 'success');
  };

  const addToCart = async (courseId) => {
    await api.post('/student/features/cart', { courseId });
    addNotification('به سبد خرید اضافه شد', 'success');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">علاقه‌مندی‌ها</h2>
      {items.length === 0 && <p>هیچ دوره‌ای اضافه نشده است</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.courseId} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h3 className="font-bold">{item.title}</h3>
            <p>{item.price === 0 ? 'رایگان' : `${item.price} تومان`}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => addToCart(item.courseId)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">افزودن به سبد</button>
              <button onClick={() => removeFromWishlist(item.courseId)} className="text-red-500 text-sm">حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
