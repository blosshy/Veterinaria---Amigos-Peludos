import sqlite3
from sqlite3 import Error
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS

# Configurar la conexión a la base de datos SQLite
def get_db_connection():
    conn = sqlite3.connect('turnos.db')
    conn.row_factory = sqlite3.Row
    return conn

# Crear la tabla dentro de la base de datos
def create_turnos_table():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS turnos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL,
            mascota TEXT NOT NULL,
            fecha DATE NOT NULL,
            hora TIME NOT NULL
        )
    ''')

    # Guardar los cambios y cerrar la conexión
    conn.commit()
    conn.close()

# Ejecutamos la función
create_turnos_table()

#Clase turno
class Turno:
    # Definimos el constructor e inicializamos los atributos de instancia
    def __init__(self, codigo, nombre, email, mascota, fecha, hora):
        self.codigo = codigo # Id del turno
        self.nombre = nombre # Nombre del duenio
        self.mascota = mascota # Nombre de la mascota
        self.email = email # Email contacto
        self.fecha = fecha # Fecha del turno
        self.hora = hora # Horario del turno

    # Este método permite modificar los datos.
    def modificar(self, nueva_fecha, nueva_mascota, nuevo_nombre, nuevo_hora, nuevo_email):
        self.fecha = nueva_fecha # Modifica la fecha del turno
        self.mascota = nueva_mascota # Modifica el nombre de la mascota
        self.nombre = nuevo_nombre # Modifica el nombre del duenio
        self.hora = nuevo_hora # Modifica el horario del turno
        self.email = nuevo_email # Modifica el email de contacto

# -------------------------------------------------------------------
# Configuración y rutas de la API Flask
# -------------------------------------------------------------------

app = Flask(__name__)
CORS(app)

class Agenda:
    def __init__(self):
        self.conexion = get_db_connection()
        self.cursor = self.conexion.cursor()

    def agregar_turno(self, nombre, email, mascota, fecha, hora):
        turno_existente = self.consultar_turno(nombre, email)
        if turno_existente is None:
            print("No hay un turno registrado con esos datos. Creando nuevo turno...")
            self.cursor.execute("INSERT INTO turnos (nombre, email, mascota, fecha, hora) VALUES (?, ?, ?, ?, ?)",
                                (nombre, email, mascota, fecha, hora))
            self.conexion.commit()
            return True
        else:
            print("Ya hay un turno registrado con esos datos.")
            return False

    def consultar_turno(self, nombre, email):
        print("Consultando turno con nombre:", nombre, "y email:", email)
        self.cursor.execute("SELECT * FROM turnos WHERE nombre = ? AND email = ?", (nombre, email))
        row = self.cursor.fetchone()
        print("Resultado de la consulta:", row)
        if row:
            codigo, nombre_turno, email_turno, mascota, fecha, hora = row
            return {
                "codigo": codigo,
                "nombre": nombre_turno,
                "email": email_turno,
                "mascota": mascota,
                "fecha": fecha,
                "hora": hora
            }
        return None

    def eliminar_turno(self, nombre, email):
        self.cursor.execute("DELETE FROM turnos WHERE nombre = ? AND email = ?", (nombre, email))
        if self.cursor.rowcount > 0:
            print("Turno eliminado.")
            self.conexion.commit()
        else:
            print("Turno no encontrado.")

    def modificar_turno(self, nombre_actual, email_actual, nuevos_datos):
        turno_existente = self.consultar_turno(nombre_actual, email_actual)
        if turno_existente:
            turno = Turno(
                codigo=turno_existente["codigo"],
                nombre=turno_existente["nombre"],
                email=turno_existente["email"],
                mascota=turno_existente["mascota"],
                fecha=turno_existente["fecha"],
                hora=turno_existente["hora"]
            )

            nuevo_nombre = nuevos_datos.get("nombre", turno.nombre)
            nuevo_email = nuevos_datos.get("email", turno.email)
            nueva_mascota = nuevos_datos.get("mascota", turno.mascota)
            nueva_fecha = nuevos_datos.get("fecha", turno.fecha)
            nueva_hora = nuevos_datos.get("hora", turno.hora)

            turno.modificar(
                nueva_fecha,
                nueva_mascota,
                nuevo_nombre,
                nueva_hora,
                nuevo_email
            )

            self.cursor.execute("""
                UPDATE turnos SET nombre = ?, email = ?, mascota = ?, fecha = ?, hora = ?
                WHERE nombre = ? AND email = ?
            """, (nuevo_nombre, nuevo_email, nueva_mascota, nueva_fecha, nueva_hora, nombre_actual, email_actual))
            self.conexion.commit()
            print("Turno modificado correctamente.")
            return True
        else:
            print("No se encontró un turno con esos datos.")
            return False

agenda = Agenda()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/consulta-turnos')
def consulta_turnos():
    return render_template('consulta-turnos.html')

@app.route('/turnos', methods=['POST'])
def agregar_turno():
    try:
        data = request.get_json()
        nombre = data.get('nombre')
        mascota = data.get('mascota')
        email = data.get('email')
        fecha = data.get('fecha')
        hora = data.get('hora')

        resultado = agenda.agregar_turno(nombre, email, mascota, fecha, hora)

        if resultado:
            return jsonify({'message': 'Turno agregado correctamente.'}), 200
        else:
            return jsonify({'message': 'Ya hay un turno registrado con esos datos.'}), 400
    except Error as e:
        # Manejo de errores de la base de datos
        return jsonify({'message': 'Error en la base de datos.'}), 500
    except Exception as e:
        # Manejo de otros errores
        return jsonify({'message': 'Error interno del servidor.'}), 500

@app.route('/turnos', methods=['GET'])
def consultar_turno_existente():
    try:
        nombre = request.args.get('nombre')
        email = request.args.get('email')

        turno_existente = agenda.consultar_turno(nombre, email)

        if turno_existente:
            return jsonify({'message': 'Turno encontrado.', 'turno': turno_existente}), 200
        else:
            return jsonify({'message': 'No se encontró un turno con esos datos.'}), 404
    except Error as e:
        # Manejo de errores de la base de datos
        return jsonify({'message': 'Error en la base de datos.'}), 500
    except Exception as e:
        # Manejo de otros errores
        return jsonify({'message': 'Error interno del servidor.'}), 500

@app.route('/turnos/<nombre>/<email>', methods=['DELETE'])
def eliminar_turno_parametros(nombre, email):
    try:
        resultado = agenda.eliminar_turno(nombre, email)

        if resultado:
            return jsonify({'message': 'Turno eliminado correctamente.'}), 200
        else:
            return jsonify({'message': 'No se encontró un turno con esos datos.'}), 200  # Cambiado a 200 en lugar de 404
    except Error as e:
        # Manejo de errores de la base de datos
        return jsonify({'message': 'Error en la base de datos.'}), 500
    except Exception as e:
        # Manejo de otros errores
        return jsonify({'message': 'Error interno del servidor.'}), 500

@app.route('/turnos/<string:nombre>/<string:email>', methods=['PUT'])
def modificar_turno(nombre, email):
    nuevos_datos = request.json
    return jsonify(agenda.modificar_turno(nombre, email, nuevos_datos))

if __name__ == '__main__':
    app.run(port=8080)

