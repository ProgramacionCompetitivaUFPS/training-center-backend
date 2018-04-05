# training-center-backend

## Ejecutar el proyecto en Local

### Requisitos

* MariaDB
* node
* npm
* sequelize-cli

Cambiar a la ubicación del proyecto

```
$ cd /training-center-backend/
```

### Variables de entorno

Se debe crear un archivo .env en el directorio raiz, en el se definiran las siguientes variables:

```
NODE_ENV
SMTP_USER
SMTP_PASSWORD
FROM_ACCOUNT
SECRET_TOKEN
MYSQL_DATABASE
MYSQL_PASSWORD
```

### Configuración inicial

En el archivo de configuraciones *config.js* cambiar los datos de conexión a la base de datos de desarrollo y de test. El formato a utilizar será: <motor>://<user>:<password>@<host>/<database>

### Instalación

Instalar las dependencias
```
$ npm install
```
Ejecutar las migraciones de la BD (Sequelize).

Ejecutar el proyecto
```
$ npm start
```

En el navegador:`localhost:3000`

## SEQUELIZE

Training Center UFPS utiliza Sequelize como ORM. Para más información consulte [Sequelize CLI](https://github.com/sequelize/cli)

### Migraciones

Para ejecutar las Migraciones dentro de la raiz del proyecto: 

```
$ sequelize db:migrate
```

### Seeds

Para ejecutar los seeds:

```
$ sequelize db:seed:undo:all
$ sequelize db:seed:all
```

## RESTful API

Para consultar la definición del API, consultar la wiki.

 Build with :heart: by [Meyito](https://github.com/Meyito)
