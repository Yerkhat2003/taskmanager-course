function TaskItem({ task, onArchiveTask, onEdit, onDuplicate, boards = [], darkMode = false }) {
  const { t } = useTranslation();

  const getStatusClasses = (status) => {
    if (status === t('tasks.toDo') || status === "К выполнению") return "bg-blue-100 text-blue-800";
    if (status === t('tasks.inProgress') || status === "В процессе") return "bg-yellow-100 text-yellow-800";
    if (status === t('tasks.done') || status === "Выполнено") return "bg-green-100 text-green-800";
    return "bg-blue-100 text-blue-800";
  };

  const getPriorityClasses = (priority) => {
    if (priority === t('tasks.high') || priority === "Высокий") return "bg-red-100 text-red-800";
    if (priority === t('tasks.medium') || priority === "Средний") return "bg-yellow-100 text-yellow-800";
    if (priority === t('tasks.low') || priority === "Низкий") return "bg-indigo-100 text-indigo-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const board = boards.find((b) => b.id === task.boardId);
  const boardTitle = board ? board.title : t('tasks.noBoard');
  const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== t('tasks.done') && task.status !== "Выполнено";

  return (
    <div className={`p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
      darkMode ? "bg-gray-800" : "bg-white"
    } ${overdue ? "border-l-4 border-red-500" : ""}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className={`text-base sm:text-lg font-semibold m-0 flex-1 truncate ${darkMode ? "text-gray-100" : "text-gray-800"}`} title={task.title}>
          {task.title}
        </h3>
        <div className="flex items-center gap-2">
          {overdue && (
            <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-300" title={t('tasks.overdue')}>
              ⚠ {t('tasks.overdue')}
            </span>
          )}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase whitespace-nowrap ${getStatusClasses(
              task.status
            )}`}
          >
            {task.status === t('tasks.toDo') || task.status === "К выполнению" ? t('tasks.toDo') :
             task.status === t('tasks.inProgress') || task.status === "В процессе" ? t('tasks.inProgress') :
             task.status === t('tasks.done') || task.status === "Выполнено" ? t('tasks.done') : task.status}
          </span>
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="text-indigo-500 hover:text-indigo-600 text-lg transition-colors"
              title={t('common.edit')}
              aria-label={t('common.edit')}
            >
              ✏️
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(task)}
              className="text-blue-500 hover:text-blue-600 text-lg transition-colors"
              title={t('common.duplicate')}
              aria-label={t('common.duplicate')}
            >
              📋
            </button>
          )}
          {onArchiveTask && (
            <button
              onClick={() => onArchiveTask(task.id)}
              className={`${darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"} text-xl font-bold transition-colors`}
              title={t('common.archive')}
              aria-label={t('common.archive')}
            >
              ×
            </button>
          )}
        </div>
      </div>
      <p className={`text-sm leading-relaxed mb-3 line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`} title={task.description}>
        {task.description}
      </p>
      <div className={`flex flex-col gap-2 mt-3 pt-3 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        <div className="flex justify-between items-center">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-xl ${getPriorityClasses(
              task.priority
            )}`}
          >
            {task.priority === t('tasks.high') || task.priority === "Высокий" ? t('tasks.high') :
             task.priority === t('tasks.medium') || task.priority === "Средний" ? t('tasks.medium') :
             task.priority === t('tasks.low') || task.priority === "Низкий" ? t('tasks.low') : task.priority}
          </span>
          <span className={`text-xs font-medium ${overdue ? "text-red-600 font-bold" : darkMode ? "text-gray-400" : "text-gray-400"}`}>
            {t('tasks.dueDate')}: {task.dueDate}
          </span>
        </div>
        <div className={`text-xs font-medium ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
          {t('tasks.board')}: {boardTitle}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';

function TaskList({ tasks, onAddTask, onArchiveTask, onUpdateTask, boards, showFilters = false, darkMode = false, onDuplicateTask }) {
  const { t, i18n } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("все");
  const [boardFilter, setBoardFilter] = useState("все");
  const [priorityFilter, setPriorityFilter] = useState("все");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const activeBoards = boards ? boards.filter((b) => b.status === t('boards.active') || b.status === "активная") : [];

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const filteredAndSortedTasks = useMemo(() => {
    if (!tasks) return [];

    let filtered = tasks.filter((task) => {
      const statusMatch = statusFilter === "все" || 
        task.status === statusFilter ||
        (statusFilter === t('tasks.toDo') && task.status === "К выполнению") ||
        (statusFilter === t('tasks.inProgress') && task.status === "В процессе") ||
        (statusFilter === t('tasks.done') && task.status === "Выполнено");
      const boardMatch = boardFilter === "все" || task.boardId === parseInt(boardFilter);
      const priorityMatch = priorityFilter === "все" || 
        task.priority === priorityFilter ||
        (priorityFilter === t('tasks.high') && task.priority === "Высокий") ||
        (priorityFilter === t('tasks.medium') && task.priority === "Средний") ||
        (priorityFilter === t('tasks.low') && task.priority === "Низкий");
      const searchMatch = !debouncedSearch || 
        task.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        task.description.toLowerCase().includes(debouncedSearch.toLowerCase());
      return statusMatch && boardMatch && priorityMatch && searchMatch;
    });

    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.dueDate || 0) - new Date(a.dueDate || 0));
    } else if (sortBy === "priority") {
      const priorityOrder = { "Высокий": 3, "Средний": 2, "Низкий": 1 };
      filtered.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
    } else if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [tasks, statusFilter, boardFilter, priorityFilter, debouncedSearch, sortBy]);

  const displayTasks = showFilters ? filteredAndSortedTasks : tasks;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const getDefaultBoardId = () => {
    if (!boards || boards.length === 0) return null;
    const activeBoards = boards.filter((b) => b.status === t('boards.active') || b.status === "активная");
    return activeBoards.length > 0 ? activeBoards[0].id : null;
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Средний",
    status: "К выполнению",
    dueDate: "",
    boardId: getDefaultBoardId(),
  });

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      priority: "Средний",
      status: "К выполнению",
      dueDate: "",
      boardId: getDefaultBoardId(),
    });
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setIsEditMode(true);
    setEditingTask(task);
    setDateError("");
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      boardId: task.boardId || getDefaultBoardId(),
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      priority: "Средний",
      status: "К выполнению",
      dueDate: "",
      boardId: getDefaultBoardId(),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (isEditMode && editingTask) {
      onUpdateTask(editingTask.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || new Date().toISOString().split("T")[0],
        boardId: formData.boardId,
      });
    } else {
      const newId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
      const activeBoards = boards ? boards.filter((b) => b.status === t('boards.active') || b.status === "активная") : [];
      const defaultBoardId = formData.boardId || (activeBoards.length > 0 ? activeBoards[0].id : null);
      
      if (!defaultBoardId) {
        alert(t('validation.noActiveBoards'));
        return;
      }

      const newTask = {
        id: newId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || new Date().toISOString().split("T")[0],
        isArchived: false,
        boardId: defaultBoardId,
      };
      onAddTask(newTask);
    }
    handleCloseModal();
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{t('tasks.title')}</h2>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full sm:w-auto">
            {showFilters && tasks && tasks.length > 0 && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-2 px-3 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 focus:border-indigo-500 focus:outline-none w-full sm:w-auto"
                >
                  <option value="все">Все статусы</option>
                  <option value="К выполнению">К выполнению</option>
                  <option value="В процессе">В процессе</option>
                  <option value="Выполнено">Выполнено</option>
                </select>
                <select
                  value={boardFilter}
                  onChange={(e) => setBoardFilter(e.target.value)}
                  className="py-2 px-3 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 focus:border-indigo-500 focus:outline-none w-full sm:w-auto"
                >
                  <option value="все">{t('tasks.filterAllBoards')}</option>
                  {activeBoards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.title}
                    </option>
                  ))}
                </select>
              </>
            )}
            {onAddTask && (
              <button
                onClick={handleOpenModal}
                className="py-2 px-4 bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-indigo-600 w-full sm:w-auto"
              >
                + {t('tasks.addTask')}
              </button>
            )}
          </div>
        </div>
        <div className={`text-center py-12 rounded-lg ${darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"}`}>
          <svg className="mx-auto h-12 w-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium mb-2">Нет задач</p>
          <p className="text-sm">Создайте первую задачу, чтобы начать работу</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{t('tasks.title')}</h2>
          {onAddTask && (
            <button
              onClick={handleOpenModal}
              className="py-2 px-4 bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-indigo-600 w-full sm:w-auto"
            >
              + {t('tasks.addTask')}
            </button>
          )}
        </div>
        {showFilters && (
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('tasks.search')}
                className={`w-full py-2 pl-10 pr-4 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-indigo-500"
                    : "bg-white border-gray-200 text-gray-800 focus:border-indigo-500"
                }`}
                aria-label={t('tasks.search')}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`py-2 px-3 border-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 focus:outline-none w-full sm:w-auto ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100 focus:border-indigo-500"
                    : "bg-white border-gray-200 focus:border-indigo-500"
                }`}
                aria-label="Фильтр по статусу"
              >
                <option value="все">{t('tasks.filterAllStatuses')}</option>
                <option value={t('tasks.toDo')}>{t('tasks.toDo')}</option>
                <option value={t('tasks.inProgress')}>{t('tasks.inProgress')}</option>
                <option value={t('tasks.done')}>{t('tasks.done')}</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className={`py-2 px-3 border-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 focus:outline-none w-full sm:w-auto ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100 focus:border-indigo-500"
                    : "bg-white border-gray-200 focus:border-indigo-500"
                }`}
                aria-label="Фильтр по приоритету"
              >
                <option value="все">{t('tasks.filterAllPriorities')}</option>
                <option value={t('tasks.high')}>{t('tasks.high')}</option>
                <option value={t('tasks.medium')}>{t('tasks.medium')}</option>
                <option value={t('tasks.low')}>{t('tasks.low')}</option>
              </select>
              <select
                value={boardFilter}
                onChange={(e) => setBoardFilter(e.target.value)}
                className={`py-2 px-3 border-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 focus:outline-none w-full sm:w-auto ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100 focus:border-indigo-500"
                    : "bg-white border-gray-200 focus:border-indigo-500"
                }`}
                aria-label="Фильтр по доске"
              >
                <option value="все">{t('tasks.filterAllBoards')}</option>
                {activeBoards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.title}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`py-2 px-3 border-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 focus:outline-none w-full sm:w-auto ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100 focus:border-indigo-500"
                    : "bg-white border-gray-200 focus:border-indigo-500"
                }`}
                aria-label="Сортировка"
              >
                <option value="date">{t('tasks.sortByDate')}</option>
                <option value="priority">{t('tasks.sortByPriority')}</option>
                <option value="title">{t('tasks.sortByTitle')}</option>
              </select>
            </div>
          </div>
        )}
      </div>
      <p className={`text-[15px] leading-relaxed mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        {t('tasks.totalTasks')}: {displayTasks.length}
      </p>
      <div className="flex flex-col gap-4" role="list" aria-label={t('tasks.title')}>
        {displayTasks.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"}`} role="status" aria-live="polite">
            <svg className="mx-auto h-12 w-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium mb-2">{t('tasks.noTasks')}</p>
            <p className="text-sm">{t('tasks.noTasksMessage')}</p>
          </div>
        ) : (
          displayTasks.map((task) => (
            <div key={task.id} role="listitem">
              <TaskItem
                task={task}
                onArchiveTask={onArchiveTask}
                onEdit={onUpdateTask ? handleEditTask : null}
                onDuplicate={onDuplicateTask}
                boards={boards}
                darkMode={darkMode}
              />
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 my-4 max-h-[90vh] overflow-y-auto ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                {isEditMode ? t('tasks.editTask') : t('tasks.createTask')}
              </h2>
              <button
                onClick={handleCloseModal}
                className={`${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"} text-2xl font-bold transition-colors`}
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="task-title"
                  className={`block mb-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  {t('tasks.taskTitle')} *
                </label>
                <input
                  id="task-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder={t('tasks.taskTitle')}
                  required
                  maxLength={50}
                  className={`w-full py-3 px-4 text-base border-2 rounded-lg outline-none transition-all duration-300 focus:ring-4 focus:ring-indigo-100 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-indigo-500"
                      : "bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white"
                  }`}
                  aria-required="true"
                />
              </div>
              <div>
                <label
                  htmlFor="task-description"
                  className={`block mb-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  {t('tasks.description')}
                </label>
                <textarea
                  id="task-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={t('tasks.description')}
                  rows="3"
                  maxLength={150}
                  className={`w-full py-3 px-4 text-base border-2 rounded-lg outline-none transition-all duration-300 resize-none focus:ring-4 focus:ring-indigo-100 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-indigo-500"
                      : "bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white"
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="task-priority"
                    className={`block mb-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {t('tasks.priority')}
                  </label>
                  <select
                    id="task-priority"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className={`w-full py-3 px-4 text-base border-2 rounded-lg outline-none cursor-pointer transition-all duration-300 focus:ring-4 focus:ring-indigo-100 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-indigo-500"
                        : "bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white"
                    }`}
                  >
                    <option value={t('tasks.low')}>{t('tasks.low')}</option>
                    <option value={t('tasks.medium')}>{t('tasks.medium')}</option>
                    <option value={t('tasks.high')}>{t('tasks.high')}</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="task-status"
                    className={`block mb-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {t('tasks.status')}
                  </label>
                  <select
                    id="task-status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className={`w-full py-3 px-4 text-base border-2 rounded-lg outline-none cursor-pointer transition-all duration-300 focus:ring-4 focus:ring-indigo-100 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-indigo-500"
                        : "bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white"
                    }`}
                  >
                    <option value={t('tasks.toDo')}>{t('tasks.toDo')}</option>
                    <option value={t('tasks.inProgress')}>{t('tasks.inProgress')}</option>
                    <option value={t('tasks.done')}>{t('tasks.done')}</option>
                  </select>
                </div>
              </div>
              {boards && boards.length > 0 && (
                <div>
                  <label
                    htmlFor="task-boardId"
                    className={`block mb-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {t('tasks.board')}
                  </label>
                  <select
                    id="task-boardId"
                    value={formData.boardId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, boardId: parseInt(e.target.value) })
                    }
                    className={`w-full py-3 px-4 text-base border-2 rounded-lg outline-none cursor-pointer transition-all duration-300 focus:ring-4 focus:ring-indigo-100 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-indigo-500"
                        : "bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white"
                    }`}
                  >
                    {boards
                      .filter((b) => b.status === t('boards.active') || b.status === "активная")
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              <div>
                <label
                  htmlFor="task-dueDate"
                  className={`block mb-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  {t('tasks.dueDate')}
                </label>
                <input
                  id="task-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => {
                    setFormData({ ...formData, dueDate: e.target.value });
                    validateDate(e.target.value);
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full py-3 px-4 text-base border-2 rounded-lg outline-none transition-all duration-300 cursor-pointer focus:ring-4 focus:ring-indigo-100 ${
                    dateError
                      ? "border-red-500 focus:border-red-500"
                      : darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-indigo-500"
                        : "bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white"
                  }`}
                />
                {dateError && (
                  <p className="text-red-500 text-sm mt-1">{dateError}</p>
                )}
                {formData.dueDate && !dateError && (
                  <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {new Date(formData.dueDate) < new Date() 
                      ? `⚠ ${t('tasks.dateInPast')}` 
                      : `${t('tasks.dueDateInfo')}: ${new Date(formData.dueDate).toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'kk' ? 'kk-KZ' : 'en-US')}`
                    }
                  </p>
                )}
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    darkMode
                      ? "bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400"
                  }`}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-indigo-500 text-white rounded-lg font-semibold transition-all duration-200 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {isEditMode ? t('common.save') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskList;
