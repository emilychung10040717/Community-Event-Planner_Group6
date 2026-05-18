import { ValidatorFactory } from './formValidation';

// =========================================================================
// Observer Pattern: send to the listener when the information is updated successfully
// =========================================================================
class FormObserverManager {
  constructor() {
    this.listeners = [];
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  notify(fieldName, value, fullData) {
    this.listeners.forEach(fn => fn({ fieldName, value, fullData }));
  }
}

export const formObserver = new FormObserverManager();

//  Log a listener automaticaly
formObserver.subscribe(({ fieldName, value }) => {
  console.log(`[Observer Notified] field 【${fieldName}】 is modified succesfully to:`, value);
});


// =========================================================================
// Factory + Observer
// =========================================================================
export const updateField = (setFormData, fieldName, newValue, context) => {
  // Fetch the corresponding strategy of validation from Factory Method
  const validators = ValidatorFactory.createValidators(fieldName);

  // Execute strategy verification
  for (const validate of validators) {
    const result = validate(newValue, context);
    if (!result.isValid) {
      alert(result.msg);
      return false; 
    }
  }

  // Verification pass: update the status
  setFormData(prev => {
    const nextState = { ...prev, [fieldName]: newValue };
    
    formObserver.notify(fieldName, newValue, nextState);
    return nextState;
  });

  return true;
};