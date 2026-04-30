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
}

module.exports = Entrada;
