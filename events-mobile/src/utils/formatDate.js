export function formatDate(isoDate) {
  if (!isoDate) return 'Date non définie';

  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return 'Date invalide';

  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return date.toLocaleDateString('fr-FR', options);
}

export function formatPrice(price) {
  const num = parseFloat(price);
  if (isNaN(num) || num === 0) return 'Gratuit';
  return `${num.toFixed(2).replace('.', ',')} €`;
}
