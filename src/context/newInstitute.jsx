import React, { createContext, useContext, useState } from 'react';

const instituteContext = createContext();

export const InstituteProvider = ({ children }) => {
    const [instituteData, setInstituteData] = useState({
        step1: {},
        step2: {},
        step3: {},
        step4: {},
        step5: null,
    });
    const [isDone, setIsDone] = useState(false);

    return (
        <instituteContext.Provider value={{ instituteData, setInstituteData, isDone, setIsDone }}>
            {children}
        </instituteContext.Provider>
    );
};

export const useInstitute = () => {
    return useContext(instituteContext);
};