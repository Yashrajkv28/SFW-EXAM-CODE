import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center w-full h-full p-16">
      <div className="w-12 h-12 rounded-full border-4 border-primary dark:border-dark-primary animate-m3-loader" />
    </div>
  );
};

export default Loading;
