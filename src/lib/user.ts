export const isSuperUser = (email: string) => {
  if (process.env.NEXT_PUBLIC_SUPERUSER?.includes(email)) {
    return true;
  } else {
    return false;
  }
};
