
import { AppData, Question } from './types';

const AIRCRAFTS = [
  { label: "T-70", id_suffix: "t70" },
  { label: "AT-802A", id_suffix: "at802a" },
  { label: "BELL 429", id_suffix: "bell429" },
  { label: "B-360", id_suffix: "b360" },
  { label: "C-650", id_suffix: "c650" }
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Hava araçlarımızın bakımlarında uçuş teknisyenlerimizin iş yoğunluğu ağırlığı nedir?",
    sections: [
      { id: "1a", label: "a", title: "Periyodik Bakım", sectionWeight: 15, items: AIRCRAFTS.map(a => ({ id: `1a_${a.id_suffix}`, label: a.label })) },
      { id: "1b", label: "b", title: "Günlük Bakım", sectionWeight: 5, items: AIRCRAFTS.map(a => ({ id: `1b_${a.id_suffix}`, label: a.label })) },
      { id: "1c", label: "c", title: "Arızacılık Uygulamaları ve Sıklığı", sectionWeight: 5, items: AIRCRAFTS.map(a => ({ id: `1c_${a.id_suffix}`, label: a.label })) },
      { id: "1ç", label: "ç", title: "TB Yayınlanma ve Uygulama Sıklığı", sectionWeight: 5, items: AIRCRAFTS.map(a => ({ id: `1ç_${a.id_suffix}`, label: a.label })) }
    ]
  },
  {
    id: 2,
    text: "Personelin uçuş faaliyetlerinin hazırlık ve icrasına katılım yoğunluğu nedir?",
    sections: [
      { id: "2a", label: "a", title: "Yangın Söndürme Operasyonları", sectionWeight: 10, items: AIRCRAFTS.map(a => ({ id: `2a_${a.id_suffix}`, label: a.label })) },
      { id: "2b", label: "b", title: "VIP Komuta Kontrol Uçuşları", sectionWeight: 5, items: AIRCRAFTS.map(a => ({ id: `2b_${a.id_suffix}`, label: a.label })) },
      { id: "2c", label: "c", title: "Bilfiil Uçuşa Katılım Durumu", sectionWeight: 5, items: AIRCRAFTS.map(a => ({ id: `2c_${a.id_suffix}`, label: a.label })) },
      { id: "2ç", label: "ç", title: "Uçuş Öncesi ve Sonrası Faaliyetler", sectionWeight: 5, items: AIRCRAFTS.map(a => ({ id: `2ç_${a.id_suffix}`, label: a.label })) }
    ]
  },
  {
    id: 3,
    text: "Personelin ikamet ettiği yeri dışında görev yapma yoğunluğu nedir?",
    sections: [
      { id: "3a", label: "a", title: "Yaz Dönemi", sectionWeight: 15, items: AIRCRAFTS.map(a => ({ id: `3a_${a.id_suffix}`, label: a.label })) },
      { id: "3b", label: "b", title: "Kış Dönemi", sectionWeight: 5, items: AIRCRAFTS.map(a => ({ id: `3b_${a.id_suffix}`, label: a.label })) }
    ]
  },
  {
    id: 4,
    text: "Personelin uçuşa hazır bekleme faaliyetlerinin yoğunluğu nedir?",
    sections: [
      { id: "4a", label: "a", title: "Bekleme Faaliyetleri", sectionWeight: 10, items: AIRCRAFTS.map(a => ({ id: `4a_${a.id_suffix}`, label: a.label })) }
    ]
  },
  {
    id: 5,
    text: "Personelin idari faaliyet yoğunluğu nedir?",
    sections: [
      { id: "5a", label: "a", title: "İkmal Faaliyetleri ve Destek Teçhizatı Bakımı", sectionWeight: 8, items: AIRCRAFTS.map(a => ({ id: `5a_${a.id_suffix}`, label: a.label })) },
      { id: "5b", label: "b", title: "Sicil Takip ve Planlama", sectionWeight: 7, items: AIRCRAFTS.map(a => ({ id: `5b_${a.id_suffix}`, label: a.label })) }
    ]
  }
];

export const INITIAL_DATA: AppData = {
  welcomeText: "Uçuş Teknisyenleri İş Yoğunluğu Anketine Hoş Geldiniz.\n\nLütfen her bir kategori için ilgili hava aracına yönelik yoğunluk puanınızı 1 (En Düşük) ile 5 (En Yüksek) arasında giriniz.\n\nToplam puan 500 üzerinden değerlendirilecek ve ağırlıklı yüzdelik oranınız hesaplanacaktır.",
  questions: INITIAL_QUESTIONS,
  personnel: ["Örnek Personel 1", "Örnek Personel 2"],
  responses: []
};

export const ADMIN_PASSWORD = "1839";
