export interface PaginatedResult<T> {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  data: T[];
}

function hasKey<T>(obj: unknown, key: keyof any): obj is T {
  return typeof obj === 'object' && obj !== null && key in obj;
}

export function filterAndSortPaginated<T>(
  items: T[],
  searchTerm: string,
  searchableFields: (keyof T)[],
  order: keyof T,
  reverse: boolean,
  currentPage: number,
  pageSize: number
): PaginatedResult<T> {
  let filtered = [...items];

  // --- Filtrado ---
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(item =>
      searchableFields.some((field) => {
        if (hasKey<T>(item, field)) {
          const rawValue = item[field];
          const value = String(rawValue ?? '').toLowerCase();
          return value.includes(term);
        }
        return false; // Si no tiene la propiedad, no hacer nada
      })
    );
  }

  // --- Ordenamiento ---
  filtered.sort((a, b) => {
    if (hasKey<T>(a, order) && hasKey<T>(b, order)) {
      const aVal = a[order];
      const bVal = b[order];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return reverse ? bVal - aVal : aVal - bVal;
      }

      const aStr = String(aVal ?? '').toLowerCase();
      const bStr = String(bVal ?? '').toLowerCase();

      if (aStr < bStr) return reverse ? 1 : -1;
      if (aStr > bStr) return reverse ? -1 : 1;
      return 0;
    }
    return 0;
  });

  // --- Paginación ---
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.max(1, Math.min(currentPage, totalPages));

  const start = (validPage - 1) * pageSize;
  const end = start + pageSize;

  const paginatedData = filtered.slice(start, end);

  return {
    totalItems,
    totalPages,
    currentPage: validPage,
    pageSize,
    data: paginatedData
  };
}



// export function filterAndSortPaginated<T>(
//   items: T[],
//   searchTerm: string,
//   searchableFields: (keyof T)[],
//   order: keyof T,
//   reverse: boolean,
//   currentPage: number,
//   pageSize: number
// ): PaginatedResult<T> {
//   let filtered = [...items];

//   // --- Filtrado ---
//   if (searchTerm.trim()) {
//     const term = searchTerm.toLowerCase();
//     filtered = filtered.filter(item =>
//       searchableFields.some(field => {
//         const rawValue = item[field];
//         const value = String(rawValue ?? '').toLowerCase();
//         return value.includes(term);
//       })
//     );
//   }

//   // --- Ordenamiento ---
//   filtered.sort((a, b) => {
//     const aVal = a[order];
//     const bVal = b[order];

//     if (typeof aVal === 'number' && typeof bVal === 'number') {
//       return reverse ? bVal - aVal : aVal - bVal;
//     }

//     const aStr = String(aVal ?? '').toLowerCase();
//     const bStr = String(bVal ?? '').toLowerCase();

//     if (aStr < bStr) return reverse ? 1 : -1;
//     if (aStr > bStr) return reverse ? -1 : 1;
//     return 0;
//   });

//   // --- Paginación ---
//   const totalItems = filtered.length;
//   const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
//   const validPage = Math.max(1, Math.min(currentPage, totalPages));

//   const start = (validPage - 1) * pageSize;
//   const end = start + pageSize;

//   const paginatedData = filtered.slice(start, end);

//   return {
//     totalItems,
//     totalPages,
//     currentPage: validPage,
//     pageSize,
//     data: paginatedData
//   };
// }
