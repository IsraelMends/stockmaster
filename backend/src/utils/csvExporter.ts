/**
 * Utility functions for CSV export
 */

/**
 * Converte um array de objetos para formato CSV
 */
export function convertToCSV(data: any[]): string {
  if (data.length === 0) {
    return "";
  }

  // Pegar os cabeçalhos (chaves do primeiro objeto)
  const headers = Object.keys(data[0]);
  
  // Criar linha de cabeçalho
  const headerRow = headers.join(",");
  
  // Criar linhas de dados
  const dataRows = data.map((row) => {
    return headers.map((header) => {
      const value = row[header];
      
      // Se o valor for um objeto, converter para string JSON
      if (typeof value === "object" && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      
      // Se o valor contém vírgula ou aspas, envolver em aspas
      if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      
      return value ?? "";
    }).join(",");
  });
  
  // Combinar cabeçalho e dados
  return [headerRow, ...dataRows].join("\n");
}

/**
 * Converte dados aninhados para formato CSV plano
 */
export function flattenObject(obj: any, prefix = ""): any {
  const flattened: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}_${key}` : key;
      
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        // Se for objeto, achatar recursivamente
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        // Se for valor simples ou array, manter como está
        flattened[newKey] = obj[key];
      }
    }
  }
  
  return flattened;
}
