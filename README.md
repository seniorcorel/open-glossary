# 📖 Glosario Colaborativo

Webapp colaborativa para compartir y descubrir palabras en diferentes idiomas.

## Setup

### 1. Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Activa **Authentication** → método **Google**
4. Activa **Cloud Firestore** (modo producción)
5. Copia las reglas de `firestore.rules` en la consola de Firestore
6. En **Project Settings**, copia la configuración de tu app web

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y completa con tus credenciales de Firebase:

```bash
cp .env.example .env
```

### 3. Instalar y ejecutar

```bash
npm install
npm run dev
```

### 4. Crear un moderador

En la consola de Firebase → Firestore, busca tu usuario en la colección `users` y cambia el campo `role` de `"user"` a `"moderator"`.

## Funcionalidades

- 🔐 Login con Google
- ✍️ Envío de palabras/expresiones con traducción, significado, ejemplos, tags
- 🛡️ Panel de moderación para aprobar/rechazar envíos
- 🔍 Búsqueda y filtro por idioma
- 📱 Diseño responsive
