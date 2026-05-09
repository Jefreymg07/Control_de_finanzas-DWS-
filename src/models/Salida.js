class Salida {
    constructor(data = {}) {
        this.id_salida = data.id_salida ?? null;
        this.tipo_salida = data.tipo_salida ?? '';
        this.monto = data.monto ?? 0;
        this.fecha = data.fecha ?? null;
        this.factura = data.factura ?? '';
        this.id_usuario = data.id_usuario ?? null;
    }

    static fromRow(row) {
        return new Salida(row);
    }

    async guardar(pool) {
        const sql = `INSERT INTO salidas (tipo_salida, monto, fecha, factura, id_usuario)
                     VALUES (?, ?, ?, ?, ?)`;
        const [result] = await pool.execute(sql, [
            this.tipo_salida,
            this.monto,
            this.fecha,
            this.factura,
            this.id_usuario
        ]);
        this.id_salida = result.insertId;
        return this;
    }

    static async obtenerTodas(pool, id_usuario) {
        const sql = `SELECT * FROM salidas WHERE id_usuario = ? ORDER BY fecha DESC`;
        const [rows] = await pool.execute(sql, [id_usuario]);
        return rows.map(row => Salida.fromRow(row));
    }
}

module.exports = Salida;