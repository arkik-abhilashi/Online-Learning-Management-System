import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

export default function Cart() {
  const [items, setItems] = useState([]);
  const { addNotification } = useNotification();

  useEffect(() => {
    api.get('/student/features/cart').then(res => setItems(res.data.items)).catch(() => {});
  }, []);

  const removeFromCart = async (courseId) => {
    await api.delete(`/student/features/cart/${courseId}`);
    setItems(items.filter(i => i.courseId !== courseId));
  };

  const checkout = async () => {
    try {
      await api.post('/student/features/cart/checkout');
      addNotification('پرداخت موفق - در دوره‌ها ثبت‌نام شدید', 'success');
      setItems([]);
    } catch (err) {
      addNotification('خطا در پرداخت', 'error');
    }
  };

  const totalPrice = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">سبد خرید</h2>
      {items.length === 0 ? <p>سبد خرید خالی است</p> : (
        <>
          <div className="grid gap-4">
            {items.map(item => (
              <div key={item.courseId} className="flex justify-between bg-white dark:bg-gray-800 p-4 rounded shadow">
                <div><h3 className="font-bold">{item.title}</h3><p>{item.price} تومان</p></div>
                <button onClick={() => removeFromCart(item.courseId)} className="text-red-500">حذف</button>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">مجموع: {totalPrice} تومان</div>
          <button onClick={checkout} className="mt-2 bg-blue-600 text-white px-6 py-2 rounded">پرداخت و ثبت‌نام</button>
        </>
      )}
    </div>
  );
}
