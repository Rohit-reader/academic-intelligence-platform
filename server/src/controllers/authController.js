const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const { sendSuccess, sendError } = require('../utils/response');
const { logAudit } = require('../middleware/audit');
const SecurityAlert = require('../models/SecurityAlert');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_academic_intelligence_jwt_key_2026', {
    expiresIn: '7d',
  });
};

// @desc    Login user & get JWT token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 400);
    }

    const user = await User.findOne({ email }).populate('department');

    if (!user) {
      await logAudit(req, 'LOGIN_FAILED', 'USER', '', `Failed login attempt for email: ${email}`);
      return sendError(res, 'Invalid credentials', 401);
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await logAudit(req, 'LOGIN_FAILED', 'USER', user._id.toString(), `Incorrect password for user: ${email}`);
      return sendError(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account deactivated. Please contact Administrator.', 403);
    }

    const token = generateToken(user._id);

    // Fetch related profile if Faculty or Student
    let facultyProfile = null;
    let studentProfile = null;

    if (user.role === 'FACULTY' || user.role === 'HOD') {
      facultyProfile = await Faculty.findOne({ user: user._id });
    } else if (user.role === 'STUDENT') {
      studentProfile = await Student.findOne({ user: user._id }).populate('section');
    }

    await logAudit({ user }, 'USER_LOGIN', 'USER', user._id.toString(), `User ${user.email} logged in successfully.`);

    return sendSuccess(res, {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        avatar: user.avatar,
        facultyProfile,
        studentProfile,
      },
    }, 'Logged in successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// @desc    Register new user (Admin only)
// @route   POST /api/auth/register
// @access  Private/Admin
const register = async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 'User with this email already exists', 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'STUDENT',
      department: department || null,
      phone: phone || '',
    });

    await logAudit(req, 'USER_REGISTERED', 'USER', user._id.toString(), `Created user ${user.email} with role ${user.role}`);

    return sendSuccess(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    }, 'User registered successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('department');

    let facultyProfile = null;
    let studentProfile = null;

    if (user.role === 'FACULTY' || user.role === 'HOD') {
      facultyProfile = await Faculty.findOne({ user: user._id });
    } else if (user.role === 'STUDENT') {
      studentProfile = await Student.findOne({ user: user._id }).populate('section');
    }

    return sendSuccess(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        avatar: user.avatar,
        facultyProfile,
        studentProfile,
      },
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = { login, register, getMe };
