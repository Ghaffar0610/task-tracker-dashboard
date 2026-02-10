import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#f3f4f9]">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8">{children}</main>
    </div>
  );
};

export default Layout;
