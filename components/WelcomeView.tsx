
import React from 'react';

interface Props {
  text: string;
  onStart: () => void;
}

const WelcomeView: React.FC<Props> = ({ text, onStart }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-green-600 text-center animate-fadeIn">
      <i className="fas fa-info-circle text-green-600 text-5xl mb-4"></i>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Bilgilendirme</h2>
      <div className="prose max-w-none text-gray-600 mb-8 whitespace-pre-wrap">
        {text}
      </div>
      <button
        onClick={onStart}
        className="bg-green-600 text-white px-10 py-3 rounded-full font-bold text-lg hover:bg-green-700 transition-all shadow-md transform hover:scale-105"
      >
        Başla
      </button>
    </div>
  );
};

export default WelcomeView;
