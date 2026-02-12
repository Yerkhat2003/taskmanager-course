import { useTranslation } from 'react-i18next';

function BoardCard({ board, onDelete, onToggleStatus, onEdit, onSelect, onCompleteBoard, tasks = [], darkMode = false, onDuplicate }) {
  const { t } = useTranslation();

  const getStatusColor = (status) => {
    if (status === t('boards.active') || status === "активная") return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700";
    if (status === t('boards.completed') || status === "завершена") return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700";
    if (status === t('boards.archived') || status === "архивная") return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
    return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700";
  };

  const getStatusLabel = (status) => {
    if (status === t('boards.active') || status === "активная") return t('boards.active');
    if (status === t('boards.completed') || status === "завершена") return t('boards.completed');
    if (status === t('boards.archived') || status === "архивная") return t('boards.archived');
    return status;
  };

  const boardTasks = tasks.filter((task) => task.boardId === board.id && !task.isArchived);
  const completedTasks = boardTasks.filter((task) => task.status === t('tasks.done') || task.status === "Выполнено").length;
  const progress = boardTasks.length > 0 ? (completedTasks / boardTasks.length) * 100 : 0;

  return (
    <div 
      className={`rounded-xl p-4 sm:p-6 shadow-sm transition-all duration-200 border hover:shadow-md hover:-translate-y-0.5 w-full max-w-full ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
      onClick={onSelect && (board.status === t('boards.active') || board.status === "активная" || board.status === t('boards.completed') || board.status === "завершена") ? () => onSelect(board.id) : undefined}
      style={onSelect && (board.status === t('boards.active') || board.status === "активная" || board.status === t('boards.completed') || board.status === "завершена") ? { cursor: "pointer" } : {}}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className={`text-lg sm:text-xl font-semibold m-0 mb-2 truncate ${darkMode ? "text-gray-100" : "text-gray-800"}`} title={board.title}>
            {board.title}
          </h3>
          {onToggleStatus ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus(board.id);
              }}
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 hover:opacity-80 ${getStatusColor(
                board.status
              )}`}
              title={t('boards.status')}
            >
              {getStatusLabel(board.status)}
            </button>
          ) : (
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                board.status
              )}`}
            >
              {getStatusLabel(board.status)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <button
              onClick={() => onEdit(board)}
              className={`bg-transparent border-none text-lg cursor-pointer text-indigo-500 py-1 px-2 rounded transition-all duration-200 ${
                darkMode ? "hover:bg-indigo-900" : "hover:bg-indigo-50"
              }`}
              title={t('common.edit')}
              aria-label={t('common.edit')}
            >
              ✏️
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(board)}
              className={`bg-transparent border-none text-lg cursor-pointer text-blue-500 py-1 px-2 rounded transition-all duration-200 ${
                darkMode ? "hover:bg-blue-900" : "hover:bg-blue-50"
              }`}
              title={t('common.duplicate')}
              aria-label={t('common.duplicate')}
            >
              📋
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(board.id)}
              className={`bg-transparent border-none text-xl cursor-pointer text-red-500 py-1 px-2 rounded transition-all duration-200 ${
                darkMode ? "hover:bg-red-900" : "hover:bg-red-50"
              }`}
              title={t('common.delete')}
              aria-label={t('common.delete')}
            >
              ×
            </button>
          )}
        </div>
      </div>
      <p className={`text-sm mb-4 leading-relaxed line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`} title={board.description}>
        {board.description}
      </p>
      {boardTasks.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {t('boards.progress')}: {completedTasks} / {boardTasks.length}
            </span>
            <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}
      <div className={`flex justify-between items-center pt-3 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {t('boards.createdAt')}: {board.createdAt}
          </div>
          <div className={`text-xs font-semibold px-2 py-1 rounded ${
            darkMode ? "text-indigo-400 bg-indigo-900" : "text-indigo-600 bg-indigo-50"
          }`}>
            {t('boards.tasksCount')}: {boardTasks.length}
          </div>
        </div>
        {onCompleteBoard && (board.status === t('boards.active') || board.status === "активная") && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompleteBoard(board.id);
            }}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300 cursor-pointer transition-all duration-200 hover:bg-blue-200"
            title={t('boards.complete')}
          >
            ✓ {t('boards.complete')}
          </button>
        )}
      </div>
    </div>
  );
}

export default BoardCard;

