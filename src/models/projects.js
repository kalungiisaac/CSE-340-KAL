import db from './db.js';

const getProjectsReport = async () => {
    const allProjectsQuery = `
        SELECT
            p.project_id,
            p.organization_id,
            o.name AS organization_name,
            p.title,
            p.description,
            p.location,
            p.project_date,
            p.created_at
        FROM service_project p
        JOIN organization o ON o.organization_id = p.organization_id
        ORDER BY o.name, p.project_date;
    `;

    const totalCountQuery = `
        SELECT COUNT(*) AS total_projects
        FROM service_project;
    `;

    const countByOrgQuery = `
        SELECT
            o.name,
            COUNT(p.project_id) AS project_count
        FROM organization o
        LEFT JOIN service_project p ON o.organization_id = p.organization_id
        GROUP BY o.organization_id, o.name
        ORDER BY project_count DESC;
    `;

    const upcomingQuery = `
        SELECT
            o.name AS organization,
            p.title,
            p.location,
            p.project_date,
            p.created_at
        FROM service_project p
        JOIN organization o ON o.organization_id = p.organization_id
        WHERE p.project_date >= CURRENT_DATE
        ORDER BY p.project_date
        LIMIT 10;
    `;

    const [totalRes, allRes, countRes, upcomingRes] = await Promise.all([
        db.query(totalCountQuery),
        db.query(allProjectsQuery),
        db.query(countByOrgQuery),
        db.query(upcomingQuery)
    ]);

    return {
        totalProjects: Number(totalRes.rows[0]?.total_projects ?? 0),
        projects: allRes.rows,
        projectsByOrg: countRes.rows,
        upcomingProjects: upcomingRes.rows
    };

};

// Get all categories for a given project
const getCategoriesByProjectId = async (projectId) => {
    const query = `
        SELECT c.category_id, c.name, c.description
        FROM category c
        JOIN project_categories pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name;
    `;
    try {
        const result = await db.query(query, [projectId]);
        return result.rows;
    } catch (error) {
        // If the join table doesn't exist yet, return an empty list instead of crashing.
        if (error.code === '42P01') {
            return [];
        }
        throw error;
    }
};

const getUpcomingProjects = async (number_of_projects) => {
    // Show the most recent projects (both past and future) so the list is always populated
    const query = `
        SELECT
            p.project_id,
            p.title,
            p.description,
            p.project_date AS date,
            p.location,
            p.organization_id,
            o.name AS organization_name
        FROM service_project p
        JOIN organization o ON o.organization_id = p.organization_id
        ORDER BY p.project_date DESC
        LIMIT $1;
    `;

    const result = await db.query(query, [number_of_projects]);
    return result.rows;
};

const getProjectDetails = async (projectId) => {
    const query = `
        SELECT
            p.project_id,
            p.title,
            p.description,
            p.project_date AS date,
            p.location,
            p.organization_id,
            o.name AS organization_name
        FROM service_project p
        JOIN organization o ON o.organization_id = p.organization_id
        WHERE p.project_id = $1;
    `;

    const result = await db.query(query, [projectId]);
    return result.rows.length > 0 ? result.rows[0] : null;
};
const getProjectsByOrganizationId = async (organizationId) => {
      const query = `
        SELECT
          project_id,
          organization_id,
          title,
          description,
          location,
          project_date
        FROM service_project
        WHERE organization_id = $1
        ORDER BY project_date;
      `;
      
      const query_params = [organizationId];
      const result = await db.query(query, query_params);

      return result.rows;
};
const createProject = async (title, description, location, date, organizationId) => {
    const query = `
      INSERT INTO service_project (title, description, location, project_date, organization_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING project_id;
    `;

    const query_params = [title, description, location, date, organizationId];
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        throw new Error('Failed to create project');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new project with ID:', result.rows[0].project_id);
    }

    return result.rows[0].project_id;
}

const updateProject = async (projectId, title, description, location, date, organizationId) => {
    const query = `
      UPDATE service_project
      SET title = $1, description = $2, location = $3, project_date = $4, organization_id = $5
      WHERE project_id = $6
      RETURNING project_id;
    `;

    const query_params = [title, description, location, date, organizationId, projectId];
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        throw new Error('Project not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated project with ID:', projectId);
    }

    return result.rows[0].project_id;
};

// Export the model functions
export { getProjectsReport, getUpcomingProjects, getProjectDetails, getProjectsByOrganizationId, getCategoriesByProjectId, createProject, updateProject };