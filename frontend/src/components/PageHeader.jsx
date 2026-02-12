const PageHeader = ({ title, right }) => {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:pb-6 lg:flex-row lg:items-center lg:justify-between">
      <h1 className="text-3xl font-bold leading-tight text-[#1e293b] sm:text-4xl">
        {title}
      </h1>
      {right ? (
        <div className="w-full min-w-0 lg:w-auto">
          {right}
        </div>
      ) : null}
    </div>
  );
};

export default PageHeader;
