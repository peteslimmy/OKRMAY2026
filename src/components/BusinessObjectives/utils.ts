export const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
};

export const generateCSVTemplate = (): string => {
  return [
    'quarter,year,label,title,parent_label,status',
    'Q1,2026,KR1,Grow revenue by 20%,,Green',
    'Q1,2026,KR1.1,Increase customer acquisition by 15%,KR1,Green',
    'Q1,2026,KR1.2,Launch new product line,KR1,Green',
    'Q1,2026,KR1.3,Improve customer satisfaction,KR1,Green',
    'Q1,2026,KR2,Improve operational efficiency,,Green',
    'Q1,2026,KR2.1,Automate manual processes,KR2,Green',
    'Q1,2026,KR2.2,Reduce operational costs by 10%,KR2,Green',
    'Q1,2026,KR3,Enhance customer experience,,Green',
    'Q1,2026,KR3.1,Launch customer feedback system,KR3,Green',
    'Q2,2026,KR1,Expand market reach,,Green',
    'Q2,2026,KR1.1,Enter new geographic markets,KR1,Green',
    'Q2,2026,KR1.2,Increase brand awareness,KR1,Green',
    'Q2,2026,KR2,Enhance product quality,,Green',
    'Q2,2026,KR2.1,Reduce defect rate,KR2,Green',
  ].join('\n');
};

export const downloadCSVTemplate = () => {
  const csvContent = generateCSVTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kr-template.csv';
  a.click();
  URL.revokeObjectURL(url);
};