import { useState } from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { ArrowLeft, Plus, Target, CheckCircle2, Clock, TrendingUp, Flame, Trash2, Edit2 } from 'lucide-react';

export function GoalDetailPage() {
  const { selectedGoalId, setSelectedGoalId, goals, milestones, projects, tasks, addMilestone, addProject, addTask, updateGoal, updateMilestone, deleteGoal, toggleTaskComplete, getGoalProgress } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'projects' | 'tasks'>('overview');
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', targetDate: '' });
  const [newProject, setNewProject] = useState({ title: '', milestoneId: '' });
  const [newTask, setNewTask] = useState({ title: '', priority: 'P3' as const, estimatedDuration: 30 });

  const goal = goals.find(g => g.id === selectedGoalId);
  if (!goal) return null;

  const goalMilestones = milestones.filter(m => m.goalId === goal.id).sort((a, b) => a.order - b.order);
  const goalProjects = projects.filter(p => p.goalId === goal.id);
  const goalTasks = tasks.filter(t => t.goalId === goal.id);
  const progress = getGoalProgress(goal.id);

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Back */}
      <button
        onClick={() => setSelectedGoalId(null)}
        className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#1f2937] dark:hover:text-[#e5e7eb] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Goals
      </button>

      {/* Goal Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: goal.color }} />
            <h1 className="text-2xl font-bold tracking-tight">{goal.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newStatus = goal.status === 'active' ? 'paused' : 'active';
                updateGoal(goal.id, { status: newStatus });
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] hover:bg-[#f9fafb] dark:hover:bg-[#1a1d2e]"
            >
              {goal.status === 'active' ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={() => { deleteGoal(goal.id); setSelectedGoalId(null); }}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        {goal.description && <p className="text-sm text-[#6b7280] mt-2 ml-7">{goal.description}</p>}
        {goal.reason && <p className="text-xs text-[#9ca3af] mt-1 ml-7 italic">"{goal.reason}"</p>}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
          <p className="text-[11px] text-[#6b7280] mb-1">Progress</p>
          <p className="text-2xl font-bold" style={{ color: goal.color }}>{progress}%</p>
          <div className="w-full h-1.5 rounded-full bg-[#f3f4f6] dark:bg-[#252836] mt-2 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: goal.color }} />
          </div>
        </div>
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
          <p className="text-[11px] text-[#6b7280] mb-1">Milestones</p>
          <p className="text-2xl font-bold">{goalMilestones.filter(m => m.status === 'completed').length}/{goalMilestones.length}</p>
        </div>
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
          <p className="text-[11px] text-[#6b7280] mb-1">Tasks Done</p>
          <p className="text-2xl font-bold">{goalTasks.filter(t => t.status === 'completed').length}/{goalTasks.length}</p>
        </div>
        <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
          <p className="text-[11px] text-[#6b7280] mb-1">Target Date</p>
          <p className="text-lg font-bold">{format(new Date(goal.targetDate), 'MMM d, yyyy')}</p>
        </div>
      </div>

      {/* Milestone Timeline */}
      {goalMilestones.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Milestones</h3>
          </div>
          <div className="relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#e5e7eb] dark:bg-[#2d3044]" />
            <div className="flex items-start justify-between relative">
              {goalMilestones.map((ms, i) => (
                <div key={ms.id} className="flex flex-col items-center z-10 flex-1">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    ms.status === 'completed' ? 'border-emerald-500 bg-emerald-500 text-white' :
                    ms.status === 'in_progress' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20' :
                    'border-[#d1d5db] dark:border-[#4b5563] bg-white dark:bg-[#181a24]'
                  }`}>
                    {ms.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                  </div>
                  <p className="text-[11px] font-medium mt-2 text-center max-w-[100px] truncate">{ms.title}</p>
                  <p className="text-[10px] text-[#9ca3af]">{format(new Date(ms.targetDate), 'MMM d')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-[#f3f4f6] dark:bg-[#1a1d2e] rounded-lg w-fit">
        {(['overview', 'milestones', 'projects', 'tasks'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === tab ? 'bg-white dark:bg-[#252836] shadow-sm' : 'text-[#6b7280] hover:text-[#4b5563]'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'milestones' && (
        <div className="space-y-3">
          {showAddMilestone && (
            <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
              <input
                autoFocus
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                placeholder="Milestone title"
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none mb-2"
              />
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={newMilestone.targetDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none"
                />
                <button onClick={() => { addMilestone({ ...newMilestone, goalId: goal.id }); setNewMilestone({ title: '', targetDate: '' }); setShowAddMilestone(false); }} className="px-3 py-2 rounded-lg bg-indigo-500 text-white text-sm">Add</button>
                <button onClick={() => setShowAddMilestone(false)} className="text-sm text-[#9ca3af]">Cancel</button>
              </div>
            </div>
          )}
          {goalMilestones.map((ms) => (
            <div key={ms.id} className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateMilestone(ms.id, { status: ms.status === 'completed' ? 'pending' : 'completed' })}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    ms.status === 'completed' ? 'border-emerald-500 bg-emerald-500' : 'border-[#d1d5db] dark:border-[#4b5563]'
                  }`}
                >
                  {ms.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
                <div>
                  <p className={`text-sm font-medium ${ms.status === 'completed' ? 'line-through text-[#9ca3af]' : ''}`}>{ms.title}</p>
                  <p className="text-[11px] text-[#9ca3af]">Due {format(new Date(ms.targetDate), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                ms.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                ms.status === 'in_progress' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400' :
                'bg-[#f3f4f6] dark:bg-[#252836] text-[#6b7280]'
              }`}>{ms.status}</span>
            </div>
          ))}
          <button onClick={() => setShowAddMilestone(true)} className="w-full py-3 rounded-xl border border-dashed border-[#d1d5db] dark:border-[#2d3044] text-sm text-[#6b7280] hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Milestone
          </button>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-3">
          {showAddProject && (
            <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
              <input
                autoFocus
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                placeholder="Project title"
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none mb-2"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newProject.milestoneId}
                  onChange={(e) => setNewProject({ ...newProject, milestoneId: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none"
                >
                  <option value="">No milestone</option>
                  {goalMilestones.map(ms => <option key={ms.id} value={ms.id}>{ms.title}</option>)}
                </select>
                <button onClick={() => { addProject({ ...newProject, goalId: goal.id }); setNewProject({ title: '', milestoneId: '' }); setShowAddProject(false); }} className="px-3 py-2 rounded-lg bg-indigo-500 text-white text-sm">Add</button>
                <button onClick={() => setShowAddProject(false)} className="text-sm text-[#9ca3af]">Cancel</button>
              </div>
            </div>
          )}
          {goalProjects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{project.title}</p>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  project.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                  project.status === 'completed' ? 'bg-[#f3f4f6] dark:bg-[#252836] text-[#6b7280]' :
                  'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                }`}>{project.status}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#f3f4f6] dark:bg-[#252836] overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          ))}
          <button onClick={() => setShowAddProject(true)} className="w-full py-3 rounded-xl border border-dashed border-[#d1d5db] dark:border-[#2d3044] text-sm text-[#6b7280] hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-2">
          {showAddTask && (
            <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-4">
              <input
                autoFocus
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
                className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none mb-2"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  className="px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none"
                >
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                  <option value="P4">P4</option>
                </select>
                <input
                  type="number"
                  value={newTask.estimatedDuration}
                  onChange={(e) => setNewTask({ ...newTask, estimatedDuration: parseInt(e.target.value) })}
                  placeholder="Est. minutes"
                  className="px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#2d3044] bg-transparent text-sm outline-none w-24"
                />
                <button onClick={() => { addTask({ ...newTask, goalId: goal.id }); setNewTask({ title: '', priority: 'P3', estimatedDuration: 30 }); setShowAddTask(false); }} className="px-3 py-2 rounded-lg bg-indigo-500 text-white text-sm">Add</button>
                <button onClick={() => setShowAddTask(false)} className="text-sm text-[#9ca3af]">Cancel</button>
              </div>
            </div>
          )}
          {goalTasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-[#181a24] rounded-lg border border-[#e5e7eb] dark:border-[#1e2030] px-4 py-3 flex items-center gap-3 group">
              <button
                onClick={() => toggleTaskComplete(task.id)}
                className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 ${
                  task.status === 'completed' ? 'border-emerald-500 bg-emerald-500' : 'border-[#d1d5db] dark:border-[#4b5563] hover:border-indigo-500'
                }`}
              >
                {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
              </button>
              <p className={`text-sm flex-1 ${task.status === 'completed' ? 'line-through text-[#9ca3af]' : ''}`}>{task.title}</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                task.priority === 'P1' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
                task.priority === 'P2' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                'bg-[#f3f4f6] dark:bg-[#252836] text-[#6b7280]'
              }`}>{task.priority}</span>
              {task.estimatedDuration && <span className="text-[11px] text-[#9ca3af]">{task.estimatedDuration}m</span>}
            </div>
          ))}
          <button onClick={() => setShowAddTask(true)} className="w-full py-3 rounded-xl border border-dashed border-[#d1d5db] dark:border-[#2d3044] text-sm text-[#6b7280] hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-5">
            <h3 className="text-sm font-semibold mb-3">Goal Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-[#6b7280]">Category:</span> <span className="ml-2">{goal.category}</span></div>
              <div><span className="text-[#6b7280]">Priority:</span> <span className="ml-2">{goal.priority}</span></div>
              <div><span className="text-[#6b7280]">Start:</span> <span className="ml-2">{format(new Date(goal.startDate), 'MMM d, yyyy')}</span></div>
              <div><span className="text-[#6b7280]">Target:</span> <span className="ml-2">{format(new Date(goal.targetDate), 'MMM d, yyyy')}</span></div>
              <div><span className="text-[#6b7280]">Status:</span> <span className="ml-2 capitalize">{goal.status}</span></div>
              <div><span className="text-[#6b7280]">Progress Type:</span> <span className="ml-2 capitalize">{goal.progressType.replace('_', ' ')}</span></div>
            </div>
          </div>
          {goalMilestones.length > 0 && (
            <div className="bg-white dark:bg-[#181a24] rounded-xl border border-[#e5e7eb] dark:border-[#1e2030] p-5">
              <h3 className="text-sm font-semibold mb-3">Milestone Progress</h3>
              <div className="space-y-2">
                {goalMilestones.map(ms => (
                  <div key={ms.id} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${ms.status === 'completed' ? 'bg-emerald-500' : ms.status === 'in_progress' ? 'bg-indigo-500' : 'bg-[#d1d5db]'}`} />
                    <span className="text-sm flex-1">{ms.title}</span>
                    <span className="text-xs text-[#9ca3af]">{format(new Date(ms.targetDate), 'MMM d')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
