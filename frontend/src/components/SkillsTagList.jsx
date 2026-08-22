import React from 'react'
import { Award } from 'lucide-react'

export const SkillsTagList = ({ skillsString = '' }) => {
  const skills = skillsString
    ? skillsString.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  if (skills.length === 0) {
    return <p className="text-xs text-slate-400 italic">No skills listed yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, idx) => (
        <span
          key={idx}
          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
        >
          <Award className="w-3 h-3 mr-1 text-indigo-500" />
          {skill}
        </span>
      ))}
    </div>
  );
};
