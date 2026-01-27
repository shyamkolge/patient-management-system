export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

export const formatName = (user) => {
  if (!user) return '—';
  const first = user.firstName || '';
  const last = user.lastName || '';
  return `${first} ${last}`.trim() || '—';
};
