import Sidebar from "../components/Sidebar";
import { useTasks } from "../context/TaskContext";

const Dashboard = () => {
  const { stats, tasks, isLoading, error } = useTasks();

  const recentActivities = tasks.slice(0, 3);
  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen bg-[#f3f4f9]">
      <Sidebar />
      
      <main className="flex-1 p-8 space-y-8">
        {/* Top Header Section */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-bold text-[#1e293b]">Welcome Back!</h1>
          
          <div className="flex items-center gap-6">
            <div className="text-gray-400 text-xl cursor-pointer">🔔</div>
            <div className="text-gray-400 text-xl cursor-pointer">👤</div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
              <div className="bg-blue-500 w-full h-full flex items-center justify-center text-white text-xs font-bold">AG</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-400">Total Tasks</p>
              <h2 className="text-4xl font-bold text-[#1e293b] mt-2">{stats.total}</h2>
            </div>
            <div className="w-10 h-10 bg-[#2563eb] rounded-lg flex items-center justify-center text-white text-xl">≡</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-400">Completed Tasks</p>
              <h2 className="text-4xl font-bold text-[#1e293b] mt-2">{stats.completed}</h2>
            </div>
            <div className="w-10 h-10 bg-[#34a853] rounded-lg flex items-center justify-center text-white text-xl font-bold">✓</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-400">Pending Tasks</p>
              <h2 className="text-4xl font-bold text-[#1e293b] mt-2">{stats.pending}</h2>
            </div>
            <div className="w-10 h-10 bg-[#e65f41] rounded-lg flex items-center justify-center text-white text-xl">≡</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-lg text-[#1e293b]">Recent Activities</h3>
          </div>
          
          <div className="p-5 space-y-4">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="text-sm text-gray-500">Loading recent activity...</div>
            ) : recentActivities.length === 0 ? (
              <div className="text-sm text-gray-500">No recent activity yet.</div>
            ) : (
              recentActivities.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <div
                    className={`h-4 w-4 rounded-sm ${
                      task.status === "completed"
                        ? "bg-green-600"
                        : "bg-blue-500"
                    }`}
                  ></div>
                  <div className="flex flex-col">
                    <p className="text-gray-700 text-sm">
                      Task "{task.title}"{" "}
                      {task.status === "completed" ? "completed" : "pending"}
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatDate(task.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
