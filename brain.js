const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para procesar JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal explícita para cargar el HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'id.html'));
});

// 'Base de datos' (voluntarios)
const padronSimulado = {
    '00112345673': 'Juan Carlos Pérez Rodríguez',
    '40212345674': 'María Fernanda Gómez Santos',
    '00100000008': 'Luis Alberto Martínez Díaz'
};


// Lógica del Algoritmo Módulo 10 en JavaScript
function validarCedulaModulo10(cedula) {
    // 1. Limpiar guiones o cualquier carácter que no sea número
    const cedulaLimpia = String(cedula).replace(/[^0-9]/g, '');

    // 2. Validar longitud exacta de 11 dígitos
    if (cedulaLimpia.length !== 11) {
        return {
            cedula: cedula,
            valida: false,
	    nombre: null,
            mensaje: ' (!) Cédula inválida: debe contener exactamente 11 dígitos numéricos.'
        };
    }

    // 3. Evitar números repetidos (ej. 00000000000)
    if (/^(\d)\1{10}$/.test(cedulaLimpia)) {
        return {
            cedula: cedula,
            valida: false,
	    nombre: null,
            mensaje: 'Cédula inválida: formato numérico no permitido.'
        };
    }

    // 4. Aplicar multiplicadores alternos (1 y 2) a los primeros 10 dígitos
    const multiplicadores = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 10; i++) {
        const digito = parseInt(cedulaLimpia[i], 10);
        let producto = digito * multiplicadores[i];

        if (producto >= 10) {
            producto = Math.floor(producto / 10) + (producto % 10);
        }

        suma += producto;
    }

    // 5. Calcular el dígito verificador esperado
    const residuo = suma % 10;
    const digitoVerificadorEsperado = residuo === 0 ? 0 : 10 - residuo;
    const digitoVerificadorReal = parseInt(cedulaLimpia[10], 10);

    const cedulaFormateada = `${cedulaLimpia.slice(0, 3)}-${cedulaLimpia.slice(3, 10)}-${cedulaLimpia[10]}`;

    // 6. Comparar con el último dígito de la cédula
    if (digitoVerificadorEsperado === digitoVerificadorReal) {
	const ciudadano = padronSimulado[cedulaLimpia] || '[ (X) Ciudadano no registrado entre los voluntarios ]';
        return {
            cedula: cedulaFormateada,
            valida: true,
            nombre: ciudadano,
            mensaje:  `Es correcta su cédula, titular: ${ciudadano}` 
        };
    } else {
        return {
            cedula: cedulaFormateada,
            valida: false,
	    nombre: null,
            mensaje: '(X) Cédula o id inconsistente (inválida)'
        };
    }
}

// Endpoint del Servicio Web (soporta POST y GET)
app.post('/api/validar', (req, res) => {
    const { cedula } = req.body;
    const resultado = validarCedulaModulo10(cedula || '');
    res.status(200).json(resultado);
});

app.get('/api/validar', (req, res) => {
    const cedula = req.query.cedula || '';
    const resultado = validarCedulaModulo10(cedula);
    res.status(200).json(resultado);
});

app.listen(PORT, () => {
    console.log(` (✓) Servicio Web corriendo en http://localhost:${PORT}`);
});
