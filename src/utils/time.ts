export const parseInterval = (val: string | null, fallback: number): number => {
  if (!val || val === 'Kapalı' || val === 'Off') return 0;
  if (val === '5s') return 5 / 60;
  if (val === '10s') return 10 / 60;
  
  const strVal = val.replace('m', '');
  const num = Number(strVal);
  return isNaN(num) ? fallback : num;
};
