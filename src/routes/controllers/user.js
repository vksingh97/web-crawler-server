const userService = require('../../services/user');

module.exports = {
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.invalid({ msg: 'email is required' });
      }
      if (!password) {
        return res.invalid({ msg: 'password is required' });
      }
      const response = await userService.loginUser({ email, password });
      if (response.ok) {
        return res.success({ data: response.data });
      }
      return res.failure({ msg: response.err });
    } catch (err) {
      console.error('error in loginUser:', err.stack);
      return res.failure({ msg: err.message });
    }
  },

  signupUser: async (req, res) => {
    try {
      const { email, password, username } = req.body;
      if (!email) {
        return res.invalid({ msg: 'Email is required' });
      }
      if (!password) {
        return res.invalid({ msg: 'Password is required' });
      }
      if (!username) {
        return res.invalid({ msg: 'Username is required' });
      }
      const response = await userService.signupUser({
        email,
        password,
        username,
      });
      if (response.ok) {
        return res.success({ data: response.data });
      }
      return res.failure({ msg: response.err });
    } catch (err) {
      console.error('error in signupUser:', err.stack);
      return res.failure({ msg: err.message });
    }
  },

  logoutUser: async function (req, res) {
    try {
      const authorization = req.headers.authorization;
      const response = await userService.logoutUser({ token: authorization });
      if (response.ok) {
        return res.success({ data: response.data });
      }
      return res.failure({ msg: response.err });
    } catch (err) {
      console.error('error in logoutUser:', err.stack);
      return res.failure({ msg: err.message });
    }
  },
};
