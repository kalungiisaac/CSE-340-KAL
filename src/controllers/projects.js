// Import any needed model functions
import { body, validationResult } from 'express-validator';
import { getUpcomingProjects, getProjectDetails, getCategoriesByProjectId, createProject, updateProject, addVolunteer, removeVolunteer, isUserVolunteer } from '../models/projects.js';
import { getAllOrganizations } from '../models/organizations.js';

const NUMBER_OF_UPCOMING_PROJECTS = 50;

// Define validation rules for projects
const projectValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required')
        .isLength({ max: 200 }).withMessage('Location must be less than 200 characters'),
    body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Date must be a valid date format'),
    body('organizationId')
        .notEmpty().withMessage('Organization is required')
        .isInt().withMessage('Organization must be a valid integer')
];

// Define any controller functions

const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);


        const title = 'Upcoming Service Projects';
        res.render('projects', { title, projects });
    } catch (error) {
        next(error);
    }
};

const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await getProjectDetails(projectId);
        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            throw err;
        }
        // Get categories for this project
        const categories = await getCategoriesByProjectId(projectId);
        
        // Check if user is logged in and if they're already volunteering
        let isVolunteering = false;
        const user = req.session?.user || null;
        if (user) {
            isVolunteering = await isUserVolunteer(user.user_id, projectId);
        }
        
        const title = 'Service Project Details';
        res.render('project', { title, project, categories, user, isVolunteering });
    } catch (error) {
        next(error);
    }
};

const showNewProjectForm = async (req, res, next) => {
    try {
        console.log('Rendering new project form');
        const organizations = await getAllOrganizations();
        const title = 'Add New Service Project';
        res.render('new-project', { title, organizations });
    } catch (error) {
        console.error('Error in showNewProjectForm:', error);
        next(error);
    }
}

const processNewProjectForm = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Loop through validation errors and flash them
            errors.array().forEach((error) => {
                req.flash('error', error.msg);
            });

            // Redirect back to the new project form
            return res.redirect('/new-project');
        }

        // Extract form data from req.body
        const { title, description, location, date, organizationId } = req.body;

        try {
            // Create the new project in the database
            const newProjectId = await createProject(title, description, location, date, organizationId);

            req.flash('success', 'New service project created successfully!');
            res.redirect(`/project/${newProjectId}`);
        } catch (error) {
            console.error('Error creating new project:', error);
            req.flash('error', 'There was an error creating the service project.');
            res.redirect('/new-project');
        }
    } catch (error) {
        next(error);
    }
};

const showEditProjectForm = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await getProjectDetails(projectId);
        
        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            throw err;
        }

        const organizations = await getAllOrganizations();
        const title = 'Edit Service Project';
        res.render('edit-project', { title, project, organizations });
    } catch (error) {
        next(error);
    }
};

const processEditProjectForm = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect(`/edit-project/${projectId}`);
        }

        const { title, description, location, date, organizationId } = req.body;

        await updateProject(projectId, title, description, location, date, organizationId);

        req.flash('success', 'Service project updated successfully!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

const processAddVolunteer = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const userId = req.session.user.user_id;

        // Add the volunteer record
        await addVolunteer(userId, projectId);

        req.flash('success', 'You have successfully volunteered for this project!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        if (error.message.includes('duplicate key')) {
            req.flash('error', 'You are already volunteering for this project.');
        } else {
            req.flash('error', 'There was an error volunteering for the project.');
        }
        res.redirect(`/project/${req.params.id}`);
    }
};

const processRemoveVolunteer = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const userId = req.session.user.user_id;

        // Remove the volunteer record
        await removeVolunteer(userId, projectId);

        req.flash('success', 'You have been removed as a volunteer from this project.');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        req.flash('error', 'There was an error removing your volunteer status.');
        res.redirect(`/project/${req.params.id}`);
    }
};

// Export any controller functions
export { 
    showProjectsPage, 
    showProjectDetailsPage, 
    showNewProjectForm, 
    processNewProjectForm, 
     projectValidation,
     showEditProjectForm,
     processEditProjectForm,
     processAddVolunteer,
     processRemoveVolunteer
};
