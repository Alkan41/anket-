
/**
 * Google Apps Script Web App URL'niz.
 */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxaD2pCO5hy1TW0E4-iWdfkICMIcRmCtlOsL6dHmvnvYY2VwPnGtYqfXaHnV1G6R9R_/exec";

export const CloudService = {
  /**
   * Tüm verileri Google E-Tablo'dan çeker.
   */
  async fetchData() {
    if (SCRIPT_URL.includes("YOUR_SCRIPT_URL")) return null;
    try {
      const response = await fetch(SCRIPT_URL);
      return await response.json();
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      return null;
    }
  },

  /**
   * Yeni anket cevabını kaydeder.
   */
  async saveResponse(responseData) {
    return this.post({ action: "addResponse", data: responseData });
  },

  /**
   * Personel listesini günceller.
   */
  async updatePersonnel(personnelList) {
    return this.post({ action: "updatePersonnel", data: personnelList });
  },

  /**
   * Giriş metnini günceller.
   */
  async updateConfig(welcomeText) {
    return this.post({ action: "updateConfig", data: { welcomeText } });
  },

  /**
   * Katsayıları günceller.
   */
  async updateWeights(weights) {
    return this.post({ action: "updateWeights", data: weights });
  },

  async post(payload) {
    if (SCRIPT_URL.includes("YOUR_SCRIPT_URL")) return;
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("Veri gönderme hatası:", error);
    }
  }
};
