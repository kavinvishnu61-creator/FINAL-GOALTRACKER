import React, { useState, useEffect } from 'react';
import { Goal, GoalStatus, Priority } from '../types';
import { X, Check, Target, Calendar, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface EditGoalModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Goal>) => void;
  onDelete?: (id: string) => void;
}

const COLOR_OPTIONS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Amber
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

const CATEGORIES = [
  'General',
  'Career',
  'Health',
  'Learning',
  'Finance',
  'Relationships',
  'Creative',
];

export function EditGoalModal({ goal, isOpen, onClose, onSave }: EditGoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState<Priority>('P2');
  const [status, setStatus] = useState<GoalStatus>('active');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [optimizedTime, setOptimizedTime] = useState('09:00');
  const [optimizedEndTime, setOptimizedEndTime] = useState('10:00');
  const [color, setColor] = useState('#6366f1');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setReason(goal.reason || '');
      setCategory(goal.category || 'General');
      setPriority(goal.priority || 'P2');
      setStatus(goal.status || 'active');
      setStartDate(goal.startDate ? goal.startDate.slice(0, 10) : '');
      setTargetDate(goal.targetDate ? goal.targetDate.slice(0, 10) : '');
      setOptimizedTime(goal.optimizedTime || '09:00');
      setOptimizedEndTime(goal.optimizedEndTime || '10:00');
      setColor(goal.color || '#6366f1');
      setError('');
    }
  }, [goal, isOpen]);

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

  if (!isOpen || !goal) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setError('Goal title is required');
      return;
    }

    onSave(goal.id, {
      title: title.trim(),
      description: description.trim(),
      reason: reason.trim(),
      category,
      priority,
      status,
      startDate: startDate || goal.startDate,
      targetDate: targetDate || goal.targetDate,
      optimizedTime,
      optimizedEndTime,
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
        className="bg-white dark:bg-[#181a24] rounded-2xl border border-[#e5e7eb] dark:border-[#1e2030] shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col animate-slide-up overflow-hidden"
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
                Edit Goal
              </h2>
              <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
                Update details, targets, and scheduled execution
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

        {/* Scrollable Form */}
        <form onSubmit={handleSave} className="overflow-y-auto px-6 py-5 space-y-4 text-sm flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">
              Goal Title <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Master TypeScript and System Architecture"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#12141c] text-[#111827] dark:text-[#f3f4f6] placeholder-[#9ca3af] text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are the key outcomes you are driving toward?"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#12141c] text-[#111827] dark:text-[#f3f4f6] placeholder-[#9ca3af] text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors resize-none"
            />
          </div>

          {/* Core Motivation / Why */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">
              Why Does This Matter? (Core Motivation)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. To attain tech lead readiness and build impactful products"
              className="w-full px-3.5 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#12141c] text-[#111827] dark:text-[#f3f4f6] placeholder-[#9ca3af] text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
          </div>

          {/* Category, Priority, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#12141c] text-[#111827] dark:text-[#f3f4f6] text-xs outline-none focus:border-indigo-500 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#12141c] text-[#111827] dark:text-[#f3f4f6] text-xs outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="P1">P1 - Critical</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Medium</option>
                <option value="P4">P4 - Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#12141c] text-[#111827] dark:text-[#f3f4f6] text-xs outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="active">Active</option>
                <option value="planned">Planned</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Dates: From Date and To Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#6b7280]" />
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#12141c] text-[#111827] dark:text-[#f3f4f6] text-xs outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] dark:text-[#d1d5db] mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#6b7280]" />
                Target Due Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#12141c] text-[#111827] dark:text-[#f3f4f6] text-xs outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Time Window */}
          <div className="p-3.5 bg-[#f9fafb] dark:bg-[#12141c] rounded-xl border border-[#e5e7eb] dark:border-[#252836]">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-[#374151] dark:text-[#d1d5db]">
                Daily Scheduled Focus Window
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#6b7280] mb-1">From Time</label>
                <input
                  type="time"
                  value={optimizedTime}
                  onChange={(e) => setOptimizedTime(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#181a24] text-[#111827] dark:text-[#f3f4f6] text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#6b7280] mb-1">To Time</label>
                <input
                  type="time"
                  value={optimizedEndTime}
                  onChange={(e) => setOptimizedEndTime(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-white dark:bg-[#181a24] text-[#111827] dark:text-[#f3f4f6] text-xs outline-none"
                />
              </div>
            </div>
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
              Delete Goal
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
            onDelete(goal.id);
            onClose();
          }}
          title="Delete Goal"
          itemName={goal.title}
          message="Are you sure you want to delete this goal? All associated milestones, projects, tasks, and daily calendar events will be permanently removed."
        />
      )}
    </div>
  );
}
