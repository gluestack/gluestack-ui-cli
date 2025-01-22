import { jwtDecode } from 'jwt-decode';

const checkTokenExpiry = (token: string) => {
  if (!token) return false;

  const decodedAccessToken = jwtDecode(token);

  if ((decodedAccessToken?.exp ?? 0) * 1000 < Date.now()) {
    return true;
  }
  return false;
};

export default checkTokenExpiry;
