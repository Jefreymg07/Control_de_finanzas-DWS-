class Salida {
    constructor(data = {}) {
        this.id_salida = data.id_salida ?? null;
        this.tipo_salida = data.tipo_salida ?? '';
        this.monto = data.monto ?? 0;
        this.fecha = data.fecha ?? null;
        this.factura = data.factura ?? '';
        this.id_usuario = data.id_usuario ?? null;
        this.fecha_registro = data.fecha_registro ?? null;
    }

    static fromRow(row) {
        return new Salida(row);
    }
}

module.exports = Salida;
