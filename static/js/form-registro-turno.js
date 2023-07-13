/* BOTON DE VOLVER A INICIO */
const reloadButton = document.getElementById('reload-btn');

reloadButton.addEventListener('click', () => {
    location.reload();
});

/* GET ELEMENTOS DEL HTML INICIO*/
const form = document.getElementById("form");
const nombre_cliente = document.getElementById("client-name");
const nombre_mascota = document.getElementById("pet-name");
const fecha = document.getElementById("date");
const horario = document.getElementById("time");
const email = document.getElementById("email");
const exito = document.getElementById("exito");

/* FUNCIONES PARA VALIDAR */
function validarCaracteresEspeciales(input) {
    let valor = input.value.trim();
    let caracteresEspeciales = /[!@#$%^&*(),.?":{}|<>0-9]/;

    if (caracteresEspeciales.test(valor)) {
        return false;
    } else {
        return true;
    }
}

function validarFecha(fechaInput) {
    const fechaActual = moment();
    const fechaIngresada = moment(fechaInput.value, "YYYY-MM-DD");

    if (!fechaIngresada.isValid()) {
        return false;
    }

    if (fechaIngresada.isBefore(fechaActual) || fechaIngresada.day() === 0) {
        return false;
    }

    return true;
}

function validarHorario(horarioInput, fechaInput) {
    const horarioIngresado = luxon.DateTime.fromFormat(horarioInput, 'HH:mm');
    const diaSemana = moment(fechaInput).isoWeekday();

    if (diaSemana >= 1 && diaSemana <= 5) { // Lunes a Viernes
        const horaAperturaLunesViernes = luxon.DateTime.fromObject({ hour: 9, minute: 0 });
        const horaCierreLunesViernes = luxon.DateTime.fromObject({ hour: 18, minute: 0 });

        if (horarioIngresado < horaAperturaLunesViernes || horarioIngresado >= horaCierreLunesViernes) {
            return false;
        }
    } else if (diaSemana === 6) { // Sábado
        const horaAperturaSabado = luxon.DateTime.fromObject({ hour: 10, minute: 0 });
        const horaCierreSabado = luxon.DateTime.fromObject({ hour: 16, minute: 0 });

        if (horarioIngresado < horaAperturaSabado || horarioIngresado >= horaCierreSabado) {
            return false;
        }
    } else {
        return false; // Otros días de la semana no válidos
    }

    return true; // Horario válido
}

/* EVENTO SUBMIT FORMULARIO DE CREACION DE TURNOS */
form.addEventListener("submit", (e) => {
    e.preventDefault();

    let mensaje = document.getElementById('mensaje');

    if ((nombre_cliente.value.length == 0) || (nombre_mascota.value.length == 0) || (fecha.value.length == 0) || (horario.value.length == 0) || (email.value.length == 0)) {
        mensaje.innerHTML = `<p class="mensaje-error">No puedes dejar ningún campo vacío.</p>`;
    } else if (!validarCaracteresEspeciales(nombre_cliente) || !validarCaracteresEspeciales(nombre_mascota)) {
        mensaje.innerHTML = `<p class="mensaje-error">No se permiten caracteres especiales ni números en el nombre del cliente y tampoco en el de tu mascota.</p>`;
    } else if (!validarFecha(fecha)) {
        mensaje.innerHTML = `<p class="mensaje-error">La fecha ingresada es incorrecta.</p>`;
    } else if (!validarHorario(horario.value, fecha.value)) {
        mensaje.innerHTML = `<p class="mensaje-error">El horario ingresado está fuera del horario permitido.</p>`;
    } else {
        const URL = "http://matiasss.pythonanywhere.com/";

        fetch(URL + 'turnos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre_cliente.value,
                mascota: nombre_mascota.value,
                fecha: fecha.value,
                hora: horario.value,
                email: email.value
            })
        })
            .then(function (response) {
                // Código para manejar la respuesta
                if (response.ok) {
                    return response.json(); // Parseamos la respuesta JSON
                } else {
                    // Si hubo un error, mostrarlo
                    throw new Error('Error al agregar el producto.');
                }
            })
            .then(function (data) {
                // Mostramos la vista de éxito
                form.classList.add('display');
                exito.classList.remove('display');
            })
            .catch(function (error) {
                // Código para manejar errores
                mensaje.innerHTML = `<p class="mensaje-error">Error al registrar el turno, ya hay un turno registrado con ese nombre y correo electrónico.</p>`;
                console.log(error)
            });
    }
});
