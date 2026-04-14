import db from './db.js';

const getAdminStats = async () => {
    const queries = {
        userCount: 'SELECT COUNT(*) FROM users',
        projectCount: 'SELECT COUNT(*) FROM service_project',
        orgCount: 'SELECT COUNT(*) FROM organization',
        volunteerCount: 'SELECT COUNT(*) FROM volunteer',
        categoryCount: 'SELECT COUNT(*) FROM category'
    };

    const stats = {};
    for (const [key, sql] of Object.entries(queries)) {
        const result = await db.query(sql);
        stats[key] = parseInt(result.rows[0].count, 10);
    }

    // Get recent signups
    const recentUsersQuery = `
        SELECT user_id, name, email, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 5
    `;
    const recentUsers = await db.query(recentUsersQuery);
    stats.recentUsers = recentUsers.rows;

    // Get top projects by volunteer count
    const topProjectsQuery = `
        SELECT p.project_id, p.title, COUNT(v.volunteer_id) as volunteer_count
        FROM service_project p
        LEFT JOIN volunteer v ON p.project_id = v.project_id
        GROUP BY p.project_id, p.title
        ORDER BY volunteer_count DESC
        LIMIT 5
    `;
    const topProjects = await db.query(topProjectsQuery);
    stats.topProjects = topProjects.rows;

    return stats;
};

export { getAdminStats };
