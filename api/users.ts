import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from './_db.js';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    const { method } = request;

    try {
        if (method === 'GET') {
            const { firebaseUid } = request.query;

            if (firebaseUid) {
                const users = await sql`SELECT * FROM users WHERE firebase_uid = ${firebaseUid as string} `;
                return response.status(200).json(users[0]);
            }

            // Admin: All users
            const allUsers = await sql`SELECT * FROM users ORDER BY created_at DESC`;
            return response.status(200).json(allUsers);
        }

        if (method === 'POST') {
            const { firebaseUid, email, phone, fullName, role } = request.body;
            const [user] = await sql`
        INSERT INTO users(firebase_uid, email, phone, full_name, role)
        VALUES(
          ${firebaseUid},
          ${email || null},
          ${phone || null},
          ${fullName || 'New User'},
          ${role}
        )
        RETURNING *
      `;
            return response.status(201).json(user);
        }

        if (method === 'PATCH') {
            const { id, full_name, phone, email } = request.body;
            if (full_name) await sql`UPDATE users SET full_name = ${full_name} WHERE id = ${id} `;
            if (phone) await sql`UPDATE users SET phone = ${phone} WHERE id = ${id} `;
            if (email) await sql`UPDATE users SET email = ${email} WHERE id = ${id} `;
            return response.status(200).json({ success: true });
        }

        return response.status(405).json({ error: 'Method Not Allowed' });
    } catch (error: any) {
        console.error('User API Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
