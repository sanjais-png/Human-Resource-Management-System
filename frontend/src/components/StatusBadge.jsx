import React from 'react'

export const StatusBadge = ({ status = 'Present' }) => {
  let colorStyle = 'bg-slate-100 text-slate-800 border-slate-200';

  if (status === 'Present') {
    colorStyle = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  } else if (status === 'On Leave' || status === 'Leave') {
    colorStyle = 'bg-amber-100 text-amber-800 border-amber-200';
  } else if (status === 'Absent') {
    colorStyle = 'bg-rose-100 text-rose-800 border-rose-200';
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorStyle}`}>
      {status}
    </span>
  );
};
