import { useTranslation } from 'react-i18next';
import TaskList from "./TaskList";
import BoardCard from "./BoardCard";

function MainDashboard({ tasks, boards, selectedFilter, onToggleStatus, onAddTask, onArchiveTask, onUpdateTask, onUpdateBoard, onSelectBoard, boardsList, onCompleteBoard, allTasks, darkMode, onDuplicateTask }) {
  const { t } = useTranslation();
  const shouldShowBoards = selectedFilter === "allTasks";

  return (
    <main className={`p-4 sm:p-6 md:p-8 flex-1 min-h-[calc(100vh-100px)] overflow-x-hidden w-full max-w-full transition-colors duration-200 ${
      darkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      {shouldShowBoards && boards && boards.length > 0 ? (
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{t('boards.myBoards')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards
              .filter((board) => board.status === t('boards.active') || board.status === "активная")
              .map((board) => (
                <BoardCard key={board.id} board={board} onToggleStatus={onToggleStatus} onSelect={onSelectBoard} onCompleteBoard={onCompleteBoard} tasks={allTasks || []} darkMode={darkMode} />
              ))}
          </div>
        </div>
      ) : null}
      {tasks && <TaskList tasks={tasks} onAddTask={onAddTask} onArchiveTask={onArchiveTask} onUpdateTask={onUpdateTask} boards={boardsList} showFilters={shouldShowBoards} darkMode={darkMode} onDuplicateTask={onDuplicateTask} />}
    </main>
  );
}

export default MainDashboard;
