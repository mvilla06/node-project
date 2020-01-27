var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
let mongoose = require('mongoose');

let {DATABASE_URL, PORT} = requir('./config')

let { StudentList } = require('./model')

var app = express();

app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    if(req.method==="OPTIONS"){
        return res.send(204);
    }
    next();
})

app.use(express.static('public'));
app.use(morgan('dev'));

let estudiantes = [{
    nombre: "Miguel",
    apellido: "Ángeles",
    matricula: 1730939
}, {
    nombre: "Erick",
    apellido: "González",
    matricula: 1039859
}, {
    nombre: "Victor",
    apellido: "Villarreal",
    matricula: 1039863
}, {
    nombre: "Victor",
    apellido: 'Cárdenas',
    matricula: 816350
}];

app.get('/api/students', (req, res) => {
    StudentList.getAll()
        .then(studentList => {
            return res.status(200).json(studentList);
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = "Hubo un error de conexion con la BD.";
            return res.status(500).send();
        })

});

app.get('/api/getById', (req, res) => {
    var id = req.query.id;

    /*let result = estudiantes.find((elemento) => {
        if (elemento.matricula == id) {
            return elemento;
        }
    });

    if (result) {
        return res.status(200).json(result);
    } else {
        res.statusMessage = 'El alumno no se encuentra en la lista';
        return res.status(404).send();
    }*/
    StudentList.getByAttr({matricula:id})
        .then(student =>{
            if(student.length>0)
            return res.status(200).json(student);
            else
            return res.status(404).send();
        })
        .catch(error=>{
            console.log(error);
            return res.status(500).send();
        })

});


app.get('/api/getByName/:name', (req, res) => {
    var name = req.params.name;

    /*var result = estudiantes.filter((elemento) => {
        if (elemento.nombre === name) {
            return elemento;
        }
    });

    if (result.lenght > 0) {
        return res.status(200).json(result);
    } else {
        res.statusMessage = 'El alumno no se encuentra en la lista';
        return res.status(404).send();
    }*/
    StudentList.getByAttr({nombre:name})
        .then(students=>{
            if(students.lenght>0)
            return res.status(200).json(students);
            else
            return res.status(404).send();
        })
        .catch(error=>{
            console.log(error);
            return res.status(500).send();
        })

});

app.post('/api/newStudent', jsonParser, (req, res) => {
    let name = req.body.nombre;
    let last = req.body.apellido;
    let id = req.body.matricula;
    if (name && last && id) {
        if (name != "" && last != "" && typeof (id) == "number") {
            /*let result = estudiantes.find((elemento) => {
                if (elemento.matricula == matricula2) { return elemento; }
            });*/

            StudentList.getByAttr({matricula:id})
                .then(student=>{
                    
                    if (student.length===0){
                        StudentList.create({nombre:name, apellido:last, matricula:id})
                            .then(newStudent=>{
                                return res.status(200).json(newStudent);
                            })
                            .catch(error=>{
                                console.log(error)
                                return res.status(500).send();
                            })
                    }else{
                        console.log(student)
                        return res.status(409).send();
                    }
                })
                .catch(error=>{
                    return res.status(500).send();
                })
            /*if (result) {
                return res.status(409).send();
            } else {

                let nuevo = { nombre: "", apellido: "", matricula: 0 };
                nuevo.nombre = nombre2;
                nuevo.apellido = apellido2;
                nuevo.matricula = matricula2;
                estudiantes.push(nuevo);
                return res.status(201).json(nuevo);
            }*/

        }
    } else {
        return res.status(406).send();
    }

});


app.put('/api/updateStudent/:id', jsonParser, (req, res) => {
    let nombre = req.body.nombre;
    let apellido = req.body.apellido;
    let id = req.params.id;
    let matricula = req.body.matricula;
    if (matricula && (nombre || apellido)) {
        if (matricula == id) {

            /*
            var ind;
            let result = estudiantes.find((elemento, index) => {
                if (elemento.matricula == id) {
                    ind = index;
                    return elemento;
                }
            });*/

            StudentList.getByAttr({matricula:id})
                .then(student=>{
                    if(student.length===0){
                        return res.status(404).send();
                    }else{
                        StudentList.update(id, nombre, apellido)
                            .then(actualizado=>{
                                return res.status(202).json(actualizado);
                            })
                            .catch(error=>{
                                console.log(error);
                                return res.status(500).send();
                            });
                    }
                })
                .catch(error=>{
                    console.log(error);
                    return res.status(500).send();
                })


            /*if (result) {
                if (nombre) {
                    estudiantes[ind].nombre = nombre;
                }

                if (apellido) {
                    estudiantes[ind].apellido = apellido;
                }

                return res.status(202).json(estudiantes[ind]);
            } else {
                return res.status(404).send();
            }*/
        } else {
            return res.status(409).send();
        }
    } else {
        return res.status(406).send();
    }
});



app.delete('/api/deleteStudent', jsonParser, (req, res) => {
    let id = req.query.id;
    let matricula = req.body.matricula;
    var ind;

    if (id == matricula) {
        let result = estudiantes.find((elemento, index) => {
            if (elemento.matricula == id) {
                ind = index;
                return elemento;
            }
        });

        if (result) {
            estudiantes.splice(ind, 1);
            return res.status(204).json({});
        } else {
            return res.status(404).send();
        }
    } else {
        return res.status(409).send();
    }
});

/*app.listen(8080, ()=>{
    console.log('Servidor corriendo en puerto 8080.');
});*/


let server;

function runServer(port, databaseUrl) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, response => {
            if (response) {
                return reject(response);
            }
            else {
                server = app.listen(port, () => {
                    console.log("App is running on port " + port);
                    resolve();
                })
                    .on('error', err => {
                        mongoose.disconnect();
                        return reject(err);
                    })
            }
        });
    });
}

function closeServer() {
    return mongoose.disconnect()
        .then(() => {
            return new Promise((resolve, reject) => {
                console.log('Closing the server');
                server.close(err => {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
}


runServer(PORT, DATABASE_URL);

module.exports = {app, runServer, closeServer};