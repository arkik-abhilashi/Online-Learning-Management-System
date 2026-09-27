import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    api.get('/certificates/my').then(res => setCertificates(res.data.certificates)).catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">گواهی‌های من</h2>
      {certificates.length === 0 && <p>هنوز گواهی دریافت نکرده‌اید</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certificates.map(cert => (
          <div key={cert.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-between items-center">
            <div>
              <h3 className="font-bold">{cert.courseTitle}</h3>
              <p className="text-sm text-gray-500">تاریخ: {new Date(cert.issueDate).toLocaleDateString('fa-IR')}</p>
            </div>
            <a
              href={`http://localhost:5000/uploads/certificates/${cert.certificateCode}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              مشاهده / دانلود PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
