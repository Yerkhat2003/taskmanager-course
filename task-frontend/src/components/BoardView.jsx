import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';

function BoardView({ board, tasks, onUpdateTask, onAddTask, onArchiveTask, boards, onBack, darkMode = false }) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Средний",
    status: "К выполнению",
    dueDate: "",
    boardId: board.id,
  });
  const [draggedTask, setDraggedTask] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [dateError, setDateError] = useState("");
  const draggedElementRef = useRef(null);

  const boardTasks = tasks.filter((task) => task.boardId === board.id && !task.isArchived);

  const statusColumns = [
    { id: t('tasks.toDo'), title: t('tasks.toDo'), color: "bg-blue-100 text-blue-800" },
    { id: t('tasks.inProgress'), title: t('tasks.inProgress'), color: "bg-yellow-100 text-yellow-800" },
    { id: t('tasks.done'), title: t('tasks.done'), color: "bg-green-100 text-green-800" },
  ];

  const getTasksByStatus = (status) => {
    return boardTasks.filter((task) => {
      if (task.status === status) return true;
      if (status === t('tasks.toDo') && (task.status === "К выполнению" || task.status === t('tasks.toDo'))) return true;
      if (status === t('tasks.inProgress') && (task.status === "В процессе" || task.status === t('tasks.inProgress'))) return true;
      if (status === t('tasks.done') && (task.status === "Выполнено" || task.status === t('tasks.done'))) return true;
      return false;
    });
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("taskId", task.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    onUpdateTask(taskId, { status: newStatus });
  };

  const handleTouchStart = (e, task) => {
    e.stopPropagation();
    const touch = e.touches[0];
    setDraggedTask(task);
    setTouchStartY(touch.clientY);
    setTouchStartX(touch.clientX);
    const element = e.currentTarget;
    draggedElementRef.current = element;
    const rect = element.getBoundingClientRect();
    draggedElementRef.current.startX = rect.left;
    draggedElementRef.current.startY = rect.top;
    element.style.opacity = "0.5";
    element.style.transform = "scale(0.95)";
    element.style.zIndex = "1000";
    element.style.position = "fixed";
    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;
    element.style.width = `${rect.width}px`;
  };

  useEffect(() => {
    const handleGlobalTouchMove = (e) => {
      if (!draggedTask || !draggedElementRef.current || touchStartY === null || touchStartX === null) return;
      
      e.preventDefault();
      const touch = e.touches[0];
      const element = draggedElementRef.current;
      const deltaY = touch.clientY - touchStartY;
      const deltaX = touch.clientX - touchStartX;
      
      element.style.left = `${element.startX + deltaX}px`;
      element.style.top = `${element.startY + deltaY}px`;
      element.style.transform = "scale(0.95)";
      element.style.transition = 'none';
      
      const centerX = touch.clientX;
      const centerY = touch.clientY;
      
      const allColumns = document.querySelectorAll('[data-column-id]');
      let targetColumn = null;
      
      allColumns.forEach(col => {
        const rect = col.getBoundingClientRect();
        if (centerX >= rect.left && centerX <= rect.right && 
            centerY >= rect.top && centerY <= rect.bottom) {
          targetColumn = col;
        }
      });
      
      allColumns.forEach(col => {
        col.classList.remove('ring-2', 'ring-indigo-400', 'bg-indigo-50');
      });
      
      if (targetColumn) {
        targetColumn.classList.add('ring-2', 'ring-indigo-400', 'bg-indigo-50');
      }
    };

    const handleGlobalTouchEnd = (e) => {
      if (!draggedTask || !draggedElementRef.current) return;

      const touch = e.changedTouches[0];
      const element = draggedElementRef.current;
      
      const centerX = touch.clientX;
      const centerY = touch.clientY;
      
      const allColumns = document.querySelectorAll('[data-column-id]');
      let targetColumn = null;
      
      allColumns.forEach(col => {
        const rect = col.getBoundingClientRect();
        if (centerX >= rect.left && centerX <= rect.right && 
            centerY >= rect.top && centerY <= rect.bottom) {
          targetColumn = col;
        }
      });
      
      if (targetColumn) {
        const newStatus = targetColumn.getAttribute('data-column-id');
        if (newStatus && newStatus !== draggedTask.status) {
          onUpdateTask(draggedTask.id, { status: newStatus });
        }
      }

      allColumns.forEach(col => {
        col.classList.remove('ring-2', 'ring-indigo-400', 'bg-indigo-50');
      });

      element.style.opacity = "1";
      element.style.transform = "scale(1)";
      element.style.transition = "all 0.2s ease-out";
      element.style.zIndex = "1";
      element.style.position = "";
      element.style.left = "";
      element.style.top = "";
      element.style.width = "";

      setTimeout(() => {
        setDraggedTask(null);
        setTouchStartY(null);
        setTouchStartX(null);
        draggedElementRef.current = null;
      }, 200);
    };

    if (draggedTask) {
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);
      document.addEventListener('touchcancel', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [draggedTask, touchStartY, touchStartX, onUpdateTask]);

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      priority: "Средний",
      status: "К выполнению",
      dueDate: "",
      boardId: board.id,
    });
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setIsEditMode(true);
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      boardId: task.boardId || board.id,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingTask(null);
    setDateError("");
    setFormData({
      title: "",
      description: "",
      priority: "Средний",
      status: "К выполнению",
      dueDate: "",
      boardId: board.id,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    if (!validateDate(formData.dueDate)) {
      return;
    }

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
      const newTask = {
        id: newId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || new Date().toISOString().split("T")[0],
        isArchived: false,
        boardId: formData.boardId,
      };
      onAddTask(newTask);
    }
    handleCloseModal();
  };

  const getPriorityClasses = (priority) => {
    if (priority === t('tasks.high') || priority === "Высокий") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (priority === t('tasks.medium') || priority === "Средний") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (priority === t('tasks.low') || priority === "Низкий") return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  };

  const getPriorityLabel = (priority) => {
    if (priority === t('tasks.high') || priority === "Высокий") return t('tasks.high');
    if (priority === t('tasks.medium') || priority === "Средний") return t('tasks.medium');
    if (priority === t('tasks.low') || priority === "Низкий") return t('tasks.low');
    return priority;
  };

  return (
    <div className={`p-4 sm:p-6 md:p-8 flex-1 min-h-[calc(100vh-100px)] overflow-x-hidden w-full max-w-full transition-colors duration-200 ${
      darkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={onBack}
            className={`${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"} text-xl font-bold transition-colors`}
            aria-label={t('common.back')}
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold truncate ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{board.title}</h1>
            <p className={`text-sm sm:text-base mt-1 line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{board.description}</p>
          </div>
        </div>
        <button
          onClick={handleOpenModal}
          className="py-2 sm:py-3 px-4 sm:px-6 bg-indigo-500 text-white rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 hover:bg-indigo-600 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label={t('tasks.addTask')}
        >
          + {t('tasks.addTask')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {statusColumns.map((column) => (
          <div
            key={column.id}
            data-column-id={column.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`rounded-lg p-3 sm:p-4 min-h-[300px] sm:min-h-[400px] transition-colors duration-200 ${
              darkMode ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <h3 className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4 ${column.color}`}>
              {column.title} ({getTasksByStatus(column.id).length})
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {getTasksByStatus(column.id).map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onTouchStart={(e) => handleTouchStart(e, task)}
                  className={`p-3 sm:p-4 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow touch-none select-none relative ${
                    darkMode ? "bg-gray-700" : "bg-white"
                  }`}
                  style={{ 
                    userSelect: 'none', 
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    touchAction: 'none'
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`text-sm sm:text-base font-semibold flex-1 truncate ${darkMode ? "text-gray-100" : "text-gray-800"}`} title={task.title}>{task.title}</h4>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task);
                        }}
                        onTouchStart={(e) => e.stopPropagation()}
                        className="text-indigo-500 hover:text-indigo-600 text-sm transition-colors"
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      {onArchiveTask && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchiveTask(task.id);
                          }}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-gray-600 text-lg font-bold transition-colors"
                          title="В архив"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm mb-2 line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`} title={task.description}>{task.description}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityClasses(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                    <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t('tasks.dueDate')}: {task.dueDate}</span>
                  </div>
                  <div className={`md:hidden pt-2 border-t ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                    <select
                      value={task.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        onUpdateTask(task.id, { status: e.target.value });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      className={`w-full text-xs py-1.5 px-2 border rounded focus:border-indigo-500 focus:outline-none ${
                        darkMode
                          ? "bg-gray-800 border-gray-600 text-gray-100"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <option value="К выполнению">К выполнению</option>
                      <option value="В процессе">В процессе</option>
                      <option value="Выполнено">Выполнено</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                aria-label={t('common.close')}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className={`block mb-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {t('tasks.taskTitle')} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Введите название задачи"
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
                <label className={`block mb-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {t('tasks.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('tasks.descriptionPlaceholder')}
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
                  <label className={`block mb-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {t('tasks.priority')}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                  <label className={`block mb-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {t('tasks.status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
              <div>
                <label className={`block mb-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {t('tasks.board')}
                </label>
                <select
                  value={formData.boardId}
                  onChange={(e) => setFormData({ ...formData, boardId: parseInt(e.target.value) })}
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
              <div>
                <label className={`block mb-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {t('tasks.dueDate')}
                </label>
                <input
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
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all duration-200 hover:bg-gray-300"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-indigo-500 text-white rounded-lg font-semibold transition-all duration-200 hover:bg-indigo-600"
                >
                  {isEditMode ? "Сохранить" : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardView;

