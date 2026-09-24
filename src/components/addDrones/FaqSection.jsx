'use client';

import { Plus, Trash2 } from 'lucide-react';

export default function FaqSection({ faqs = [], onChange }) {
  const addFaq = () => onChange([...faqs, { question: '', answer: '' }]);
  
  const removeFaq = (idx) => onChange(faqs.filter((_, i) => i !== idx));

  const updateFaq = (idx, field, val) => {
    const updated = [...faqs];
    updated[idx][field] = val;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Question & Answers (FAQs)</h2>
        <button
          onClick={addFaq}
          type="button"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add Question
        </button>
      </div>

      {faqs.map((faq, idx) => (
        <div key={idx} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Question #{idx + 1}</span>
            <button onClick={() => removeFaq(idx)} type="button" className="text-slate-400 hover:text-rose-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Question (e.g. What is the maximum flight time?)"
            value={faq.question}
            onChange={(e) => updateFaq(idx, 'question', e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-none"
          />
          <textarea
            rows={2}
            placeholder="Answer details..."
            value={faq.answer}
            onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-none"
          />
        </div>
      ))}
    </div>
  );
}