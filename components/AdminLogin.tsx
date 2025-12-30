
import React, { useState } from 'react';
import { ADMIN_PASSWORD } from '../constants';

interface Props {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<Props> = ({ onLoginSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLoginSuccess();
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-lock text-3xl"></i>
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Admin Girişi</h2>
        <p className="text-gray-500 text-sm mb-8">Lütfen yönetim panelini açmak için şifreyi giriniz.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              className={`w-full p-4 border-2 rounded-2xl text-center text-2xl tracking-[1em] focus:ring-4 outline-none transition-all ${
                error ? 'border-red-500 bg-red-50 animate-pulse' : 'border-gray-100 focus:ring-green-100 focus:border-green-500'
              }`}
              autoFocus
            />
            {error && <p className="text-red-500 text-xs font-bold mt-2">Hatalı Şifre! Lütfen tekrar deneyin.</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-green-700 transition-all shadow-lg active:scale-95"
          >
            Giriş Yap
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
          >
            İptal
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
