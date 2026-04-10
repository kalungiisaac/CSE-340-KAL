import express from 'express';

import { showHomePage } from './index.js';
import { 
  showOrganizationsPage, 
  showOrganizationDetailsPage, 
  showNewOrganizationForm, 
  processNewOrganizationForm,
  organizationValidation,
  showEditOrganizationForm,
  processEditOrganizationForm 
} from './organizations.js';
import { 
  showProjectsPage, 
  showProjectDetailsPage,
  showNewProjectForm,
  processNewProjectForm,
  projectValidation,
  showEditProjectForm,
  processEditProjectForm,
  processAddVolunteer,
  processRemoveVolunteer
} from './projects.js';
import { 
  showCategoriesPage, 
  showCategoryDetailsPage,
  showAssignCategoriesForm,
  processAssignCategoriesForm,
  showNewCategoryForm,
  processNewCategoryForm,
  showEditCategoryForm,
  processEditCategoryForm,
  categoryValidation
} from './categories.js';
import { testErrorPage } from './errors.js';
import { 
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
  , showAllUsers
} from './users.js';

const router = express.Router();

router.get('/', showHomePage);

// User registration routes
router.get('/register', showUserRegistrationForm);
router.post('/register', processUserRegistrationForm);

// User login routes
router.get('/login', showLoginForm);
router.post('/login', processLoginForm);
router.get('/logout', processLogout);

// Forgot/Reset password routes
router.get('/forgot-password', showForgotPasswordForm);
router.post('/forgot-password', processForgotPasswordForm);
router.get('/reset-password', showResetPasswordForm);
router.post('/reset-password', processResetPasswordForm);

// Protected dashboard route
router.get('/dashboard', requireLogin, showDashboard);

// Admin users list
router.get('/admin/users', requireRole('admin'), showAllUsers);

// Project routes
router.get('/projects', showProjectsPage);
router.get('/new-project', requireRole('admin'), showNewProjectForm);
router.post('/new-project', requireRole('admin'), projectValidation, processNewProjectForm);
router.get('/edit-project/:id', requireRole('admin'), showEditProjectForm);
router.post('/edit-project/:id', requireRole('admin'), projectValidation, processEditProjectForm);
router.get('/project/:id', showProjectDetailsPage);

// Volunteer routes
router.post('/volunteer/:id', requireLogin, processAddVolunteer);
router.post('/remove-volunteer/:id', requireLogin, processRemoveVolunteer);

// Organization routes
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/new-organization', requireRole('admin'), showNewOrganizationForm);
router.post('/new-organization', requireRole('admin'), organizationValidation, processNewOrganizationForm);
router.get('/edit-organization/:id', requireRole('admin'), showEditOrganizationForm);
router.post('/edit-organization/:id', requireRole('admin'), organizationValidation, processEditOrganizationForm);

// Category routes
router.get('/categories', showCategoriesPage);
router.get('/new-category', requireRole('admin'), showNewCategoryForm);
router.post('/new-category', requireRole('admin'), categoryValidation, processNewCategoryForm);
router.get('/edit-category/:id', requireRole('admin'), showEditCategoryForm);
router.post('/edit-category/:id', requireRole('admin'), categoryValidation, processEditCategoryForm);
router.get('/assign-categories/:projectId', requireRole('admin'), showAssignCategoriesForm);
router.post('/assign-categories/:projectId', requireRole('admin'), processAssignCategoriesForm);
router.get('/category/:id', showCategoryDetailsPage);

// error-handling routes
router.get('/test-error', testErrorPage);

export default router;
