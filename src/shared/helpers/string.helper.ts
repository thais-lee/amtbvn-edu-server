import * as bcrypt from 'bcrypt';

export const randomString = (length: number = 64, bcryptSalt = 10) => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`!@#$%^&*()_~+-=';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return generateHash(result, bcryptSalt);
};

export const generateHash = (password: string, bcryptSalt = 10) => {
  return bcrypt.hash(password, bcryptSalt);
};

export const compareHash = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
