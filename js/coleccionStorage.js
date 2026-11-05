// Gestión de la colección guardada en localStorage.
// leer la colección y guardar nuevos items sin duplicados.
// reconstruir instancias de Item y actualizar su valoración y comentario.
// eliminar un item o vaciar toda la colección.
// convertir los datos con JSON.stringify() y JSON.parse().
const CLAVE_COLECCION = "coleccion";
class ColeccionStorage{

    static obtenerTodos(){
        const datos = localStorage.getItem(CLAVE_COLECCION);
        if(datos === null){
            return [];
        }
        try{
            return JSON.parse(datos);
        } catch(error){
            return [];
        }    
    }

    static guardar(item){
        const datos = ColeccionStorage.obtenerTodos();
        const repetido = datos.some(cancion => cancion.id === item.id);
        if(repetido){
            return false;
        }
        datos.push(item.toStorageObject());
        localStorage.setItem(CLAVE_COLECCION, JSON.stringify(datos));
        return true;
    }

    static obtenerComoItems(){
        const datos = ColeccionStorage.obtenerTodos();
        return datos.map(cancion => Item.fromStorageObject(cancion));
    }

    static eliminar(id){
        const datos = ColeccionStorage.obtenerTodos();
        const canciones = datos.filter(cancion => cancion.id !== id);
        localStorage.setItem(CLAVE_COLECCION, JSON.stringify(canciones));
    }

    static vaciar(){
        localStorage.removeItem(CLAVE_COLECCION);
    }
}