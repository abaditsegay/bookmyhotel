import { useCallback } from 'react';

interface UseCsvExportOptions {
  filename?: string;
  headers?: string[];
}

/**
 * Custom hook for exporting data to CSV format
 * 
 * @example
 * const { exportToCsv } = useCsvExport({ filename: 'products' });
 * exportToCsv(products, ['Name', 'Price', 'Stock'], 
 *   (product) => [product.name, product.price, product.stockQuantity]
 * );
 */
export function useCsvExport(options: UseCsvExportOptions = {}) {
  const exportToCsv = useCallback(
    <T>(
      data: T[],
      headers: string[],
      rowMapper: (item: T) => (string | number | boolean | null | undefined)[]
    ) => {
      if (data.length === 0) {
        return;
      }

      // Escape CSV values (handle commas, quotes, newlines)
      const escapeCsvValue = (value: string | number | boolean | null | undefined): string => {
        if (value === null || value === undefined) {
          return '';
        }
        
        const stringValue = String(value);
        
        // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      };

      // Create CSV header row
      const headerRow = headers.map(escapeCsvValue).join(',');

      // Create CSV data rows
      const dataRows = data.map(item => {
        const values = rowMapper(item);
        return values.map(escapeCsvValue).join(',');
      });

      // Combine header and data
      const csvContent = [headerRow, ...dataRows].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const filename = options.filename 
          ? `${options.filename}_${timestamp}.csv`
          : `export_${timestamp}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    },
    [options.filename]
  );

  return { exportToCsv };
}
