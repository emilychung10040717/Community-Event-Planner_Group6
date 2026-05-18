// =========================================================================
// 1. Strategy Pattern : 
// =========================================================================
export const ValidationStrategies = {
  // strategy1: check if the time by location is conflict
  checkLocationConflict: (value, context) => {
    const { unavailableDatesByLocation, formData } = context;
    const currentLocation = formData.location;
    const blockedDates = unavailableDatesByLocation[currentLocation] || [];
    
    if (blockedDates.includes(value)) {
      return { isValid: false, msg: `${value} is reserved, please select another date.` };
    }
    return { isValid: true };
  },

  // strategy2: check if the start date is earlier than finish date
  checkStartDateBeforeEndDate: (value, context) => {
    const { formData } = context;
    if (formData.expFinDate && new Date(value) > new Date(formData.expFinDate)) {
      return { isValid: false, msg: "The expected start date has to be earlier than the expected finish date." };
    }
    return { isValid: true };
  },

  // Strategy3: check if the finish date is later than the start date
  checkEndDateAfterStartDate: (value, context) => {
    const { formData } = context;
    if (formData.expStartDate && new Date(value) < new Date(formData.expStartDate)) {
      return { isValid: false, msg: "The expected finish date has to be later than the expected start date." };
    }
    return { isValid: true };
  },

  // Strategy4: If same day, check the time conflict_1
  checkStartTimeBeforeEndTime: (value, context) => {
    const { formData } = context;
    const { expStartDate, expFinDate, expFinTime } = formData;
    
    const isSameDay = expStartDate && expFinDate && 
      new Date(expStartDate).toDateString() === new Date(expFinDate).toDateString();

    if (isSameDay && expFinTime) {
      const toMin = (t) => t.split(':').map(Number)[0] * 60 + t.split(':').map(Number)[1];
      if (toMin(value) >= toMin(expFinTime)) {
        return { isValid: false, msg: "The expected start time has to be earlier than the expected finish time." };
      }
    }
    return { isValid: true };
  },

  // Strategy5: If same day, check the time conflict_2
  checkEndTimeAfterStartTime: (value, context) => {
    const { formData } = context;
    const { expStartDate, expFinDate, expStartTime } = formData;
    
    const isSameDay = expStartDate && expFinDate && 
      new Date(expStartDate).toDateString() === new Date(expFinDate).toDateString();

    if (isSameDay && expStartTime) {
      const toMin = (t) => t.split(':').map(Number)[0] * 60 + t.split(':').map(Number)[1];
      if (toMin(value) <= toMin(expStartTime)) {
        return { isValid: false, msg: "The expected finish time has to be later than the expected start time." };
      }
    }
    return { isValid: true };
  }
};

// =========================================================================
// 2. Factory Method Pattern: According to the adjusted name of field, verify the information dynamically
// =========================================================================
export class ValidatorFactory {
  static createValidators(fieldName) {
    switch (fieldName) {
      case 'expStartDate':
        return [ValidationStrategies.checkLocationConflict, ValidationStrategies.checkStartDateBeforeEndDate];
      case 'expFinDate':
        return [ValidationStrategies.checkLocationConflict, ValidationStrategies.checkEndDateAfterStartDate];
      case 'expStartTime':
        return [ValidationStrategies.checkStartTimeBeforeEndTime];
      case 'expFinTime':
        return [ValidationStrategies.checkEndTimeAfterStartTime];
      default:
        return []; // Other fields don't require the dynamic verification
    }
  }
}