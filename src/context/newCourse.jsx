import React, { createContext, useContext, useState } from "react";

const courseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courseData, setCourseData] = useState({
    step1: {},
    step2: {},
  });
  const [isDone, setIsDone] = useState(false);

  return (
    <courseContext.Provider
      value={{ courseData, setCourseData, isDone, setIsDone }}
    >
      {children}
    </courseContext.Provider>
  );
};

export const useCourse = () => {
  return useContext(courseContext);
};
