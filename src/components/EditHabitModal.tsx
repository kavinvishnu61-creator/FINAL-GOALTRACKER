import React, { useState, useEffect } from 'react';
import { Habit, Goal, HabitFrequency } from '../types';
import { X, Check, Flame, AlertCircle, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface EditHabitModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Habit>) => void;
  onDelete?: (id: string) => void;
  goals?: Goal[];
}

const COLOR_OPTIONS = [
  '#6366f1', // Indigo
  '#22c55e', // Emerald
  '#f97316', // Orange
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#eab308', // Yellow
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#3b82f6', // Blue
];

const DAYS_OF_WEEK = [
  { day: 1, label: 'M' },
  { day: 2, label: 'T' },
  { day: 3, label: 'W' },
  { day: 4, label: 'T' },
  { day: 5, label: 'F' },
  { day: 6, label: 'S' },
  { day: 0, label: 'S' },
];

export function EditHabitModal({ habit, isOpen, onClose, onSave, goals = [] }: EditHabitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState('times');
  const [goalId, setGoalId] = useState<string>('');
  const [schedule, setSchedule] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [color, setColor] = useState('#6366f1');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (habit) {
      setName(habit.name || '');
      setDescription(habit.description || '');
      setFrequency(habit.frequency || 'daily');
      setTarget(habit.target || 1);
      setUnit(habit.unit || 'times');
      setGoalId(habit.goalId || '');
      setSchedule(habit.schedule && habit.schedule.length > 0 ? habit.schedule : [0, 1, 2, 3, 4, 5, 6]);
      setColor(habit.color || '#6366f1');
      setError('');
    }
  }, [habit, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !habit) return null;

  const toggleDay = (day: number) => {
    if (schedule.includes(day)) {
      if (schedule.length > 1) {
        setSchedule(schedule.filter(d => d !== day));
      }
    } else {
      setSchedule([...schedule, day].sort());
    }
  };

  const handleFrequencyChange = (newFreq: HabitFrequency) => {
    setFrequency(newFreq);
    if (newFreq === 'daily') {
      setSchedule([0, 1, 2, 3, 4, 5, 6]);
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setError('Habit name is required');
      return;
    }

    onSave(habit.id, {
      name: name.trim(),
      description: description.trim(),
      frequency,
      target: Math.max(1, target),
      unit: unit.trim() || 'times',
      goalId: goalId ? goalId : undefined,
      schedule,
      color,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#181a24] rounded-2xl border border-[#e5e7eb] dark:border-[#1e2030] shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb] dark:border-[#1e2030]">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full transition-colors shadow-sm"
              style={{ backgroundColor: color }}
            />
            <div>
              <h2 className="text-base font-bold tracking-tight text-[#111827] dark:text-[#f3f4f6]">
                Edit Habit
              </h2>
              <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
                Adjust habit targets, schedule, and link to goals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#4b5563] dark:hover:text-[#e5e7eb] hover:bg-[#f3f4f6] dark:hover:bg-[#252836] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto px-6 py-5 space-y-4 text-sm flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">
              Habit Name <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Read 15 pages, Morning Run, Daily Meditation"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#12141c] text-[#111827] dark:text-[#f3f4f6] placeholder-[#9ca3af] text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
          </div>

          {/* Description / Cue */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">
              Habit Cue / Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Right after pouring morning coffee"
              className="w-full px-3.5 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#12141c] text-[#111827] dark:text-[#f3f4f6] placeholder-[#9ca3af] text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
          </div>

          {/* Frequency & Target & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => handleFrequencyChange(e.target.value as HabitFrequency)}
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#12141c] text-[#111827] dark:text-[#f3f4f6] text-xs outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">
                Target
              </label>
              <input
                type="number"
                min="1"
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#12141c] text-[#111827] dark:text-[#f3f4f6] text-xs outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="times, mins, pages"
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#12141c] text-[#111827] dark:text-[#f3f4f6] text-xs outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Schedule days toggle (if custom or weekly) */}
          {frequency !== 'daily' && (
            <div>
              <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">
                Active Days
              </label>
              <div className="flex items-center gap-1.5">
                {DAYS_OF_WEEK.map(({ day, label }, idx) => {
                  const isSelected = schedule.includes(day);
                  return (
                    <button
                      type="button"
                      key={`${day}-${idx}`}
                      onClick={() => toggleDay(day)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-[#f3f4f6] dark:bg-[#252836] text-[#6b7280] dark:text-[#9ca3af] hover:bg-[#e5e7eb] dark:hover:bg-[#2d3044]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Linked Goal */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">
              Linked Goal (Optional)
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#12141c] text-[#111827] dark:text-[#f3f4f6] text-xs outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">None (Standalone Habit)</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          {/* Color theme */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    color === c
                      ? 'ring-2 ring-offset-2 ring-indigo-500 ring-offset-white dark:ring-offset-[#181a24] scale-110'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f9fafb] dark:bg-[#151720] border-t border-[#e5e7eb] dark:border-[#1e2030]">
          {onDelete ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Habit
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#6b7280] dark:text-[#9ca3af] hover:text-[#111827] dark:hover:text-white hover:bg-[#e5e7eb]/50 dark:hover:bg-[#252836] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {onDelete && (
        <ConfirmDeleteModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            onDelete(habit.id);
            onClose();
          }}
          title="Delete Habit"
          itemName={habit.name}
          message="Are you sure you want to delete this habit? All recorded streaks and completion history for this habit will be permanently deleted."
        />
      )}
    </div>
  );
}
