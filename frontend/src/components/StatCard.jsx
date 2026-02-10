const StatCard = ({ label, value, icon, iconClassName, onIconClick }) => {
  const iconNode = (
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl ${iconClassName}`}
    >
      {icon}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-start">
      <div>
        <p className="text-sm font-semibold text-gray-400">{label}</p>
        <h2 className="text-4xl font-bold text-[#1e293b] mt-2">{value}</h2>
      </div>
      {onIconClick ? (
        <button type="button" onClick={onIconClick} className="cursor-pointer">
          {iconNode}
        </button>
      ) : (
        iconNode
      )}
    </div>
  );
};

export default StatCard;
