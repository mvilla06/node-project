let mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let studentCollection = mongoose.Schema({
    nombre: { type: String },
    apellido: {type: String},
    matricula: {
        type: Number,
        required: true,
        unique: true
    }
});


let Student = mongoose.model('students', studentCollection);

let StudentList = {
    getAll: function (){
        return Student.find()
            .then(students =>{
                return students;
            })
            .catch(error=>{
                throw Error(error);
            });
    },
    create: function(newStudent){
        return Student.create(newStudent)
            .then(created=>{
                return created;
            })
            .catch(error=>{
                throw Error(error);
            })
    },
    getByAttr: function(attribute){
        return Student.find(attribute)
            .then(student=>{
                return student;
            })
            .catch(error=>{
                throw Error(error);
            })
    },
    update: function(id, name, last){
        return Student.findOneAndUpdate({matricula:id}, {matricula: id, nombre:name , apellido:last}, {omitUndefined:true, new:true})
        .then(actualizado=>{
            
            return actualizado;
        })
        .catch(error=>{
            throw Error(error);
        });
    }
}


module.exports = {
    StudentList
};
