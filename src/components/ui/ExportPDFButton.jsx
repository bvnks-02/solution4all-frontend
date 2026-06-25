// FILE: solution4all-frontend/src/components/ui/ExportPDFButton.jsx
import { FileDown } from 'lucide-react';
import { usePDFExport } from '../../hooks/usePDFExport';
import Button from './Button';
import Spinner from './Spinner';

export default function ExportPDFButton({ reportType, dateRange = 'all', label = 'Exporter PDF', size = 'sm' }) {
  const { exportPDF, exporting } = usePDFExport();

  return (
    <Button
      variant="secondary"
      size={size}
      onClick={() => exportPDF(reportType, dateRange)}
      disabled={exporting}
    >
      {exporting ? (
        <>
          <Spinner size="sm" className="mr-1" />
          Génération…
        </>
      ) : (
        <>
          <FileDown size={15} />
          {label}
        </>
      )}
    </Button>
  );
}
