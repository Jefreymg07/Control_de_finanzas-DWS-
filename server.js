const express = require('express');
const session = require('express-session');
const path = require('path');
const pool = require('./src/config/db');
const Login = require('./src/models/Login');

const app = express();
const loginModel = new Login(pool);

// --- CONFIGURACIÓN ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // Para procesar los datos de los formularios

// Configuración de Sesiones seguras
app.use(session({
    secret: 'secreto_finanzas_123',
    resave: false,
    saveUninitialized: false
}));

// --- RUTAS DE NAVEGACIÓN ---

// 1. Mostrar vista de Login
app.get('/', (req, res) => {
    res.render('login');
});

// 2. Mostrar vista de Registro
app.get('/registro', (req, res) => {
    res.render('registro');
});

// 3. Procesar el formulario de Registro
app.post('/registro', async (req, res) => {
    const { nombre, usuario, password } = req.body;
    const exito = await loginModel.registrar(nombre, usuario, password);
    if (exito) {
        res.redirect('/'); // Si se registra bien, lo mandamos a loguearse
    } else {
        res.send('Error al registrar usuario. Verifica la consola.');
    }
});

// 4. Procesar el formulario de Login
app.post('/login', async (req, res) => {
    const { usuario, password } = req.body;
    const resultado = await loginModel.autenticar(usuario, password);

    if (resultado.autenticado) {
        req.session.userId = resultado.id;
        req.session.userName = resultado.nombre;
        res.redirect('/dashboard'); // Redirige al panel principal
    } else {
        res.send('Credenciales incorrectas');
    }
});

// 5. Dashboard Administrativo (Protegido)
app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/'); // Si alguien intenta entrar sin loguearse, lo saca
    }
    // Pasamos el nombre del usuario a la vista para el mensaje de bienvenida
    res.render('dashboard', { nombre: req.session.userName }); 
});

// 6. Ruta para Cerrar Sesión
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// --- INICIAR SERVIDOR ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});