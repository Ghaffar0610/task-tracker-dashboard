import {Link} from 'react-router-dom';
const Sidebar =()=> {
    return (
        <div className='w-64 h-screen bg-blue-600 text-white flex-col p-5'>
            <h1 className="text-2xl font-bold mb-10">Task Tracker</h1>
                        
            <nav className="flex flex-col gap-4">
                <Link to="/dashboard" className="hover:bg-blue-700 p-2 rounded"></Link>
                <Link to="/tasks" className="hover:bg-blue-700 p-2 rounded"></Link>
            </nav>
<div className="mt-auto">
<button className="hover bg-blue-700 p-2 w-full test-left rounded">Logut</button>
</div>
        </div>
    );
};
export default Sidebar;
