import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MainDashboard from "./components/MainDashboard";
import UserForm from "./components/UserForm";
import BoardsList from "./components/BoardsList";
import BoardView from "./components/BoardView";
import Toast from "./components/Toast";
import api from "./services/api";

function App() {
  const { t, i18n } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState("allTasks");
  
  if (!i18n.isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }
  const [currentPage, setCurrentPage] = useState("tasks");
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved ? JSON.parse(saved) : true;
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [toasts, setToasts] = useState([]);

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [boards, setBoards] = useState([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);

  useEffect(() => {
    const loadBoards = async () => {
      try {
        setIsLoadingBoards(true);
        const boardsData = await api.getBoards();
        const boardsWithDefaults = boardsData.map(board => ({
          ...board,
          description: board.description || '',
          status: board.status || t('boards.active'),
          createdAt: board.createdAt || new Date().toISOString().split("T")[0],
        }));
        setBoards(boardsWithDefaults);
      } catch (error) {
        console.error('Ошибка загрузки boards:', error);
        showToast('Ошибка загрузки досок', 'error');
        setBoards([]);
      } finally {
        setIsLoadingBoards(false);
      }
    };

    if (i18n.isInitialized) {
      loadBoards();
    }
  }, [i18n.isInitialized]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);


  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const addBoard = async (newBoard) => {
    try {
      const createdBoard = await api.createBoard({ title: newBoard.title });
      const boardWithDefaults = {
        ...createdBoard,
        description: newBoard.description || '',
        status: newBoard.status || t('boards.active'),
        createdAt: newBoard.createdAt || new Date().toISOString().split("T")[0],
      };
      setBoards((prevBoards) => [...prevBoards, boardWithDefaults]);
      showToast(t('toasts.boardCreated'), "success");
    } catch (error) {
      console.error('Ошибка создания board:', error);
      showToast('Ошибка создания доски', "error");
    }
  };

  const deleteBoard = (id) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === id ? { ...board, status: "архивная" } : board
      )
    );
    showToast(t('toasts.boardArchived'), "info");
  };

  const toggleBoardStatus = (id) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) => {
        if (board.id !== id) return board;
        if (board.status === t('boards.active')) return { ...board, status: t('boards.archived') };
        if (board.status === t('boards.completed')) return { ...board, status: t('boards.active') };
        if (board.status === t('boards.archived')) return { ...board, status: t('boards.active') };
        return board;
      })
    );
  };

  const completeBoard = (id) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === id ? { ...board, status: t('boards.completed') } : board
      )
    );
  };

  const updateBoard = (id, updatedData) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === id ? { ...board, ...updatedData } : board
      )
    );
  };

  const addTask = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, { ...newTask, boardId: newTask.boardId || null }]);
    showToast(t('toasts.taskCreated'), "success");
  };

  const archiveTask = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, isArchived: true } : task
      )
    );
    showToast(t('toasts.taskArchived'), "info");
  };

  const updateTask = (id, updatedData) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, ...updatedData } : task
      )
    );
    showToast(t('toasts.taskUpdated'), "success");
  };

  const duplicateTask = (task) => {
    const newId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    const newTask = {
      ...task,
      id: newId,
      title: `${task.title} (${t('common.duplicate')})`,
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
    showToast(t('toasts.taskDuplicated'), "success");
  };

  const duplicateBoard = async (board) => {
    try {
      const duplicatedBoard = await api.createBoard({ 
        title: `${board.title} (${t('common.duplicate')})` 
      });
      const boardWithDefaults = {
        ...duplicatedBoard,
        description: board.description || '',
        status: board.status || t('boards.active'),
        createdAt: duplicatedBoard.createdAt || new Date().toISOString().split("T")[0],
      };
      setBoards((prevBoards) => [...prevBoards, boardWithDefaults]);
      showToast(t('toasts.boardDuplicated'), "success");
    } catch (error) {
      console.error('Ошибка дублирования board:', error);
      showToast('Ошибка дублирования доски', "error");
    }
  };

  const exportData = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      const boardsData = boards.map((board) => {
        const boardTasks = tasks.filter((task) => task.boardId === board.id && !task.isArchived);
        const completedTasks = boardTasks.filter((task) => task.status === t('tasks.done') || task.status === "Выполнено").length;
        return {
          ID: board.id,
          [t('boards.boardTitle')]: board.title,
          [t('boards.boardDescription')]: board.description,
          [t('boards.status')]: board.status,
          [t('boards.createdAt')]: board.createdAt,
          [t('boards.tasksCount')]: boardTasks.length,
          [t('tasks.done')]: completedTasks,
          [t('boards.progress') + " (%)"]: boardTasks.length > 0 ? Math.round((completedTasks / boardTasks.length) * 100) : 0,
        };
      });
      
      const boardsWorksheet = XLSX.utils.json_to_sheet(boardsData);
      XLSX.utils.book_append_sheet(workbook, boardsWorksheet, t('boards.title'));
      
      const tasksData = tasks
        .filter((task) => !task.isArchived)
        .map((task) => {
          const board = boards.find((b) => b.id === task.boardId);
          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== t('tasks.done') && task.status !== "Выполнено";
          return {
            ID: task.id,
            [t('tasks.taskTitle')]: task.title,
            [t('tasks.description')]: task.description,
            [t('tasks.status')]: task.status,
            [t('tasks.priority')]: task.priority,
            [t('tasks.dueDate')]: task.dueDate,
            [t('tasks.board')]: board ? board.title : t('tasks.noBoard'),
            [t('tasks.overdue')]: isOverdue ? t('common.yes') : t('common.no'),
          };
        });
      
      const tasksWorksheet = XLSX.utils.json_to_sheet(tasksData);
      XLSX.utils.book_append_sheet(workbook, tasksWorksheet, t('tasks.title'));
      
      const boardsColWidths = [
        { wch: 5 },
        { wch: 25 },
        { wch: 40 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
      ];
      boardsWorksheet["!cols"] = boardsColWidths;
      
      const tasksColWidths = [
        { wch: 5 },
        { wch: 30 },
        { wch: 40 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 20 },
        { wch: 12 },
      ];
      tasksWorksheet["!cols"] = tasksColWidths;
      
      const fileName = `tasknest-export-${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      showToast(t('toasts.dataExported'), "success");
    } catch (error) {
      console.error("Ошибка при экспорте:", error);
      showToast(t('toasts.exportError'), "error");
    }
  };

  const filterConfig = {
    allTasks: () => tasks.filter((task) => !task.isArchived),
    important: () => tasks.filter((task) => (task.priority === t('tasks.high') || task.priority === "Высокий") && !task.isArchived),
    completed: () => tasks.filter((task) => (task.status === t('tasks.done') || task.status === "Выполнено") && !task.isArchived),
  };

  const filterTasks = (filter) => {
    const filterFn = filterConfig[filter] || filterConfig.allTasks;
    return filterFn();
  };

  const filteredTasks = filterTasks(selectedFilter);

  return (
    <div className={`flex min-h-screen overflow-x-hidden transition-colors duration-200 ${
      darkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      <Sidebar
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        onPageChange={setCurrentPage}
        currentPage={currentPage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        tasks={tasks}
        darkMode={darkMode}
      />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className={`flex-1 flex flex-col min-h-screen overflow-x-hidden w-0 min-w-0 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? "md:ml-[260px]" : "md:ml-0"
      }`}>
        <Header
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onExport={exportData}
        />
        {isLoadingBoards && currentPage === "boards" ? (
          <div className={`flex-1 flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>Загрузка досок...</p>
            </div>
          </div>
        ) : currentPage === "userform" ? (
          <UserForm darkMode={darkMode} />
        ) : selectedBoardId ? (
          <BoardView
            board={boards.find((b) => b.id === selectedBoardId)}
            tasks={tasks}
            boards={boards}
            onUpdateTask={updateTask}
            onAddTask={addTask}
            onArchiveTask={archiveTask}
            onBack={() => setSelectedBoardId(null)}
            darkMode={darkMode}
          />
        ) : currentPage === "boards" ? (
          <BoardsList
            boards={boards}
            onDeleteBoard={deleteBoard}
            onAddBoard={addBoard}
            onToggleStatus={toggleBoardStatus}
            onUpdateBoard={updateBoard}
            onSelectBoard={setSelectedBoardId}
            onCompleteBoard={completeBoard}
            tasks={tasks}
            darkMode={darkMode}
            onDuplicateBoard={duplicateBoard}
          />
        ) : (
          <MainDashboard
            tasks={filteredTasks}
            boards={boards}
            selectedFilter={selectedFilter}
            onToggleStatus={toggleBoardStatus}
            onAddTask={addTask}
            onArchiveTask={archiveTask}
            onUpdateTask={updateTask}
            onUpdateBoard={updateBoard}
            onSelectBoard={setSelectedBoardId}
            boardsList={boards}
            onCompleteBoard={completeBoard}
            allTasks={tasks}
            darkMode={darkMode}
            onDuplicateTask={duplicateTask}
          />
        )}
      </div>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </div>
  );
}

export default App;
