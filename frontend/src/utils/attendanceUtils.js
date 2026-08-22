export const formatWorkHours = (decimalHours = 0) => {
  const hrs = Math.floor(decimalHours);
  const mins = Math.round((decimalHours - hrs) * 60);
  if (hrs === 0 && mins === 0) return '0h 0m';
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

export const getAttendanceStatusBadgeClass = (status = 'Present') => {
  switch (status) {
    case 'Present':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'On Leave':
    case 'Leave':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Half Day':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-rose-100 text-rose-800 border-rose-200';
  }
};
