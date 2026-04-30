class Usuario {
    constructor(data = {}) {
        this.id_usuario = data.id_usuario ?? null;
        this.nombre = data.nombre ?? '';
        this.usuario = data.usuario ?? '';
        this.password = data.password ?? '';
        this.rol = data.rol ?? 'usuario';
        this.fecha_creacion = data.fecha_creacion ?? null;
    }

    static fromRow(row) {
        return new Usuario(row);
    }
}

module.exports = Usuario;
