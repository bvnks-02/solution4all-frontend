// FILE: solution4all-frontend/src/hooks/usePDFExport.js
import { useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/ToastContainer';

export function usePDFExport() {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportPDF = async (reportType, dateRange = 'all') => {
    setExporting(true);
    try {
      const response = await api.post(
        '/reports/export',
        { report_type: reportType, date_range: dateRange },
        { responseType: 'blob', timeout: 30000 }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_${reportType}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast('Rapport PDF téléchargé', 'success');
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.response?.status === 408) {
        toast('Délai dépassé. Réessayez avec une plage plus courte.', 'error');
      } else {
        toast('Erreur lors de la génération du PDF', 'error');
      }
    } finally {
      setExporting(false);
    }
  };

  return { exportPDF, exporting };
}
