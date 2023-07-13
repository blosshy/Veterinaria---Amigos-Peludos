/* GET ELEMENTOS DEL HTML CONSULTA*/
const form_consulta = document.getElementById("form-consulta");
const client_name_consulta = document.getElementById("client-name-consulta");
const email_consulta = document.getElementById("email-consulta");

/* FUNCIONES PARA VALIDAR */

function validarCaracteresEspeciales(input) {
    let valor = input.value.trim();
    let caracteresEspeciales = /[!@#$%^&*(),.?":{}|<>0-9]/;

    if (caracteresEspeciales.test(valor)) {
        return false;
    }else{
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

/* FUNCIONES DE LOS BOTONES PARA GESTIONAR TURNOS */

// Función para manejar el evento de clic en el botón "Modificar"
function handleModificarTurno(turno) {
    // Vaciamos la card
    const card_container = document.getElementById('resultado-turno');
    card_container.innerHTML = '';
    
    // Modificar el título y el párrafo de éxito
    const titulo = document.getElementById("titulo-exitoso");
    const texto = document.getElementById("texto-exitoso");
    titulo.innerText = 'Modificar turno';
    texto.innerText = 'Ingrese los nuevos datos en el formulario:';

    // Mostrar el formulario para que ingresen los datos nuevos
    const form_nuevo = document.getElementById('form-nuevos-datos');
    form_nuevo.classList.remove('display');

    // Traemos los campos del formulario
    const nuevo_nombre = document.getElementById('new-client-name');
    const nuevo_email = document.getElementById('new-email');
    const nueva_mascota = document.getElementById('new-pet-name');
    const nueva_fecha = document.getElementById('new-date');
    const nueva_hora = document.getElementById('new-time');

    // Generar evento submit del formulario nuevo
    form_nuevo.addEventListener("submit", (e) => {
        e.preventDefault();
    
        let mensaje = document.getElementById('mensaje-form-nuevo');
    
        if ((nuevo_nombre.value.length == 0) || (nueva_mascota.value.length == 0) || (nueva_fecha.value.length == 0) || (nueva_hora.value.length == 0) || (nuevo_email.value.length == 0)) {
            mensaje.innerHTML = `<p class="mensaje-error">No puedes dejar ningún campo vacío.</p>`;
        } else if (!validarCaracteresEspeciales(nuevo_nombre) || !validarCaracteresEspeciales(nueva_mascota)) {
            mensaje.innerHTML = `<p class="mensaje-error">No se permiten caracteres especiales ni números en el nombre del cliente y tampoco en el de tu mascota.</p>`;
        } else if (!validarFecha(nueva_fecha)) {
            mensaje.innerHTML = `<p class="mensaje-error">La fecha ingresada es incorrecta.</p>`;
        } else {
            // Crear el objeto con los nuevos datos
            const nuevosDatos = {
                nombre: nuevo_nombre.value,
                email: nuevo_email.value,
                mascota: nueva_mascota.value,
                fecha: nueva_fecha.value,
                hora: nueva_hora.value
            };

            // Realizar la solicitud PUT al servidor
            const URL = "http://matiasss.pythonanywhere.com/";
            fetch(`${URL}turnos/${turno.nombre}/${turno.email}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevosDatos)
            })
            .then(function (response) {
                if (response.ok) {
                    console.log('Turno modificado correctamente.');

                    // Modificar el título y el párrafo de éxito
                    const titulo = document.getElementById("titulo-exitoso");
                    const texto = document.getElementById("texto-exitoso");
                    titulo.innerText = 'Turno modificado';
                    texto.innerText = '¡Los datos del turno se actualizaron correctamente!';

                    // Ocultamos el formulario nuevamente
                    const form_nuevo = document.getElementById('form-nuevos-datos');
                    form_nuevo.classList.add('display');

                    // Traemos el contenedor vacio
                    const container = document.getElementById('contenedor-index');
                    container.classList.add('link-container');

                    //Le agregamos sus elementos
                    const enlaceVolver = document.createElement('a');
                    enlaceVolver.href = "http://matiasss.pythonanywhere.com/consulta-turnos";
                    enlaceVolver.textContent = 'Para consultar los datos nuevamente haga click aquí';
                    enlaceVolver.classList.add('index-link');
                    container.appendChild(enlaceVolver);
                    
                } else {
                    throw new Error('Error al modificar el turno.');
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        }
    });

}

// Función para manejar el evento de clic en el botón "Eliminar"
function handleEliminarTurno(turno) {
    const nombre = turno.nombre;
    const email = turno.email;

    const URL = "http://matiasss.pythonanywhere.com/";

    fetch(`${URL}turnos/${nombre}/${email}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(function (response) {
        if (response.ok) {
            console.log('Turno eliminado correctamente.');

            // Modificar el título y el párrafo de éxito
            const titulo = document.getElementById("titulo-exitoso");
            const texto = document.getElementById("texto-exitoso");
            titulo.innerText = 'Turno eliminado';
            texto.innerText = 'El turno se ha eliminado correctamente.';

            // Vaciamos la card
            const card_container = document.getElementById('resultado-turno');
            card_container.innerHTML = '';

            // Traemos el contenedor vacio
            const container = document.getElementById('contenedor-index');
            container.classList.add('link-container');

            // Crear un elemento <a>
            const enlaceVolver = document.createElement('a');
            enlaceVolver.href = "http://matiasss.pythonanywhere.com/";
            enlaceVolver.textContent = 'Volver a la página principal';
            enlaceVolver.classList.add('index-link');

            // Agregar el enlace al contenedor
            container.appendChild(enlaceVolver);

        } else {
            throw new Error('Error al eliminar el turno.');
        }
    })
    .catch(function (error) {
        console.log(error);
    });
}

/* EVENTO SUBMIT FORMULARIO DE CONSULTA DE TURNOS */

form_consulta.addEventListener("submit", (e) => {
    e.preventDefault();

    let mensaje = document.getElementById('mensaje-2');

    if ((client_name_consulta.value.length == 0) || (email_consulta.value.length == 0)) {
        mensaje.innerHTML = `<p class="mensaje-error">No puedes dejar ningún campo vacío.</p>`;
    } else if (!validarCaracteresEspeciales(client_name_consulta)) {
        mensaje.innerHTML = `<p class="mensaje-error">No se permiten caracteres especiales ni números en el nombre del cliente.</p>`;
    } else {
        const URL = "http://matiasss.pythonanywhere.com/";

        fetch(`${URL}turnos?nombre=${client_name_consulta.value}&email=${email_consulta.value}`)
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Error al consultar el turno.');
                }
            })
            .then(function (data) {
                if (data.turno) {
                    // Modificamos el titulo y texto del html
                    const titulo = document.getElementById("titulo-exitoso");
                    const texto = document.getElementById("texto-exitoso");

                    titulo.innerText = 'Turno registrado';
                    texto.innerText = 'Se ha encontrado un turno registrado con los siguientes datos:';

                    // Turno encontrado
                    const turno = data.turno;
                    // Crear elementos HTML para la card
                    const card = document.createElement('div');
                    card.classList.add('card');
                    const cardBody = document.createElement('div');
                    cardBody.classList.add('card-body');

                    // Crear contenido para la card
                    const nombreTurno = document.createElement('h5');
                    nombreTurno.textContent = `Nombre: ${turno.nombre}`;
                    nombreTurno.classList.add('card-text');

                    const emailTurno = document.createElement('p');
                    emailTurno.textContent = `Email: ${turno.email}`;
                    emailTurno.classList.add('card-text');

                    const mascotaTurno = document.createElement('p');
                    mascotaTurno.textContent = `Nombre de la mascota: ${turno.mascota}`;
                    mascotaTurno.classList.add('card-text');

                    const fechaTurno = document.createElement('p');
                    fechaTurno.textContent = `Día del turno: ${turno.fecha}`;
                    fechaTurno.classList.add('card-text');

                    const horaTurno = document.createElement('p');
                    horaTurno.textContent = `Hora del turno: ${turno.hora}`;
                    horaTurno.classList.add('card-text')

                    const btnModificar = document.createElement('button');
                    btnModificar.classList.add('btn', 'btn-primary','btn-padding');
                    btnModificar.textContent = 'Modificar turno';
                    btnModificar.addEventListener('click', function () {
                        handleModificarTurno(data.turno); // Pasa el turno como parámetro
                    });

                    const btnEliminar = document.createElement('button');
                    btnEliminar.classList.add('btn', 'btn-danger','btn-padding');
                    btnEliminar.textContent = 'Eliminar turno';
                    btnEliminar.addEventListener('click', function () {
                        handleEliminarTurno(data.turno); // Pasa el turno como parámetro
                    });

                    const btnVolver = document.createElement('button');
                    btnVolver.classList.add('btn', 'btn-secondary', 'btn-padding');
                    btnVolver.textContent = 'Finalizar consulta';
                    btnVolver.addEventListener('click', function () {
                      window.location.href = "/"; // Redirecciona al index.html
                    });

                    // Agregar los elementos a la card
                    cardBody.appendChild(nombreTurno);
                    cardBody.appendChild(emailTurno);
                    cardBody.appendChild(mascotaTurno);
                    cardBody.appendChild(fechaTurno);
                    cardBody.appendChild(horaTurno);
                    cardBody.appendChild(btnModificar);
                    cardBody.appendChild(btnEliminar);
                    cardBody.appendChild(btnVolver);
                    card.appendChild(cardBody);

                    // Agregar la card al documento
                    const container = document.getElementById('resultado-turno');
                    container.innerHTML = '';
                    container.appendChild(card);

                    form_consulta.classList.add('display');
                } else {
                    // No se encontró el turno
                    console.log('No se encontró un turno con esos datos.');
                }
            })
            .catch(function (error) {
                // Código para manejar errores
                mensaje.innerHTML = `<p class="mensaje-error">No hay ningún turno registrado con esos datos.</p>`;
                console.log(error)
            });
    }
});