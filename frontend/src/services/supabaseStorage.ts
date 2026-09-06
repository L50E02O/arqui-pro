import { supabase } from "../config/supabase";

// Supabase SOLO puede ser usado para manejar las imagenes en supabaseStorage y obtener las url
// Ninguno de sus endpoints del schema public pueden ser usado
class SupabaseStorage {
  private bucketName = 'imagenes'

  /**
   * Subir una imagen al bucket 'imagenes'
   * @param file - El archivo a subir
   * @param path - Ruta dentro del bucket (ej: 'incidencias/imagen.jpg')
   * @returns URL pública de la imagen subida
   */
  async uploadImagen(file: File, path: string): Promise<string> {
    try {
      // Subir el archivo al bucket
      const { error } = await supabase.storage
        .from(this.bucketName)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false, // No sobrescribir si existe
        })

      if (error) {
        throw new Error(`Error al subir imagen: ${error.message}`)
      }

      // Obtener URL pública
      const publicUrl = this.getPublicUrl(path)
      return publicUrl
    } catch (error: any) {
      console.error('Error en uploadImagen:', error)
      throw error
    }
  }

  /**
   * Obtener URL pública de una imagen
   * @param path - Ruta del archivo en el bucket
   * @returns URL pública
   */
  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path)

    return data?.publicUrl || ''
  }

  /**
   * Eliminar una imagen del bucket
   * @param path - Ruta del archivo a eliminar
   */
  async deleteImagen(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path])

      if (error) {
        throw new Error(`Error al eliminar imagen: ${error.message}`)
      }

      console.log(`Imagen eliminada: ${path}`)
    } catch (error: any) {
      console.error('Error en deleteImagen:', error)
      throw error
    }
  }

  /**
   * Listar todas las imágenes en el bucket
   * @param folderPath - Ruta de la carpeta dentro del bucket (opcional)
   */
  async listImagenes(folderPath?: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(folderPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        })

      if (error) {
        throw new Error(`Error al listar imágenes: ${error.message}`)
      }

      return data || []
    } catch (error: any) {
      console.error('Error en listImagenes:', error)
      throw error
    }
  }
}

export default new SupabaseStorage();