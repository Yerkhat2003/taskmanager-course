import { useState } from "react";
import { useTranslation } from 'react-i18next';
import BoardCard from "./BoardCard";

function BoardsList({ boards, onDeleteBoard, onAddBoard, onToggleStatus, onUpdateBoard, onSelectBoard, onCompleteBoard, tasks = [], darkMode = false, onDuplicateBoard }) {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingBoard(null);
    setIsModalOpen(true);
  };

  const handleEditBoard = (board) => {
    setIsEditMode(true);
    setEditingBoard(board);
    setFormData({
      title: board.title,
      description: board.description,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingBoard(null);
    setFormData({ title: "", description: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (isEditMode && editingBoard) {
      onUpdateBoard(editingBoard.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
      });
    } else {
      const newBoard = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: t('boards.active'),
        createdAt: new Date().toISOString().split("T")[0],
      };
      onAddBoard(newBoard);
    }
    handleCloseModal();
  };

  const filteredBoards = boards.filter((board) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return board.status === t('boards.active') || board.status === "активная";
    if (statusFilter === "completed") return board.status === t('boards.completed') || board.status === "завершена";
    if (statusFilter === "archived") return board.status === t('boards.archived') || board.status === "архивная";
    return true;
  });

  return (
    <div className={`p-4 sm:p-6 md:p-8 flex-1 min-h-[calc(100vh-100px)] overflow-x-hidden w-full max-w-full transition-colors duration-200 ${
      darkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className={`text-2xl sm:text-3xl font-bold m-0 ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{t('boards.title')}</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`py-3 px-4 border-2 rounded-lg text-base font-medium cursor-pointer transition-all duration-200 focus:outline-none w-full sm:w-auto ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-gray-100 focus:border-indigo-500"
                : "bg-white border-gray-200 focus:border-indigo-500"
            }`}
            aria-label={t('boards.status')}
          >
            <option value="all">{t('boards.filterAll')}</option>
            <option value="active">{t('boards.filterActive')}</option>
            <option value="completed">{t('boards.filterCompleted')}</option>
            <option value="archived">{t('boards.filterArchived')}</option>
          </select>
          <button
            onClick={handleOpenModal}
            className="py-3 px-6 bg-indigo-500 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-indigo-600 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label={t('boards.addBoard')}
          >
            + {t('boards.addBoard')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredBoards.map((board) => (
          <BoardCard
            key={board.id}
            board={board}
            onDelete={onDeleteBoard}
            onToggleStatus={onToggleStatus}
            onEdit={onUpdateBoard ? handleEditBoard : null}
            onSelect={onSelectBoard}
            onCompleteBoard={onCompleteBoard}
            tasks={tasks}
            darkMode={darkMode}
            onDuplicate={onDuplicateBoard}
          />
        ))}
      </div>

      {filteredBoards.length === 0 && (
        <div className={`text-center py-12 rounded-lg ${darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"}`}>
          <svg className="mx-auto h-16 w-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium mb-2">Нет досок</p>
          <p className="text-sm">
            {statusFilter === "все"
              ? "Нажмите 'Добавить доску', чтобы создать первую доску"
              : statusFilter === "активные"
              ? "Нет активных досок"
              : statusFilter === "завершенные"
              ? "Нет завершенных досок"
              : "Нет архивных досок"}
          </p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 my-4 max-h-[90vh] overflow-y-auto ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                {isEditMode ? t('boards.editBoard') : t('boards.createBoard')}
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
                <label
                  htmlFor="title"
                  className={`block mb-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  {t('boards.boardTitle')} *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder={t('boards.boardTitlePlaceholder')}
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
                  htmlFor="description"
                  className={`block mb-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  {t('boards.boardDescription')}
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={t('boards.boardDescriptionPlaceholder')}
                  rows="4"
                  maxLength={150}
                  className={`w-full py-3 px-4 text-base border-2 rounded-lg outline-none transition-all duration-300 resize-none focus:ring-4 focus:ring-indigo-100 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-indigo-500"
                      : "bg-gray-50 border-gray-200 focus:border-indigo-500 focus:bg-white"
                  }`}
                />
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

export default BoardsList;
