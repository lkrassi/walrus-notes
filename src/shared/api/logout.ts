export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
