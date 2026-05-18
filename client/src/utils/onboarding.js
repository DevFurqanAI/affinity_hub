export const needsEmailVerification = (user) => {
  return user?.authProvider === "local" && user?.isVerified === false;
};

export const needsProfileSetup = (user) => {
  return user?.profileSetupCompleted === false;
};

export const needsInterestsSetup = (user) => {
  return user?.interestsSetupCompleted === false;
};

export const getNextOnboardingPath = (user) => {
  if (!user) {
    return "/login";
  }

  if (needsEmailVerification(user)) {
    return "/verify-email";
  }

  if (needsProfileSetup(user)) {
    return "/complete-profile";
  }

  if (needsInterestsSetup(user)) {
    return "/choose-interests";
  }

  return "/home";
};