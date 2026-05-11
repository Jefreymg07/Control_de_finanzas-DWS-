class Balance {
    constructor(db) {
        this.db = db;
    }

    async obtenerReporteCompleto(id_usuario) {
        try {
            // 1. Obtener Entradas
            const queryEntradas = 'SELECT tipo_entrada AS detalle, monto FROM entradas WHERE id_usuario = ?';
            const [entradas] = await this.db.execute(queryEntradas, [id_usuario]);

            // 2. Obtener Salidas
            const querySalidas = 'SELECT tipo_salida AS detalle, monto FROM salidas WHERE id_usuario = ?';
            const [salidas] = await this.db.execute(querySalidas, [id_usuario]);

            // 3. Cálculos
            const totalEntradas = entradas.reduce((acc, curr) => acc + parseFloat(curr.monto), 0);
            const totalSalidas = salidas.reduce((acc, curr) => acc + parseFloat(curr.monto), 0);
            const balance = totalEntradas - totalSalidas;

            return {
                entradas,
                salidas,
                totalEntradas,
                totalSalidas,
                balance,
                success: true
            };
        } catch (error) {
            console.error("Error al generar balance:", error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = Balance;