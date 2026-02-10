const PageHeader = ({ title, right }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-6">
      <h1 className="text-2xl font-bold text-[#1e293b]">{title}</h1>
      {right}
    </div>
  );
};

export default PageHeader;
