const bcrypt = require('bcryptjs')

const hashPassword = async (password:any) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};

 const comparePassword = async (password:any, hashedPassword:any) => {
  return bcrypt.compare(password, hashedPassword);
};

module.exports  = { hashPassword, comparePassword }

//-----------conform password------------------------\\
const hashconformPassword = async (conformPassword:any) => {
  try {
    const saltRounds = 10;
    const hashedconformPassword = await bcrypt.hash(conformPassword, saltRounds);
    return hashedconformPassword;
  } catch (error) {
    console.log(error);
  }
};

//  const compareconformPassword = async (conformpassword, hashedconformPassword) => {
//   return bcrypt.compare(conformpassword, hashedconformPassword);
// };

module.exports  = { hashPassword, comparePassword, hashconformPassword, }