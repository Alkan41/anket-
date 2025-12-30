
import React from 'react';

const SurveyCompleted: React.FC = () => {
  return (
    <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center animate-fadeIn mt-10">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
        <i className="fas fa-check-circle text-5xl"></i>
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Anket Tamamlanmıştır</h2>
      <p className="text-xl font-bold text-green-700 mb-8">Sayfayı kapatabilirsiniz.</p>
      <div className="pt-8 border-t border-gray-50 text-gray-400 text-sm font-bold uppercase tracking-widest">
        Katılımınız İçin Teşekkür Ederiz
      </div>
    </div>
  );
};

export default SurveyCompleted;
