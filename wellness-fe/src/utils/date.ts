export function toLocalDateId(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function toMonthDayLabel(dateId: string | null | undefined, fallback = '선택한 날짜') {
  if (!dateId || !/^\d{4}-\d{2}-\d{2}$/.test(dateId)) return fallback;
  const [, month, day] = dateId.split('-').map(Number);
  return `${month}월 ${day}일`;
}

export function toCurrentKoreanDateLabel(date = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date);
}
