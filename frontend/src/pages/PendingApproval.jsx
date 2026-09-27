import { Link } from 'react-router-dom';

export default function PendingApproval() {
  return (
    <div className="max-w-md mx-auto mt-20 bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
      <h2 className="text-2xl font-bold mb-4">درخواست شما ثبت شد</h2>
      <p className="mb-4">حساب مدرس شما برای مدیر ارسال شد. لطفاً منتظر تأیید بمانید.</p>
      <Link to="/" className="text-blue-500 hover:underline">بازگشت به خانه</Link>
    </div>
  );
}
