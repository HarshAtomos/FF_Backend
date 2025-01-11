export const validateRoleCreation = (roleName, { exposure, commission }) => {
  if (roleName === "player") {
    if (exposure == null || commission == null) {
      return {
        isValid: false,
        error: "Exposure and Commission are required for players",
      };
    }
    if (commission < 0 || commission > 100) {
      return { isValid: false, error: "Commission must be between 0 and 100" };
    }
  }
  // Add other role-specific validations here if needed
  return { isValid: true };
};
