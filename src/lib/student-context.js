import React, { createContext, useState, useContext } from 'react';

const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateStudentData = (data) => {
    setStudentData(data);
  };

  const clearStudentData = () => {
    setStudentData(null);
  };

  return (
    <StudentContext.Provider 
      value={{ 
        studentData, 
        setStudentData: updateStudentData, 
        clearStudentData,
        loading,
        setLoading 
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within StudentProvider');
  }
  return context;
};
