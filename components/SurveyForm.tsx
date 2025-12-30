
import React, { useState, useRef, useEffect } from 'react';
import { Question, SurveyResponse } from '../types';

interface Props {
  questions: Question[];
  personnel: string[];
  onSave: (response: SurveyResponse) => void;
  onCancel: () => void;
}

const SurveyForm: React.FC<Props> = ({ questions, personnel, onSave, onCancel }) => {
  const [step, setStep] = useState(0);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [ratings, setRatings] = useState<{ [itemId: string]: number }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleRatingSelect = (itemId: string, value: number) => {
    setRatings(prev => ({ ...prev, [itemId]: value }));
  };

  const isStepComplete = () => {
    if (step === 0) return selectedPerson !== '';
    const currentQuestion = questions[step - 1];
    const itemIds = currentQuestion.sections.flatMap(s => s.items.map(i => i.id));
    return itemIds.every(id => ratings[id] !== undefined);
  };

  const handleNext = () => {
    if (isStepComplete()) {
      if (step < questions.length) {
        setStep(step + 1);
        window.scrollTo(0, 0);
      } else {
        handleSubmit();
      }
    } else {
      alert(step === 0 ? 'Lütfen personel seçiniz.' : 'Lütfen tüm alanları puanlayınız.');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    } else {
      onCancel();
    }
  };

  const handleSubmit = () => {
    let totalScore = 0;
    questions.forEach(q => {
      q.sections.forEach(s => {
        const sectionItems = s.items;
        const sumRatings = sectionItems.reduce((sum, item) => sum + (ratings[item.id] || 0), 0);
        const avgRating = sumRatings / sectionItems.length;
        totalScore += avgRating * s.sectionWeight;
      });
    });

    const response: SurveyResponse = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString('tr-TR'),
      personnelName: selectedPerson,
      scores: ratings,
      totalScore: Math.round(totalScore)
    };

    onSave(response);
  };

  const filteredPersonnel = personnel.filter(p => 
    p.toLowerCase().toLocaleLowerCase('tr-TR').includes(searchTerm.toLowerCase().toLocaleLowerCase('tr-TR'))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-green-50 p-8 rounded-3xl border-2 border-green-200 shadow-inner">
            <h3 className="text-xl font-black text-green-800 mb-6 flex items-center uppercase tracking-tight">
              <i className="fas fa-id-card mr-3"></i> Personel Kimlik Girişi
            </h3>
            <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-widest">Ad Soyad Giriniz / Seçiniz:</label>
            
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <input 
                  type="text"
                  value={selectedPerson || searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedPerson('');
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="İsim yazmaya başlayın..."
                  className="w-full p-5 border-2 border-green-300 rounded-2xl focus:ring-8 focus:ring-green-100 outline-none shadow-sm text-xl font-black text-green-900 transition-all bg-white"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-green-400">
                  <i className={`fas ${isDropdownOpen ? 'fa-chevron-up' : 'fa-search'}`}></i>
                </div>
              </div>

              {isDropdownOpen && (searchTerm || filteredPersonnel.length > 0) && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-green-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden">
                  {filteredPersonnel.length > 0 ? (
                    filteredPersonnel.map(p => (
                      <div 
                        key={p} 
                        onClick={() => {
                          setSelectedPerson(p);
                          setSearchTerm('');
                          setIsDropdownOpen(false);
                        }}
                        className="p-4 hover:bg-green-50 cursor-pointer font-bold text-gray-700 border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between group"
                      >
                        <span>{p}</span>
                        <i className="fas fa-check text-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-gray-400 italic text-center">Eşleşen sonuç bulunamadı</div>
                  )}
                </div>
              )}
            </div>

            {selectedPerson && (
              <div className="mt-4 p-4 bg-green-600 text-white rounded-2xl font-black flex items-center animate-fadeIn">
                <i className="fas fa-user-check mr-3"></i>
                Seçilen: {selectedPerson}
                <button 
                  onClick={() => setSelectedPerson('')}
                  className="ml-auto hover:text-red-200 transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    const currentQuestion = questions[step - 1];
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="bg-green-800 text-white p-6 rounded-2xl shadow-xl border-b-4 border-green-900">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">BÖLÜM {step} / {questions.length}</div>
          <h3 className="text-xl md:text-2xl font-black leading-tight">{currentQuestion.text}</h3>
        </div>

        <div className="space-y-12">
          {currentQuestion.sections.map(section => (
            <div key={section.id} className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 space-y-6">
              <h4 className="text-lg font-black text-gray-800 flex items-center border-b-2 border-green-100 pb-3">
                <span className="bg-black text-white w-8 h-8 rounded-lg inline-flex items-center justify-center mr-3 text-sm font-mono uppercase shadow-lg">{section.label}</span>
                {section.title} 
              </h4>
              
              <div className="grid grid-cols-1 gap-4">
                {section.items.map(item => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-4 group">
                    <span className="text-gray-900 font-black text-lg group-hover:text-green-700 transition-colors">{item.label}</span>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleRatingSelect(item.id, val)}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 font-black transition-all flex items-center justify-center shadow-sm text-lg ${
                            ratings[item.id] === val 
                              ? 'bg-green-600 border-green-700 text-white scale-110 shadow-green-200' 
                              : 'bg-white border-gray-200 text-gray-300 hover:border-green-400 hover:text-green-500'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-3 bg-gray-100">
        <div 
          className="h-full bg-green-600 transition-all duration-700 ease-in-out"
          style={{ width: `${(step / questions.length) * 100}%` }}
        />
      </div>

      <div className="pt-6 mb-12 flex justify-between items-end border-b-2 border-gray-50 pb-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Anket Formu</h2>
          <p className="text-sm font-bold text-gray-400 mt-1">Yoğunluk puanınızı seçmek için ilgili rakama tıklayınız.</p>
        </div>
      </div>

      <div className="min-h-[500px]">
        {renderStep()}
      </div>

      <div className="mt-16 flex items-center justify-between pt-10 border-t-2 border-gray-100">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-400 font-black uppercase text-sm hover:text-red-500 transition-all px-6 py-4 rounded-2xl hover:bg-red-50"
        >
          <i className="fas fa-arrow-left"></i>
          <span>{step === 0 ? 'İptal Et' : 'Geri Dön'}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!isStepComplete()}
          className={`px-12 py-5 rounded-2xl font-black text-xl flex items-center space-x-4 transition-all transform shadow-2xl active:scale-95 ${
            isStepComplete() 
              ? 'bg-green-600 text-white hover:bg-green-700 hover:-translate-y-1' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>{step === questions.length ? 'KAYDET VE BİTİR' : 'SONRAKİ ADIM'}</span>
          <i className={`fas ${step === questions.length ? 'fa-save' : 'fa-chevron-right'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default SurveyForm;
