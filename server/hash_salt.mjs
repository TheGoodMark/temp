import crypto from 'crypto';

const password = 'password';
const salt = crypto.randomBytes(16).toString('hex');

crypto.scrypt(password, salt, 32, (err, derivedKey) => {
  if (err) throw err;

  const hash = derivedKey.toString('hex');

  console.log('Salt: ', salt);
  console.log('Hash: ', hash);
});
