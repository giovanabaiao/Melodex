import {Item} from "./item.js"
// Gestión de la colección guardada en localStorage.
// leer la colección y guardar nuevos items sin duplicados.
// reconstruir instancias de Item y actualizar su valoración y comentario.
// eliminar un item o vaciar toda la colección.
// convertir los datos con JSON.stringify() y JSON.parse().

export class ColeccionStorage{

    static obtenerTodos(){
        let datos = localStorage.getItem("coleccion");
        if(datos == null){
            return [];
        }
        return JSON.parse(datos);
    }

    static guardar(item){
        let datos = ColeccionStorage.obtenerTodos();
        let repetidos = datos.filter(cancion => cancion.id == item.id);
        if(repetidos.length > 0){
            return false;
        }
        datos.push(item.toStorageObject());
        localStorage.setItem("coleccion", JSON.stringify(datos));
        return true;
    }

    static obtenerComoItems(){
        let datos = ColeccionStorage.obtenerTodos();
        return datos.map(cancion => Item.fromStorageObject(cancion));
    }

    static eliminar(id){
        let datos = ColeccionStorage.obtenerTodos();
        let canciones = datos.filter(cancion => cancion.id != id);
        localStorage.setItem("coleccion", JSON.stringify(canciones));
    }

    static vaciar(){
        localStorage.removeItem("coleccion");
    }
}