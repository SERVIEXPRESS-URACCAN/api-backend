export function formatPhone(cellphone: string): string {
  if (!cellphone) return cellphone;

  const clean = cellphone.trim();

  if (clean.startsWith('+505')) return clean;

  return `+505${clean}`;
}
