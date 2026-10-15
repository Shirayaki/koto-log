import React, { useState } from 'react';
import './TagInput.css';

export default function TagInput({ tags, onChange }) {
  const [val, setVal] = useState('');
  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = val.trim();
      if (v && !tags.includes(v)) onChange([...tags, v]);
      setVal('');
    }
  };
  const remove = (t) => onChange(tags.filter(x => x !== t));
  return (
    <div className="tag-input-wrap">
      {tags.map(t => (
        <span key={t} className="tag-chip" onClick={() => remove(t)}>{t} <i className="ti ti-x" /></span>
      ))}
      <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={handleKey} placeholder="タグを追加… (Enter)" />
    </div>
  );
}
