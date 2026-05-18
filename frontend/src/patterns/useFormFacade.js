import { useState, useEffect } from 'react';
import { updateField } from './formCore'; // 

export const useFormFacade = (initialState, unavailableDatesByLocation) => {
  const [formData, setFormData] = useState({
    title: '', capacity: '', organization: '', category: '', 
    ticketRequired: false, ageRestriction: false, suburb: '', 
    location: '', expStartDate: null, expStartTime: '', 
    expFinDate: '', expFinTime: '', description: '',
    ...initialState
  });

  // Update the status when the initial value is changed
  useEffect(() => {
    if (initialState) {
      setFormData(prev => ({ ...prev, ...initialState }));
    }
  }, [initialState]);

  // The connecting function to the UI
  const changeField = (fieldName, value) => {
    const context = { formData, unavailableDatesByLocation };
    updateField(setFormData, fieldName, value, context); 
  };

  return {
    formData,
    setFormData,
    changeField,
  };
};