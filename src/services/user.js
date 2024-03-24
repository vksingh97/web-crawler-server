const bcrypt = require('bcrypt');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET_KEY;
const userModel = require('../models/user');
const blacklistjwtModel = require('../models/blacklistjwt');
const jwt = require('jsonwebtoken');

async function generateToken({ email }) {
  try {
    const token = jwt.sign({ email }, secretKey, {
      expiresIn: '1d',
    });
    return token;
  } catch (err) {
    console.error('error in generating token:', err.stack);
    return '';
  }
}

module.exports = {
  loginUser: async ({ email, password }) => {
    try {
      const userDetails = await userModel.findOne({
        query: {
          email: email,
        },
      });
      if (!userDetails || !Object.keys(userDetails).length) {
        return { ok: false, err: 'User not found with given email' };
      }
      const isPasswordValid = await bcrypt.compare(
        password,
        userDetails.password
      );
      if (!isPasswordValid) {
        return { ok: false, err: 'Password doesnot match' };
      }
      const token = await generateToken({ email });
      return { ok: true, data: token };
    } catch (err) {
      console.error('Error in loginUser service:', err.stack);
      return { ok: false, err: err.message };
    }
  },

  signupUser: async ({ email, password, username }) => {
    try {
      const userDetails = await userModel.findOne({
        query: {
          email: email,
        },
        projection: { _id: 1 },
      });
      if (userDetails && Object.keys(userDetails).length) {
        return {
          ok: false,
          err: 'Email already exists please try with a different email',
        };
      }
      const decryptedPassword = await bcrypt.hash(password, 10);
      await userModel.create({
        insertDict: {
          email: email,
          password: decryptedPassword,
          name: username,
        },
      });
      const token = await generateToken({ email });
      return { ok: true, data: token };
    } catch (err) {
      console.error('Error in signupUser service:', err.stack);
      return { ok: false, err: err.message };
    }
  },
  logoutUser: async ({ token }) => {
    try {
      await blacklistjwtModel.create({
        insertDict: {
          token,
        },
      });
      return { ok: true, data: 'Successfully Logged Out' };
    } catch (err) {
      console.error('Error in logoutUser service:', err.stack);
      return { ok: false, err: err.message };
    }
  },
};
