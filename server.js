const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const pool = require('./src/config/db');
const Login = require('./src/models/Login');
const Entrada = require('./src/models/Entrada');
const balanceRoutes = require('./src/models/Balance');

const app = express();
const loginModel = new Login(pool);

// Configuración de multer para guardar facturas de entradas
const storageEntradas = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'uploads', 'entradas'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `entrada_${Date.now()}${ext}`);
    }
});
const fileFilterImagenes = (req, file, cb) => {
    const extensionesPermitidas = /\.(jpg|jpeg|png|gif)$/i;
    if (extensionesPermitidas.test(path.extname(file.originalname))) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, gif)'));
    }
};
const uploadEntrada = multer({ storage: storageEntradas, fileFilter: fileFilterImagenes });
const Balance = require('./src/models/Balance');
const balanceModel = new Balance(pool);

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

// 7. Dashboard Balance
app.get('/mostrar-balance', async (req, res) => {
    // Verificación de sesión
    if (!req.session.userId) {
        return res.redirect('/');
    }

    const reporte = await balanceModel.obtenerReporteCompleto(req.session.userId);

    if (reporte.success) {
        res.render('mostrar-balance', {
            entradas: reporte.entradas,
            salidas: reporte.salidas,
            totalEntradas: reporte.totalEntradas,
            totalSalidas: reporte.totalSalidas,
            balance: reporte.balance
        });
    } else {
        res.status(500).send("Error al procesar los datos financieros.");
    }
});

// --- RUTAS DE ENTRADAS (Persona 3) ---

// 7. Mostrar formulario Registrar Entrada
app.get('/registrar-entrada', (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    res.render('registrar-entrada', { error: null });
});

// 8. Procesar formulario Registrar Entrada
app.post('/registrar-entrada', (req, res) => {
    if (!req.session.userId) return res.redirect('/');

    uploadEntrada.single('factura')(req, res, async (err) => {
        if (err) {
            return res.render('registrar-entrada', { error: err.message });
        }
        const { tipo_entrada, monto, fecha } = req.body;
        const rutaFactura = req.file ? `/uploads/entradas/${req.file.filename}` : '';
        const entrada = new Entrada({ tipo_entrada, monto, fecha, factura: rutaFactura, id_usuario: req.session.userId });
        await entrada.guardar(pool);
        res.redirect('/ver-entradas');
    });
});

// 9. Ver todas las entradas del usuario
app.get('/ver-entradas', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    const entradas = await Entrada.obtenerTodas(pool, req.session.userId);
    res.render('ver-entradas', { entradas });
});

// --- INICIAR SERVIDOR ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// --- RUTAS DE SALIDAS (Persona 4) ---

const Salida = require('./src/models/Salida'); // Importar el modelo

const storageSalidas = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'uploads', 'salidas'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `salida_${Date.now()}${ext}`);
    }
});
const uploadSalida = multer({ storage: storageSalidas, fileFilter: fileFilterImagenes });

// Mostrar formulario Registrar Salida
app.get('/registrar-salida', (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    res.render('registrar-salida', { error: null });
});

// Procesar formulario Registrar Salida
app.post('/registrar-salida', (req, res) => {
    if (!req.session.userId) return res.redirect('/');

    uploadSalida.single('factura')(req, res, async (err) => {
        if (err) {
            return res.render('registrar-salida', { error: err.message });
        }
        const { tipo_salida, monto, fecha } = req.body;
        const rutaFactura = req.file ? `/uploads/salidas/${req.file.filename}` : '';
        const salida = new Salida({ tipo_salida, monto, fecha, factura: rutaFactura, id_usuario: req.session.userId });
        await salida.guardar(pool);
        res.redirect('/ver-salidas');
    });
});

// Ver todas las salidas
app.get('/ver-salidas', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    const salidas = await Salida.obtenerTodas(pool, req.session.userId);
    res.render('ver-salidas', { salidas });
});