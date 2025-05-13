import { hashPassword } from './auth-utils';
import { pool } from './db';

async function resetAdminPassword() {
  try {
    // Senha simples para o admin: "admin123"
    const newPassword = 'admin123';
    const hashedPassword = await hashPassword(newPassword);
    
    // Atualizar senha no banco de dados
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE username = $2 RETURNING id',
      [hashedPassword, 'admin']
    );
    
    if (result.rowCount === 1) {
      console.log('Senha do usuário admin redefinida com sucesso!');
      console.log('Nova senha: admin123');
    } else {
      console.log('Usuário admin não encontrado.');
    }
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
  } finally {
    await pool.end();
  }
}

resetAdminPassword();