import { useTranslation } from 'react-i18next';

function Sidebar({
  selectedFilter,
  onFilterChange,
  onPageChange,
  currentPage,
  isOpen,
  onClose,
  tasks = [],
  darkMode = false,
}) {
  const { t } = useTranslation();

  const getTaskCount = (filterKey) => {
    if (filterKey === "allTasks") {
      return tasks.filter((task) => !task.isArchived).length;
    }
    if (filterKey === "important") {
      return tasks.filter((task) => (task.priority === t('tasks.high') || task.priority === "Высокий") && !task.isArchived).length;
    }
    if (filterKey === "completed") {
      return tasks.filter((task) => (task.status === t('tasks.done') || task.status === "Выполнено") && !task.isArchived).length;
    }
    return 0;
  };

  const menuItems = [
    { icon: "📋", label: t('sidebar.allTasks'), filterKey: "allTasks", page: "tasks", count: getTaskCount("allTasks") },
    { icon: "⭐", label: t('sidebar.important'), filterKey: "important", page: "tasks", count: getTaskCount("important") },
    { icon: "✅", label: t('sidebar.completed'), filterKey: "completed", page: "tasks", count: getTaskCount("completed") },
    { icon: "📌", label: t('sidebar.boards'), page: "boards" },
    { icon: "👤", label: t('sidebar.userForm'), page: "userform" }
  ];


  const handleItemClick = (item, page) => {
    if (page === "userform") {
      onPageChange("userform");
    } else if (page === "boards") {
      onPageChange("boards");
    } else {
      onFilterChange(item.filterKey);
      onPageChange("tasks");
    }
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] py-6 border-r min-h-screen box-border shadow-sm transform transition-transform duration-300 ease-in-out ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 mb-4">
          <h2 className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {t('sidebar.menu')}
          </h2>
          <button
            onClick={onClose}
            className={`${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"} text-2xl font-bold transition-colors`}
            aria-label={t('common.close')}
          >
            ×
          </button>
        </div>
        <ul className="list-none p-0 m-0">
        {menuItems.map((item, index) => {
          const isActive =
            (item.page === "userform" && currentPage === "userform") ||
            (item.page === "boards" && currentPage === "boards") ||
            (item.page === "tasks" &&
              (selectedFilter === item.filterKey || selectedFilter === item.label) &&
              currentPage === "tasks");
          return (
            <li
              key={index}
              onClick={() => handleItemClick(item, item.page)}
              className={`py-3 px-6 cursor-pointer transition-all duration-200 mb-1 flex items-center justify-between ${
                isActive
                  ? darkMode
                    ? "bg-gray-700 border-l-4 border-indigo-500"
                    : "bg-gray-100 border-l-4 border-indigo-500"
                  : darkMode
                    ? "border-l-4 border-transparent hover:bg-gray-700 hover:border-l-4 hover:border-indigo-500"
                    : "border-l-4 border-transparent hover:bg-gray-100 hover:border-l-4 hover:border-indigo-500"
              }`}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleItemClick(item, item.page);
                }
              }}
            >
              <div className="flex items-center">
                <span className="mr-3 text-lg">{item.icon}</span>
                <span
                  className={`text-[15px] ${
                    isActive
                      ? "font-semibold text-indigo-500"
                      : darkMode
                        ? "font-medium text-gray-300"
                        : "font-medium text-gray-800"
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {item.count !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? darkMode
                      ? "bg-indigo-900 text-indigo-200"
                      : "bg-indigo-100 text-indigo-700"
                    : darkMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-200 text-gray-600"
                }`}>
                  {item.count}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
    </>
  );
}

export default Sidebar;
