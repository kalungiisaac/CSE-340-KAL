import bcrypt from 'bcrypt';
import { createUser, authenticateUser, updatePassword, findUserByEmail, countUsers } from '../models/users.js';

const showForgotPasswordForm = (req, res) => {
    res.render('forgot-password', { title: 'Forgot Password' });
};

const processForgotPasswordForm = async (req, res) => {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (user) {
        // In a real app, send email with token. Here, we just redirect.
        res.render('reset-password', { title: 'Reset Password', email: email });
    } else {
        req.flash('error', 'Email not found.');
        res.redirect('/forgot-password');
    }
};

const showResetPasswordForm = (req, res) => {
    const { email } = req.query;
    res.render('reset-password', { title: 'Reset Password', email: email });
};

const processResetPasswordForm = async (req, res) => {
    const { email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        req.flash('error', 'Passwords do not match.');
        return res.render('reset-password', { title: 'Reset Password', email: email });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        await updatePassword(email, passwordHash);
        req.flash('success', 'Password updated successfully! Please log in.');
        res.redirect('/login');
    } catch (error) {
        console.error('Error updating password:', error);
        req.flash('error', 'Failed to update password.');
        res.redirect('/forgot-password');
    }
};

const showUserRegistrationForm = (req, res) => {
    res.render('register', { title: 'Register' });
};

const processUserRegistrationForm = async (req, res) => {
    const { name, email, username, password } = req.body;

    try {
        // Hash the password before storing it
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Check if this is the first user
        const userCount = await countUsers();
        const role = userCount === 0 ? 'admin' : 'user';

        // Create the user in the database
        const userId = await createUser(name, email, username, passwordHash, role);

        // Show appropriate message
        const message = role === 'admin' 
            ? 'Registration successful! You are set as an admin account. Please log in.'
            : 'Registration successful! Please log in.';
        
        req.flash('success', message);
        res.redirect('/');
    } catch (error) {
        console.error('Error registering user:', error);
        req.flash('error', 'An error occurred during registration. Please try again.');
        res.redirect('/register');
    }
};

const showLoginForm = (req, res) => {
    res.render('login', { title: 'Login' });
};

const processLoginForm = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        const user = await authenticateUser(identifier, password);
        if (user) {
            // Store user info in session
            req.session.user = user;
            req.flash('success', 'Login successful!');

            if (process.env.NODE_ENV === 'development') {
                console.log('User logged in:', user);
            }

            res.redirect('/dashboard');
        } else {
            req.flash('error', 'Invalid email/username or password.');
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error during login:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

const processLogout = async (req, res) => {
    if (req.session.user) {
        delete req.session.user;
    }

    req.flash('success', 'Logout successful!');
    res.redirect('/login');
};

const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }
    next();
};

const showDashboard = (req, res) => {
    const user = req.session.user;
    res.render('dashboard', { 
        title: 'Dashboard',
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role_name
    });
};

/**
 * Middleware factory to require specific role for route access
 * Returns middleware that checks if user has the required role
 * 
 * @param {string} role - The role name required (e.g., 'admin', 'user')
 * @returns {Function} Express middleware function
 */
const requireRole = (role) => {
    return (req, res, next) => {
        // Check if user is logged in first
        if (!req.session || !req.session.user) {
            req.flash('error', 'You must be logged in to access this page.');
            return res.redirect('/login');
        }

        // Check if user's role matches the required role
        if (req.session.user.role_name !== role) {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/');
        }

        // User has required role, continue
        next();
    };
};

export { 
    showUserRegistrationForm, 
    processUserRegistrationForm, 
    showLoginForm, 
    processLoginForm, 
    processLogout,
    requireLogin,
    showDashboard,
    requireRole,
    showForgotPasswordForm,
    processForgotPasswordForm,
    showResetPasswordForm,
    processResetPasswordForm
};