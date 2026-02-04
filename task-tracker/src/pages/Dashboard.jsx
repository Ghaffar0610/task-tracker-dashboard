import Sidebar from "../components/Sidebar";
// 1. IMPORT the hook from your context
import { useTasks } from "../context/TaskContext"; 

const Dashboard = () => {
  // 2. DEFINE stats by pulling it from the context
  // This is the line that was missing and causing the error!
  const { stats } = useTasks(); 

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

        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Tasks Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-400">Total Tasks</p>
              {/* Now this will work because stats is defined above */}
              <h2 className="text-4xl font-bold text-[#1e293b] mt-2">{stats.total}</h2>
            </div>
            <div className="w-10 h-10 bg-[#2563eb] rounded-lg flex items-center justify-center text-white text-xl">≡</div>
          </div>

          {/* Completed Tasks Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-400">Completed Tasks</p>
              <h2 className="text-4xl font-bold text-[#1e293b] mt-2">{stats.completed}</h2>
            </div>
            <div className="w-10 h-10 bg-[#34a853] rounded-lg flex items-center justify-center text-white text-xl font-bold">✓</div>
          </div>

          {/* Pending Tasks Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-400">Pending Tasks</p>
              {/* Fixed: Use stats.pending instead of hardcoded 0 */}
              <h2 className="text-4xl font-bold text-[#1e293b] mt-2">{stats.pending}</h2>
            </div>
            <div className="w-10 h-10 bg-[#e65f41] rounded-lg flex items-center justify-center text-white text-xl">≡</div>
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-lg text-[#1e293b]">Recent Activities</h3>
          </div>
          
          <div className="p-5 space-y-6">
            <div className="flex border-b items-center gap-4">
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
              <p className="text-gray-700 text-sm">Task "Update Report" completed</p>
            </div>
            <div className="flex border-b items-center gap-4">
              <div className="w-4 h-4 bg-blue-700 rounded-sm"></div>
              <p className="text-gray-700 text-sm">Task "Teemting eding" completed</p>
            </div>
            <div className="flex border-b items-center gap-4">
              <div className="w-4 h-4 bg-green-600 rounded-sm"></div>
              <p className="text-gray-700 text-sm">New task "Teem Meeting" added</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;