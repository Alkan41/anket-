
import React, { useState, useMemo } from 'react';
import { AppData, Question, SurveyResponse } from '../types';

interface Props {
  data: AppData;
  updateData: (newData: Partial<AppData>) => void;
  onLogout: () => void;
}

const AdminPanel: React.FC<Props> = ({ data, updateData, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'PERSONNEL' | 'QUESTIONS' | 'SETTINGS'>('REPORTS');
  const [personnelBulkText, setPersonnelBulkText] = useState('');

  const AIRCRAFT_LIST = [
    { label: "T-70", id_suffix: "t70" },
    { label: "AT-802A", id_suffix: "at802a" },
    { label: "BELL 429", id_suffix: "bell429" },
    { label: "B-360", id_suffix: "b360" },
    { label: "C-650", id_suffix: "c650" }
  ];

  const getRatingForAircraft = (res: SurveyResponse, sectionId: string, aircraftIdSuffix: string): number => {
    const itemId = `${sectionId}_${aircraftIdSuffix}`;
    return res.scores[itemId] || 0;
  };

  const calculateAircraftWeightedScore = (res: SurveyResponse, aircraftIdSuffix: string): number => {
    let weightedSum = 0;
    data.questions.forEach(q => {
      q.sections.forEach(s => {
        const rating = getRatingForAircraft(res, s.id, aircraftIdSuffix);
        weightedSum += rating * s.sectionWeight;
      });
    });
    return Math.round(weightedSum);
  };

  const globalMaxScore = useMemo(() => {
    if (data.responses.length === 0) return 0;
    let max = 0;
    data.responses.forEach(res => {
      AIRCRAFT_LIST.forEach(air => {
        const score = calculateAircraftWeightedScore(res, air.id_suffix);
        if (score > max) max = score;
      });
    });
    return max;
  }, [data.responses, data.questions]);

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
        .unit-header { background-color: #166534; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000000; }
        .cell { border: 1px solid #e2e8f0; text-align: left; color: #000000; }
        .score-cell { font-weight: bold; text-align: center; color: #166534; border: 1px solid #e2e8f0; }
      </style>
      </head>
      <body>
      <table>
        <thead>
          <tr>
            <th class="header">HAVA ARACI</th>
            <th class="header">PERSONEL AD SOYAD</th>
            ${data.questions.flatMap(q => q.sections.map(s => `<th class="header">${q.id}${s.label} (${s.title})</th>`)).join('')}
            <th class="header">TOPLAM PUAN</th>
          </tr>
        </thead>
        <tbody>
          ${AIRCRAFT_LIST.map(air => `
            <tr><td colspan="${2 + data.questions.reduce((a, b) => a + b.sections.length, 0) + 1}" class="unit-header">${air.label} BİRİMİ KAYITLARI</td></tr>
            ${data.responses.map(res => `
              <tr>
                <td class="cell">${air.label}</td>
                <td class="cell">${res.personnelName}</td>
                ${data.questions.flatMap(q => q.sections.map(s => {
                  const rating = getRatingForAircraft(res, s.id, air.id_suffix);
                  return `<td class="score-cell">${rating * s.sectionWeight}</td>`;
                })).join('')}
                <td class="score-cell">${calculateAircraftWeightedScore(res, air.id_suffix)}</td>
              </tr>
            `).join('')}
          `).join('')}
        </tbody>
      </table>
      </body></html>
    `;

    const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ayrintili_Rapor_Excel_${new Date().toLocaleDateString('tr-TR')}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToWord = () => {
    const dateStr = new Date().toLocaleDateString('tr-TR');
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Dinamik Yoğunluk Analizi Raporu</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; line-height: 1.6; }
        h1 { color: #15803d; text-align: center; border-bottom: 3px solid #15803d; padding-bottom: 10px; text-transform: uppercase; }
        .info-text { background-color: #f0fdf4; border: 2px solid #bbf7d0; padding: 15px; border-radius: 8px; margin-bottom: 25px; color: #14532d; font-weight: bold; }
        .referans-box { text-align: center; margin: 30px 0; padding: 20px; border: 2px dashed #15803d; background-color: #ffffff; }
        .referans-val { font-size: 32px; color: #15803d; font-weight: 900; }
        .unit-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .unit-table th { background-color: #15803d; color: white; padding: 10px; border: 1px solid #166534; }
        .unit-table td { padding: 10px; border: 1px solid #e2e8f0; text-align: center; }
        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
      </style>
      </head>
      <body>
        <h1>DİNAMİK YOĞUNLUK ANALİZİ RAPORU</h1>
        <p style='text-align: right;'><strong>Rapor Tarihi:</strong> ${dateStr}</p>
        <div class="info-text">
          Yüzdelik oranlamalar, kurum içi en yüksek skor baz alınarak yapılmaktadır. Bu yöntem, en yoğun skor birime göre diğer birimlerin göreceli yükünü göstermektedir.
        </div>
        <div class="referans-box">
          <p>Sistemdeki En Yüksek Skor (Referans)</p>
          <div class="referans-val">${globalMaxScore}</div>
        </div>
        <h2>BİRİM BAZLI YOĞUNLUK VERİLERİ</h2>
        <table class="unit-table">
          <thead>
            <tr>
              <th>HAVA ARACI BİRİMİ</th>
              <th>KATILIMCI SAYISI</th>
              <th>ORTALAMA SKOR</th>
              <th>YOĞUNLUK ORANI (%)</th>
            </tr>
          </thead>
          <tbody>
            ${AIRCRAFT_LIST.map(air => {
              const unitScores = data.responses.map(res => calculateAircraftWeightedScore(res, air.id_suffix));
              const totalParticipants = data.responses.length;
              const avgScore = totalParticipants > 0 ? unitScores.reduce((a, b) => a + b, 0) / totalParticipants : 0;
              const avgPct = globalMaxScore > 0 ? ((avgScore / globalMaxScore) * 100).toFixed(1) : "0.0";
              return `
                <tr>
                  <td style="text-align: left; font-weight: bold;">${air.label}</td>
                  <td>${totalParticipants} Kişi</td>
                  <td>${Math.round(avgScore)}</td>
                  <td style="color: #15803d; font-weight: bold;">%${avgPct}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        <div class="footer">Bu rapor otomatik olarak üretilmiştir.</div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dinamik_Analiz_Raporu_${dateStr}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-200 animate-fadeIn">
      <div className="bg-gradient-to-r from-green-900 to-green-700 p-8 text-white flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Sistem Yönetim Paneli</h2>
          <p className="text-xs text-green-300 font-bold mt-1 opacity-70 tracking-widest uppercase">Gelişmiş Analiz Ve Birim Bazlı Raporlama</p>
        </div>
        <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl text-sm font-black transition-all shadow-xl active:scale-95 uppercase">
          <i className="fas fa-sign-out-alt mr-2"></i> Çıkış
        </button>
      </div>

      <div className="flex bg-gray-100 border-b overflow-x-auto scrollbar-hide p-1">
        {[
          { id: 'REPORTS', icon: 'fa-file-excel', label: 'BİRİM BAZLI RAPOR' },
          { id: 'PERSONNEL', icon: 'fa-user-plus', label: 'PERSONEL YÖNETİMİ' },
          { id: 'QUESTIONS', icon: 'fa-sliders-h', label: 'KATSAYI AYARLARI' },
          { id: 'SETTINGS', icon: 'fa-edit', label: 'GİRİŞ METNİ' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[170px] px-6 py-5 font-black text-xs flex items-center justify-center space-x-3 transition-all rounded-xl ${
              activeTab === tab.id 
                ? 'text-green-800 bg-white shadow-sm ring-1 ring-gray-200' 
                : 'text-gray-400 hover:text-green-600'
            }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-8">
        {activeTab === 'REPORTS' && (
          <div className="space-y-16 animate-fadeIn">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="border-l-8 border-green-600 pl-4">
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Birim Bazlı Ayrıntılı Rapor</h3>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <button 
                    onClick={exportToExcel} 
                    className="flex-1 md:flex-none bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-green-700 transition-all shadow-lg flex items-center justify-center space-x-2 uppercase"
                  >
                    <i className="fas fa-file-excel"></i>
                    <span>Ayrıntılı Rapor Excel</span>
                  </button>
                  <button 
                    onClick={exportToWord} 
                    className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center space-x-2 uppercase"
                  >
                    <i className="fas fa-file-word"></i>
                    <span>Word Analiz İndir</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border-2 border-gray-100 rounded-[1.5rem] shadow-xl">
                <table className="min-w-full text-xs text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-green-700 text-white font-black">
                      <th className="px-6 py-6 border-r border-green-800 text-center bg-green-800 uppercase tracking-widest min-w-[120px]">HAVA ARACI</th>
                      <th className="px-6 py-6 border-r border-green-800 uppercase tracking-widest text-center min-w-[200px]">PERSONEL AD SOYAD</th>
                      {data.questions.flatMap(q => q.sections.map(s => (
                        <th key={s.id} className="px-3 py-6 text-center border-r border-green-800 min-w-[80px]">
                          <div className="flex flex-col items-center">
                            <span>{q.id}{s.label}</span>
                            <span className="text-[8px] bg-green-900 px-1 rounded mt-1">W:{s.sectionWeight}</span>
                          </div>
                        </th>
                      )))}
                      <th className="px-6 py-6 text-center bg-green-900 border-r border-green-800 uppercase tracking-widest min-w-[120px]">TOPLAM PUAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-black">
                    {data.responses.length === 0 ? (
                      <tr><td colSpan={50} className="p-20 text-center text-gray-400 font-black italic tracking-widest bg-gray-50 uppercase">Henüz sisteme giriş yapılmadı</td></tr>
                    ) : (
                      AIRCRAFT_LIST.map((air) => (
                        <React.Fragment key={air.id_suffix}>
                          <tr className="bg-green-600 border-y border-green-700 text-white">
                            <td colSpan={50} className="px-6 py-3 font-black uppercase tracking-[0.3em] text-[10px] text-center">
                              {air.label} BİRİMİ KAYITLARI
                            </td>
                          </tr>
                          {data.responses.map((res) => (
                            <tr key={`${air.id_suffix}_${res.id}`} className="hover:bg-green-50/50 transition-colors">
                              <td className="px-6 py-4 font-black text-gray-700 bg-gray-50 border-r border-gray-100 text-center uppercase tracking-tighter">
                                {air.label}
                              </td>
                              <td className="px-6 py-4 font-black text-gray-900 border-r border-gray-100">
                                {res.personnelName}
                              </td>
                              {data.questions.flatMap(q => q.sections.map(s => {
                                const rating = getRatingForAircraft(res, s.id, air.id_suffix);
                                return (
                                  <td key={`${air.id_suffix}_${res.id}_${s.id}`} className="px-3 py-4 text-center border-r border-gray-100 font-bold text-black">
                                    <div className="text-sm">{rating * s.sectionWeight}</div>
                                    <div className="text-[8px] text-gray-400 font-normal italic">({rating}p)</div>
                                  </td>
                                );
                              }))}
                              <td className="px-6 py-4 text-center font-black text-green-800 bg-green-50 border-r border-gray-100 text-sm">
                                {calculateAircraftWeightedScore(res, air.id_suffix)}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PERSONNEL' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="border-l-8 border-green-600 pl-4">
                  <h3 className="text-2xl font-black text-gray-900 uppercase">Personel Listesi Ekle</h3>
                  <p className="text-sm font-bold text-gray-400">İsimleri her satıra bir tane gelecek şekilde yapıştırın.</p>
                </div>
                <textarea 
                  rows={10}
                  placeholder="Ahmet Yılmaz..."
                  value={personnelBulkText}
                  onChange={(e) => setPersonnelBulkText(e.target.value)}
                  className="w-full p-6 border-2 border-gray-100 rounded-3xl outline-none focus:ring-8 focus:ring-green-50 focus:border-green-600 font-sans shadow-inner text-lg font-bold"
                />
                <button onClick={handleSavePersonnel} className="w-full bg-green-600 text-white px-8 py-5 rounded-2xl font-black text-xl hover:bg-green-700 transition-all shadow-2xl uppercase">Kaydet</button>
              </div>
              <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-200">
                <h3 className="text-xl font-black text-gray-800 mb-6 flex justify-between items-center border-b pb-4 uppercase">
                  <span>Mevcut Liste</span>
                  <span className="bg-green-700 text-white px-4 py-1 rounded-lg text-xs font-mono">{data.personnel.length}</span>
                </h3>
                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-3">
                  {data.personnel.map(p => (
                    <div key={p} className="bg-white p-4 rounded-2xl border border-gray-100 text-sm font-black text-gray-700 flex justify-between items-center group shadow-sm">
                      <span>{p}</span>
                      <button onClick={() => updateData({ personnel: data.personnel.filter(x => x !== p) })} className="text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"><i className="fas fa-trash-alt"></i></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'QUESTIONS' && (
          <div className="space-y-12 animate-fadeIn">
            <div className="border-l-8 border-green-600 pl-4">
              <h3 className="text-2xl font-black text-gray-900 uppercase">Ağırlık Ve Katsayı Ayarları</h3>
            </div>
            {data.questions.map(q => (
              <div key={q.id} className="border-2 border-gray-100 rounded-[2rem] overflow-hidden shadow-lg bg-white">
                <div className="bg-green-800 text-white p-6 font-black text-lg flex justify-between items-center">
                  <span>{q.id}. SORU KONFİGÜRASYONU</span>
                  <span className="bg-green-950 px-4 py-1 rounded-xl text-xs uppercase tracking-widest font-mono">TOPLAM: {q.sections.reduce((a,b)=>a+b.sectionWeight,0)}</span>
                </div>
                <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {q.sections.map(sec => (
                    <div key={sec.id} className="bg-green-50 p-6 rounded-3xl border-2 border-green-100 text-center">
                      <div className="text-[10px] font-black text-green-800 opacity-40 uppercase mb-4 tracking-widest">BÖLÜM: {sec.label}</div>
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
                        className="w-full text-center text-4xl font-black text-green-800 bg-transparent outline-none focus:scale-110 transition-transform"
                      />
                      <div className="text-[9px] text-gray-400 font-black uppercase mt-4 leading-tight">{sec.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="border-l-8 border-green-600 pl-4">
              <h3 className="text-2xl font-black text-gray-900 uppercase">Giriş Metni Ve Uyarılar</h3>
            </div>
            <textarea 
              rows={15}
              value={data.welcomeText}
              onChange={(e) => updateData({ welcomeText: e.target.value })}
              className="w-full p-8 border-2 border-gray-100 rounded-[2.5rem] outline-none focus:ring-8 focus:ring-green-50 focus:border-green-600 shadow-inner font-bold text-gray-700 leading-relaxed text-lg"
              placeholder="Hoş geldiniz..."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
