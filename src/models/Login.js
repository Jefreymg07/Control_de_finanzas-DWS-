const bcrypt = require('bcrypt');

class Login {
    constructor(db) {
        this.db = db;
    }

    // Método para registrar un usuario
    async registrar(nombre, usuario, password) {
        try {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            const query = 'INSERT INTO usuarios (nombre, usuario, password) VALUES (?, ?, ?)';
            const [resultado] = await this.db.execute(query, [nombre, usuario, passwordHash]);
            
            return resultado.insertId ? true : false;
        } catch (error) {
            console.error("Error al registrar:", error);
            return false;
        }
    }

    // Método para validar el login
    async autenticar(usuario, password) {
        try {
            const query = 'SELECT id_usuario AS id, nombre, password FROM usuarios WHERE usuario = ?';
            const [rows] = await this.db.execute(query, [usuario]);

            if (rows.length > 0) {
                const user = rows[0];
                const validPassword = await bcrypt.compare(password, user.password);
                
                if (validPassword) {
                    return { autenticado: true, id: user.id, nombre: user.nombre };
                }
            }
            return { autenticado: false };
        } catch (error) {
            console.error("Error al autenticar:", error);
            return { autenticado: false };
        }
    }
}

module.exports = Login;