import { Database } from './database.js';
import { randomUUID } from 'node:crypto';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [ 
    {
        method: 'GET',
        path: buildRoutePath('/users'),
        handler: (req, res) => {
            try {
                const users = database.select('users');
    
                if (users.length === 0) {
                    return res.writeHead(404, { 'Content-Type': 'application/json' }).end(JSON.stringify({ success: false, message: 'Nenhum usuário encontrado.' }));
                }
    
                return res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(users));
            } catch (error) {
                console.error('Erro ao obter usuários:', error);
                return res.writeHead(500, { 'Content-Type': 'application/json' }).end(JSON.stringify({ success: false, message: 'Erro ao obter usuários.' }));
            }
        }
    },
    
    {
        method: 'POST',
        path: buildRoutePath('/users'),
        handler: (req, res) => {
            try {
                const { name, email } = req.body;
                const user = {
                    id: randomUUID(),
                    name,
                    email,
                    createdAt: new Date().toISOString(), // Adiciona a data de criação
                };
                database.insert('users', user);
        
                // Verificar se o usuário foi inserido corretamente
                const insertedUser = database.select('users').find(u => u.id === user.id);
                if (insertedUser) {
                    return res.writeHead(201).end(JSON.stringify({ success: true, message: 'Usuário criado com sucesso.', user }));
                } else {
                    throw new Error('Erro ao criar usuário.');
                }
            } catch (error) {
                console.error('Erro ao processar a requisição:', error);
                return res.writeHead(400).end(JSON.stringify({ success: false, message: 'Erro ao criar usuário.' }));
            }
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/users/:id'),
        handler: (req, res) => {
            try {
                const id = req.url.split('/').pop(); // Extrair o ID da URL
                const { name, email } = req.body;
    
                if (!name || !email) {
                    return res.writeHead(400).end(
                        JSON.stringify({ message: 'name and email are required' })
                    );
                }
    
                // Tente atualizar o usuário com o ID fornecido
                const updatedUser = database.update('users', id, { name, email });
    
                if (!updatedUser) {
                    return res.writeHead(404).end(
                        JSON.stringify({ message: 'User not found' })
                    );
                }
    
                return res.writeHead(200).end(
                    JSON.stringify({ message: 'User updated successfully', updatedUser })
                );
            } catch (error) {
                console.error('Error:', error);
                return res.writeHead(500).end(
                    JSON.stringify({ message: 'Internal Server Error' })
                );
            }
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/users/:id'),
        handler: (req, res) => {
        const urlParts = req.url.split('/');
        const id = urlParts[urlParts.length - 1];

    
            // Verifique se o usuário existe no banco de dados
            const userIndex = database.select('users').findIndex(user => user.id === id);
    
            if (userIndex === -1) {
                return res.writeHead(404).end(JSON.stringify({ success: false, message: 'Usuário não encontrado.' }));
            }
    
            // Remova o usuário do banco de dados
            database.delete('users', id);
    
            return res.writeHead(200).end(JSON.stringify({ success: true, message: 'Usuário excluído com sucesso.' }));
        },
    }
    
    
];
