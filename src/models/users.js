import bcrypt from 'bcrypt';
import db from './db.js'

const countUsers = async () => {
    const query = `SELECT COUNT(*) as count FROM users`;
    const result = await db.query(query);
    return parseInt(result.rows[0].count, 10);
};

const createUser = async (name, email, username, passwordHash, roleName = 'user') => {
    const query = `
        INSERT INTO users (name, email, username, password_hash, role_id) 
        VALUES ($1, $2, $3, $4, (SELECT role_id FROM roles WHERE role_name = $5)) 
        RETURNING user_id
    `;
    const query_params = [name, email, username, passwordHash, roleName];
    
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

const findUserByEmail = async (email) => {
    const query = `
        SELECT u.user_id, u.name, u.email, u.username, u.password_hash, r.role_name 
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1
    `;
    const query_params = [email];
    
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        return null; // User not found
    }
    
    return result.rows[0];
};

const findUserByEmailOrUsername = async (identifier) => {
    const query = `
        SELECT u.user_id, u.name, u.email, u.username, u.password_hash, r.role_name 
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1 OR u.username = $1
    `;
    const query_params = [identifier];
    
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        return null; // User not found
    }
    
    return result.rows[0];
};

const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

const authenticateUser = async (identifier, password) => {
    const user = await findUserByEmailOrUsername(identifier);
    if (!user) {
        return null;
    }

    const isPasswordCorrect = await verifyPassword(password, user.password_hash);
    if (isPasswordCorrect) {
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    return null;
};

const updatePassword = async (email, passwordHash) => {
    const query = `
        UPDATE users 
        SET password_hash = $1 
        WHERE email = $2
        RETURNING user_id
    `;
    const query_params = [passwordHash, email];
    
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        throw new Error('User not found');
    }

    return result.rows[0].user_id;
};

export { createUser, authenticateUser, updatePassword, findUserByEmail, findUserByEmailOrUsername, countUsers };