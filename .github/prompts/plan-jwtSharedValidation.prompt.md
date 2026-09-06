# Plan: Validación JWT Compartida entre Auth y APIREST

Se implementará validación local de JWT en la APIREST usando una clave secreta compartida con el auth-microservicio. El token incluirá el campo `iss` (issuer) para mayor seguridad, y la APIREST validará firma, expiración e issuer sin llamar al Auth.

## Steps

1. **Modificar** `generateTokens` en [auth.service.ts](backend/auth-microservicio/src/auth/auth.service.ts#L224-L232) para agregar `iss: 'auth-service'` al payload del access token y usar el `JWT_ISSUER` desde configuración.

2. **Modificar** `refreshAccessToken` en [auth.service.ts](backend/auth-microservicio/src/auth/auth.service.ts#L122-L137) para también incluir `iss` al generar el nuevo access token.

3. **Actualizar** [.env del auth-microservicio](backend/auth-microservicio/.env) para añadir `JWT_ISSUER=auth-service`.

4. **Reemplazar** [jwt.rb](backend/APIREST/config/initializers/jwt.rb) para usar variables de entorno `JWT_SECRET` y `JWT_ISSUER` en lugar del `secret_key_base`.

5. **Modificar** `authenticate_usuario!` en [application_controller.rb](backend/APIREST/app/controllers/application_controller.rb#L21-L48) para:
   - Validar el issuer del token (`iss: 'auth-service'`)
   - Obtener el rol directamente del payload JWT (ya no buscar en BD de usuarios)
   - Crear un struct/objeto con la info del usuario desde el JWT

6. **Crear archivo** `.env` o `local_env.yml` en APIREST con `JWT_SECRET` y `JWT_ISSUER` idénticos al auth-microservicio.

## Further Considerations

1. **¿Deseas eliminar el modelo Usuario de la BD de APIREST?** Si ya no se usa para auth, podrías crear un `CurrentUser` struct basado en el JWT. Recomiendo: mantener tabla vacía para compatibilidad y usar struct del JWT.

2. **¿Tokens revocados?** Actualmente auth-microservicio mantiene una blacklist de tokens. Si quieres que APIREST también la valide, necesitarías llamar a auth o compartir la BD de tokens revocados. Recomiendo: validación local simple por ahora, blacklist opcional después.

3. **¿Quieres que cree también un archivo `.env.example` para documentar las variables requeridas en APIREST?**


## Respuestas a las Further Considerations

1. No elimines la tabla usuario, tampoco la uses, pero dejala vacia para compatibilidad/migracion y Usa el currentUser sacado del JWT
2. por ahora solo has la validación simple.
3. si crea ese archivo .env.example en APIREST