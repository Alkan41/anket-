import React, { useState } from 'react';
import { AppData, Question, SurveyResponse } from '../types';

interface Props {
  data: AppData;
  updateData: (newData: Partial<AppData>) => void;
  onLogout: () => void;
}

const AdminPanel: React.FC<Props> = ({ data, updateData, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'PERSONNEL' | 'QUESTIONS' | 'SETTINGS'>('REPORTS');
  const [personnelBulkText, setPersonnelBulkText] = useState('');

  const handleSavePersonnel = () => {
    const names = personnelBulkText.split('\n').map(n => n.trim()).filter(n => n !== '');
    if (names.length === 0) return;
    const combined = Array.from(new Set([...data.personnel, ...names]));
    updateData({ personnel: combined });
    setPersonnelBulkText('');
    alert('Personel listesi güncellendi.');
  };

  const exportToExcel = () => {
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8">
      <style>
        .header { background-color: #15803d; color: #ffffff; font-weight: bold; border: 1px solid #000000; text-align: center; }
        .cell { border: 1px solid #000000; text-align: center; color: #000000; }
        .score-cell { font-weight: bold; background-color: #f0fdf4; border: 1px solid #000000; }
      </style>
      </head>
      <body>
      <table border="1">
        <thead>
          <tr>
            <th class="header">TARİH</th>
            <th class="header">PERSONEL AD SOYAD</th>
            ${data.questions.flatMap(q => q.sections.map(s => `<th class="header">${q.id}${s.label} (${s.sectionWeight}x)</th>`)).join('')}
            <th class="header">TOPLAM PUAN</th>
          </tr>
        </thead>
        <tbody>
          ${data.responses.map(res => `
            <tr>
              <td class="cell">${res.timestamp}</td>
              <td class="cell">${res.personnelName}</td>
              ${data.questions.flatMap(q => q.sections.map(s => {
                const rating = res.scores[s.id] || 0;
                return `<td class="cell">${rating * s.sectionWeight}</td>`;
              })).join('')}
              <td class="score-cell">${res.totalScore}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      </body></html>
    `;

    const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Yogunluk_Analizi_Raporu_${new Date().toLocaleDateString('tr-TR')}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border-4 border-white animate-fadeIn custom-shadow">
      <div className="bg-black p-12 text-white flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter">Sistem Yönetimi</h2>
          <p className="text-xs text-green-500 font-bold mt-2 tracking-[0.3em] uppercase">Kontrol Paneli ve Veri Analizi</p>
        </div>
        <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl text-sm font-black transition-all shadow-xl active:scale-95 uppercase">
          Güvenli Çıkış
        </button>
      </div>

      <div className="flex bg-gray-50 border-b-4 border-gray-100 p-2 overflow-x-auto scrollbar-hide">
        {[
          { id: 'REPORTS', icon: 'fa-chart-bar', label: 'RAPORLAR' },
          { id: 'PERSONNEL', icon: 'fa-user-plus', label: 'PERSONEL YÖNETİMİ' },
          { id: 'QUESTIONS', icon: 'fa-sliders-h', label: 'SORU/KATSAYI' },
          { id: 'SETTINGS', icon: 'fa-file-alt', label: 'GİRİŞ METNİ' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[200px] px-8 py-6 font-black text-xs flex items-center justify-center space-x-4 transition-all rounded-[2.5rem] ${
              activeTab === tab.id 
                ? 'bg-white shadow-xl text-green-700 ring-2 ring-gray-100 scale-105 z-10' 
                : 'text-gray-400 hover:text-green-600'
            }`}
          >
            <i className={`fas ${tab.icon} text-lg`}></i>
            <span className="uppercase">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-12 min-h-[600px]">
        {activeTab === 'REPORTS' && (
          <div className="space-y-12 animate-fadeIn">
            <div className="flex justify-between items-end border-l-8 border-green-600 pl-6">
              <div>
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Analiz Sonuçları</h3>
                <p className="text-gray-400 font-bold mt-2 uppercase text-xs italic">Toplam {data.responses.length} kayıt bulundu.</p>
              </div>
              <button 
                onClick={exportToExcel} 
                className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-green-700 shadow-xl uppercase"
              >
                <i className="fas fa-file-excel mr-2"></i> Excel İndir
              </button>
            </div>

            <div className="overflow-x-auto rounded-[3rem] border-4 border-gray-100 shadow-inner">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-green-700 text-black border border-black p-4 font-black text-xs uppercase">TARİH</th>
                    <th className="bg-green-700 text-black border border-black p-4 font-black text-xs uppercase">PERSONEL AD SOYAD</th>
                    {data.questions.flatMap(q => q.sections.map(s => (
                      <th key={s.id} className="bg-green-700 text-black border border-black p-4 font-black text-[10px] uppercase">
                        {q.id}{s.label}<br/>({s.sectionWeight}x)
                      </th>
                    )))}
                    <th className="bg-black text-white border border-black p-4 font-black text-xs uppercase">TOPLAM</th>
                  </tr>
                </thead>
                <tbody className="text-black font-bold">
                  {data.responses.map(res => (
                    <tr key={res.id} className="hover:bg-green-50 transition-colors">
                      <td className="border border-black p-4 text-center text-xs">{res.timestamp}</td>
                      <td className="border border-black p-4 text-left uppercase">{res.personnelName}</td>
                      {data.questions.flatMap(q => q.sections.map(s => (
                        <td key={s.id} className="border border-black p-4 text-center">
                          {(res.scores[s.id] || 0) * s.sectionWeight}
                        </td>
                      )))}
                      <td className="border border-black p-4 text-center bg-green-50 font-black text-green-800">
                        {res.totalScore}
                      </td>
                    </tr>
                  ))}
                  {data.responses.length === 0 && (
                    <tr><td colSpan={50} className="p-20 text-center text-gray-300 italic text-2xl uppercase">Henüz veri girişi yapılmadı.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'PERSONNEL' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-fadeIn">
            <div className="space-y-8">
              <div className="border-l-8 border-green-600 pl-6">
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Personel Listesi Ekle</h3>
                <p className="text-sm font-bold text-gray-400 uppercase mt-2">İsimleri alt alta yapıştırıp kaydedin.</p>
              </div>
              <textarea 
                rows={12}
                value={personnelBulkText}
                onChange={(e) => setPersonnelBulkText(e.target.value)}
                className="w-full p-8 border-4 border-gray-100 rounded-[3rem] font-bold text-xl outline-none focus:border-green-500 shadow-inner uppercase"
                placeholder="Ahmet Yılmaz&#10;Mehmet Kaya..."
              />
              <button onClick={handleSavePersonnel} className="w-full bg-green-600 text-white py-7 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:bg-green-700 active:scale-95 transition-all uppercase">
                Listeyi Kaydet
              </button>
            </div>
            <div className="bg-gray-50 p-10 rounded-[4rem] border-4 border-gray-100 flex flex-col">
              <h3 className="text-2xl font-black uppercase mb-8 border-b-4 pb-4 flex justify-between items-center text-gray-800">
                <span>Mevcut Liste</span>
                <span className="bg-green-700 text-white px-6 py-2 rounded-2xl text-base shadow-lg">{data.personnel.length}</span>
              </h3>
              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-4 scrollbar-hide">
                {data.personnel.map(p => (
                  <div key={p} className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 text-base font-black text-gray-700 flex justify-between items-center group shadow-sm hover:border-red-400 transition-all uppercase">
                    <span>{p}</span>
                    <button onClick={() => updateData({ personnel: data.personnel.filter(x => x !== p) })} className="text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'QUESTIONS' && (
          <div className="space-y-12 animate-fadeIn">
            <div className="border-l-8 border-green-600 pl-4">
              <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Soru Ve Katsayı Ayarları</h3>
            </div>
            {data.questions.map(q => (
              <div key={q.id} className="border-4 border-gray-100 rounded-[3rem] overflow-hidden shadow-2xl bg-white mb-10">
                <div className="bg-black text-white p-8 font-black text-xl flex justify-between items-center uppercase tracking-widest">
                  <input 
                    className="bg-transparent border-b-2 border-green-900 outline-none w-3/4"
                    value={q.text}
                    onChange={(e) => {
                      const updated = data.questions.map(currQ => currQ.id === q.id ? { ...currQ, text: e.target.value } : currQ);
                      updateData({ questions: updated });
                    }}
                  />
                  <span className="bg-green-700 px-6 py-2 rounded-2xl text-xs uppercase tracking-widest font-mono">
                    Toplam: {q.sections.reduce((a,b)=>a+b.sectionWeight,0)}
                  </span>
                </div>
                <div className="p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                  {q.sections.map(sec => (
                    <div key={sec.id} className="bg-green-50 p-8 rounded-[3rem] border-4 border-green-100 text-center hover:scale-105 transition-transform shadow-lg group">
                      <div className="text-[10px] font-black text-green-700 opacity-40 uppercase mb-5 tracking-widest">Bölüm: {sec.label}</div>
                      <input 
                        type="number" 
                        value={sec.sectionWeight} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const updated = data.questions.map(currQ => 
                            currQ.id === q.id ? { ...currQ, sections: currQ.sections.map(currS => currS.id === sec.id ? { ...currS, sectionWeight: val } : currS) } : currQ
                          );
                          updateData({ questions: updated });
                        }}
                        className="w-full text-center text-5xl font-black text-green-800 bg-transparent outline-none group-focus-within:text-green-600"
                      />
                      <textarea 
                        className="w-full text-[10px] text-gray-500 font-black uppercase mt-6 leading-tight bg-transparent text-center resize-none outline-none"
                        rows={2}
                        value={sec.title}
                        onChange={(e) => {
                          const updated = data.questions.map(currQ => 
                            currQ.id === q.id ? { ...currQ, sections: currQ.sections.map(currS => currS.id === sec.id ? { ...currS, title: e.target.value } : currS) } : currQ
                          );
                          updateData({ questions: updated });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="space-y-10 animate-fadeIn">
            <div className="border-l-8