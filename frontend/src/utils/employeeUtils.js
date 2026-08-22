export const getEmployeeInitials = (firstName = '', lastName = '') => {
  const f = firstName.trim()[0] || '';
  const l = lastName.trim()[0] || '';
  return (f + l).toUpperCase() || 'EMP';
};

export const getAvatarUrl = (firstName = '', lastName = '') => {
  const name = encodeURIComponent(`${firstName} ${lastName}`.trim() || 'Employee');
  return `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff`;
};

export const formatEmpCode = (code = '') => {
  return code ? code.toUpperCase() : 'EMP---';
};
