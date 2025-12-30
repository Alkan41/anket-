
import React, { useState, useEffect } from 'react';
import { AppData, ViewState, SurveyResponse } from './types';
import { INITIAL_DATA } from './constants';
import WelcomeView from './components/WelcomeView';
import SurveyForm from './components/SurveyForm';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import SurveyCompleted from './components/SurveyCompleted';
import { CloudService } from './komut';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('survey_app_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [view, setView] = useState<ViewState>('WELCOME');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Uygulama açıldığında Google E-Tablo'dan verileri çek
  useEffect(() => {
    const syncWithCloud = async () => {
      const cloudData = await CloudService.fetchData();
      if (cloudData) {
        setData(prev => {
          const updated = { ...prev };
          if (cloudData.personnel) updated.personnel = cloudData.personnel;
          
          // Config (Welcome Text) eşitleme
          const welcomeConfig = cloudData.config.find((c: any) => c.Key === 'welcomeText');
          if (welcomeConfig) updated.welcomeText = welcomeConfig.Value;

          // Responses eşitleme (Parse JSON score)
          if (cloudData.responses) {
            updated.responses = cloudData.responses.map((r: any) => ({
              id: r.ID,
              timestamp: r.Timestamp,
              personnelName: r.PersonnelName,
              totalScore: parseInt(r.TotalScore),
              scores: JSON.parse(r.ScoresJSON)
            }));
          }

          // Weights eşitleme
          if (cloudData.weights && cloudData.weights.length > 0) {
            updated.questions = prev.questions.map(q => ({
              ...q,
              sections: q.sections.map(s => {
                const cloudW = cloudData.weights.find((w: any) => w.SectionID === s.id);
                return cloudW ? { ...s, sectionWeight: parseInt(cloudW.Weight) } : s;
              })
            }));
          }

          return updated;
        });
      }
      // Splash screen'i kapat
      setTimeout(() => setIsLoading(false), 3000);
    };

    syncWithCloud();
  }, []);

  // Yerel veriyi her değişimde kaydet (Yedek olarak)
  useEffect(() => {
    localStorage.setItem('survey_app_data', JSON.stringify(data));
  }, [data]);

  const handleStartSurvey = () => {
    setView('SURVEY');
  };

  const handleSaveResponse = async (response: SurveyResponse) => {
    setData(prev => ({
      ...prev,
      responses: [...prev.responses, response]
    }));
    // Cloud'a gönder
    await CloudService.saveResponse(response);
    setView('COMPLETED');
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setView('ADMIN');
  };

  const updateAppData = async (newData: Partial<AppData>) => {
    setData(prev => {
      const updated = { ...prev, ...newData };
      
      // Hangi alanın değiştiğine göre Cloud'u güncelle
      if (newData.personnel) {
        CloudService.updatePersonnel(newData.personnel);
      }
      if (newData.welcomeText) {
        CloudService.updateConfig(newData.welcomeText);
      }
      if (newData.questions) {
        const weights = newData.questions.flatMap(q => 
          q.sections.map(s => ({ sectionId: s.id, weight: s.sectionWeight }))
        );
        CloudService.updateWeights(weights);
      }

      return updated;
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999] animate-fadeIn">
        <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white rounded-full shadow-[0_0_100px_rgba(0,0,0,0.1)] border border-gray-50 flex items-center justify-center overflow-hidden mb-8 transform transition-transform duration-1000">
          <img 
            src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGZ0d3Rma3JncDZ6c2lxYnF6OGcwMGpwaTJ2YzdmYXdnNTFheG9naCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/1rrxPs1nb3IjwmbiXw/giphy.gif" 
            alt="Yükleniyor..."
            className="w-56 h-56 md:w-72 md:h-72 object-contain scale-125"
          />
        </div>
        <div className="text-center space-y-2">
          <p className="text-green-700 font-black text-2xl md:text-3xl tracking-[0.3em] uppercase animate-pulse">
            Senkronize Ediliyor...
          </p>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest opacity-60">
            Veriler Google E-Tablodan Çekiliyor
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 pb-10">
      <nav className="bg-green-700 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold flex items-center cursor-pointer" onClick={() => setView('WELCOME')}>
          <i className="fas fa-poll-h mr-2"></i>
          Kurumsal Anket Portalı
        </h1>
        <div className="space-x-4">
          <button onClick={() => setView('WELCOME')} className="hover:text-green-200 transition-colors font-medium">Ana Sayfa</button>
          <button onClick={() => isAdminAuthenticated ? setView('ADMIN') : setView('ADMIN_LOGIN')} className="bg-green-800 px-4 py-1.5 rounded-lg hover:bg-green-900 transition-colors font-bold shadow-sm">Admin Paneli</button>
        </div>
      </nav>

      <main className="container mx-auto mt-8 px-4 max-w-4xl">
        {view === 'WELCOME' && <WelcomeView text={data.welcomeText} onStart={handleStartSurvey} />}
        {view === 'SURVEY' && <SurveyForm questions={data.questions} personnel={data.personnel} onSave={handleSaveResponse} onCancel={() => setView('WELCOME')} />}
        {view === 'ADMIN_LOGIN' && <AdminLogin onLoginSuccess={handleAdminLoginSuccess} onCancel={() => setView('WELCOME')} />}
        {view === 'ADMIN' && isAdminAuthenticated && <AdminPanel data={data} updateData={updateAppData} onLogout={() => { setIsAdminAuthenticated(false); setView('WELCOME'); }} />}
        {view === 'COMPLETED' && <SurveyCompleted />}
      </main>
    </div>
  );
};

export default App;
