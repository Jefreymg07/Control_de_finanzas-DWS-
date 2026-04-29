const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // Cambia esto si tu usuario de MySQL es diferente
    password: '', // Pon tu contraseña si tienes una configurada
    database: 'control_finanzas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;