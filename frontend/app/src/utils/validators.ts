export function validateUsername(username: string): boolean {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,12}$/;
  return regex.test(username);
}

export function validatePassword(password: string): boolean {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{12}$/;
  return regex.test(password);
}
