function Toast({ message, type = "success" }) {
  const typeStyles = {
    success: "bg-emerald-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-yellow-500 text-white",
  };

  return (
    <div
      className={`${typeStyles[type]} px-4 py-3 rounded-lg shadow-lg animate-slide-in min-w-[250px] max-w-[400px]`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">
          {type === "success" && "✓"}
          {type === "error" && "✕"}
          {type === "info" && "ℹ"}
          {type === "warning" && "⚠"}
        </span>
        <span className="text-sm font-semibold">{message}</span>
      </div>
    </div>
  );
}

export default Toast;





