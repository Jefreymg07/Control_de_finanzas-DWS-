class Entrada {
    constructor(data = {}) {
        this.id_entrada = data.id_entrada ?? null;
        this.tipo_entrada = data.tipo_entrada ?? '';
        this.monto = data.monto ?? 0;
        this.fecha = data.fecha ?? null;
        this.factura = data.factura ?? '';
        this.id_usuario = data.id_usuario ?? null;
        this.fecha_registro = data.fecha_registro ?? null;
    }

    static fromRow(row) {
        return new Entrada(row);
    }

    async guardar(pool) {
        const sql = `INSERT INTO entradas (tipo_entrada, monto, fecha, factura, id_usuario)
                     VALUES (?, ?, ?, ?, ?)`;
        const [result] = await pool.execute(sql, [
            this.tipo_entrada,
            this.monto,
            this.fecha,
            this.factura,
            this.id_usuario
        ]);
        this.id_entrada = result.insertId;
        return this;
    }

    static async obtenerTodas(pool, id_usuario) {
        const sql = `SELECT * FROM entradas WHERE id_usuario = ? ORDER BY fecha DESC`;
        const [rows] = await pool.execute(sql, [id_usuario]);
        return rows.map(row => Entrada.fromRow(row));
    }
}

module.exports = Entrada;
