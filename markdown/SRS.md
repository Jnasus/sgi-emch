Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

Sistema Web de Gestión de Inventario de Equipos
Informáticos EMCH “CFB”
Especificación de Requerimientos de Software

Versión / Edición

0100

Fecha de Versión

17/05/2026

Organismo

Proyecto

Entregable

Autores

Escuela Militar de Chorrillos “Coronel Francisco Bolognesi” –
Departamento DTIC

Sistema Web de Gestión de Inventario de Equipos Informáticos

Especificación de Requerimientos de Software (SRS)

Grupo 03: Pariona Torres, Jonas Efrain | Chavarría Navarro, Aldair |
Andia Canchi, Henrry Jhon | Orozco Romero, Kattia

Aprobado por

TCO2 EP MORALES PEREZ Edgar Oscar – Sponsor / Product Owner –
Dpto. DTIC

Marco de Referencia

IEEE Std 830-1998 / ISO/IEC/IEEE 29148:2018 – Metodología: MADEJA
(Marco de Desarrollo de la Junta de Andalucía) adaptada

Metodología de
Desarrollo

Scrum – Sprint 0 de Inicio + 6 Sprints de Desarrollo (30/03/2026 – 16/07/2026 deadline
académico)

V 1.00

Queda  prohibido  cualquier  tipo  de  explotación  y,  en  particular,  la  reproducción,
distribución,  comunicación  pública  y/o  transformación,  total  o  parcial,  por  cualquier
medio, de este documento sin el previo consentimiento expreso y por escrito.

Versión: 0100

Fecha: 17/05/2026

EMCH “CFB” | Grupo 03 | Página 1 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

HOJA DE CONTROL

Organismo

Proyecto

Entregable

Autor

Escuela Militar de Chorrillos “Coronel Francisco Bolognesi”

Sistema Web de Gestión de Inventario de Equipos Informáticos

Especificación de Requerimientos de Software

Grupo 03 – Pariona Torres, Jonas Efrain (Jefe de Proyecto / Scrum
Master)

Versión / Edición

0100

Fecha Versión

17/05/2026

Aprobado por

TCO2 EP MORALES PEREZ Edgar Oscar

Fecha Aprobación

___/___/2026

Nº Total de Páginas

30

REGISTRO DE CAMBIOS

Versión

Causa del Cambio

Responsable

Fecha

0100

Versión inicial – Redacción completa
del documento SRS

Pariona Torres, Jonas
Efrain

17/05/2026

0200

Actualización v0200 – Alineación con implementación real: corrección de restricciones técnicas RT-03 (React SPA), RT-04 (Spring Boot embedded + Docker), RT-07 (dominio público con auth); eliminación de referencias a SMTP/correo (notificaciones solo internas); actualización de librería PDF a OpenPDF; corrección de estrategia de ramas Git; adición de módulos implementados en Sprint 5 (monitoreo, backup, Docusaurus); corrección de fecha de entrega final a 16/07/2026.

Pariona Torres, Jonas
Efrain

09/06/2026

CONTROL DE DISTRIBUCIÓN

Nombre y Apellidos

Rol / Cargo

TCO2 EP MORALES PEREZ Edgar Oscar

Sponsor / Product Owner – Dpto. DTIC

Pariona Torres, Jonas Efrain

Jefe de Proyecto / Scrum Master

Chavarría Navarro, Aldair

Desarrollador Full-Stack

Andia Canchi, Henrry Jhon

Desarrollador / DBA

Orozco Romero, Kattia

Desarrolladora Full-Stack

EMCH “CFB” | Grupo 03 | Página 2 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

Contenido
HOJA DE CONTROL .......................................................................................................................................... 2

REGISTRO DE CAMBIOS ................................................................................................................................ 2

CONTROL DE DISTRIBUCIÓN ........................................................................................................................ 2

1. INTRODUCCIÓN ............................................................................................................................................ 5

1.1 Propósito .................................................................................................................................................. 5

1.2 Alcance ................................................................................................................................................... 5

1.3 Objetivos .................................................................................................................................................. 6

2. INFORMACIÓN DEL DOMINIO DEL PROBLEMA ......................................................................................... 7

2.1 Introducción al Dominio del Problema ............................................................................................... 7

2.2 Glosario de Términos .............................................................................................................................. 7

3. DESCRIPCIÓN DE LA SITUACIÓN ACTUAL .................................................................................................. 9

3.1 Pros y Contras de la Situación Actual.................................................................................................. 9

3.1.1 Fortalezas de la Situación Actual .................................................................................................. 9

3.1.2 Debilidades de la Situación Actual ............................................................................................... 9

3.2 Modelos de Procesos de Negocio Actuales .................................................................................... 10

3.2.1 Descripción de los Actores de Negocio Actuales .................................................................... 10

3.2.2 Descripción de Procesos de Negocio Actuales ........................................................................ 10

3.3 Entorno Tecnológico Actual ............................................................................................................... 11

3.3.1 Descripción del Entorno de Hardware Actual ........................................................................... 11

3.3.2 Descripción del Entorno de Software Actual............................................................................. 11

4. NECESIDADES DE NEGOCIO ..................................................................................................................... 12

4.1 Objetivos de Negocio.......................................................................................................................... 12

4.2 Modelos de Procesos de Negocio a Implantar ............................................................................... 12

4.2.1 Descripción de los Actores de Negocio a Implantar ............................................................... 12

4.2.2 Descripción de Procesos de Negocio a Implantar ................................................................... 13

5. DESCRIPCIÓN DE LOS SUBSISTEMAS DEL SISTEMA A DESARROLLAR ..................................................... 14

6. CATÁLOGO DE REQUISITOS DEL SISTEMA A DESARROLLAR .................................................................. 15

6.1 Requisitos Generales del Sistema ....................................................................................................... 15

6.2 Casos de Uso del Sistema.................................................................................................................... 17

6.2.1 Diagramas de Casos de Uso del Sistema ................................................................................... 17

6.2.2 Especificación de Actores del Sistema ...................................................................................... 23

6.2.3 Especificación de Casos de Uso del Sistema ............................................................................ 23

6.3 Requisitos Funcionales del Sistema .................................................................................................... 26

6.3.1 Requisitos de Información del Sistema ....................................................................................... 26

6.3.2 Requisitos de Reglas de Negocio del Sistema ........................................................................... 27

6.3.3 Requisitos de Conducta del Sistema .......................................................................................... 27

EMCH “CFB” | Grupo 03 | Página 3 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

6.4 Requisitos No Funcionales del Sistema .............................................................................................. 29

6.4.1 Requisitos de Fiabilidad ................................................................................................................ 29

6.4.2 Requisitos de Usabilidad ............................................................................................................... 29

6.4.3 Requisitos de Eficiencia................................................................................................................. 29

6.4.4 Requisitos de Mantenibilidad ....................................................................................................... 30

6.4.5 Requisitos de Portabilidad ............................................................................................................ 30

6.4.6 Requisitos de Seguridad ............................................................................................................... 30

6.4.7 Otros Requisitos No Funcionales .................................................................................................. 31

6.6 Requisitos de Integración e Interfaces del Sistema ......................................................................... 32

6.7 Información Sobre Trazabilidad.......................................................................................................... 32

7. CRONOGRAMA SCRUM (DEADLINE 16/07/2026) ................................................................................... 34

ANEXOS ........................................................................................................................................................... 35

Anexo A: SLAs Definidos por Tipo de Incidente ...................................................................................... 35

Anexo B: KPIs del Sistema .......................................................................................................................... 35

Anexo C: Glosario de Acrónimos y Abreviaturas ................................................................................... 36

Anexo D: Referencias Normativas ........................................................................................................... 36

EMCH “CFB” | Grupo 03 | Página 4 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

1. INTRODUCCIÓN

El Departamento de Tecnologías de la Información y Comunicaciones (DTIC) de la Escuela Militar
de  Chorrillos  “Coronel  Francisco  Bolognesi”  (EMCH  “CFB”)  gestiona  actualmente  el  inventario  de
equipos  informáticos  mediante  hojas  de  cálculo  Excel,  un  mecanismo  que  presenta  críticas
deficiencias  en  materia  de  trazabilidad,  consistencia  de  datos  y  capacidad  de  respuesta  ante
incidentes técnicos.

El presente documento constituye la Especificación de Requerimientos de Software (SRS) del Sistema
Web de Gestión de Inventario de Equipos Informáticos, elaborado conforme al estándar IEEE Std
830-1998  y  su  sucesor  ISO/IEC/IEEE  29148:2018,  adaptado  al  marco  metodológico  MADEJA.  El
documento  define  de  manera  formal,  verificable  y  trazable  todos  los  requisitos  funcionales,  no
funcionales, reglas de  negocio y  restricciones técnicas que  deberá satisfacer el sistema para ser
aceptado por el Product Owner y el Sponsor institucional.

1.1 Propósito

El propósito de este documento es proveer una descripción precisa, no ambigüa y verificable de
los requisitos del sistema web a desarrollar para la EMCH “CFB”. Sirve como contrato de alcance
entre el equipo de desarrollo (Grupo 03), el Product Owner (TCO2 EP MORALES PEREZ) y el Sponsor
institucional,  garantizando  que  todos  los  interesados  compartan  la  misma  comprensión  de  las
funcionalidades, restricciones y criterios de aceptación del producto.

1.2 Alcance

El  sistema  denominado  “Sistema  Web  de  Gestión  de  Inventario  de  Equipos  Informáticos  –  EMCH
CFB”  es  una  solución  web  del  Departamento  DTIC,  accesible  mediante  el  dominio  institucional
https://sgi.escuelamilitar.edu.pe bajo protocolo HTTPS con autenticación obligatoria (RBAC). El sistema abarca los siguientes módulos funcionales:

•  Módulo de Usuarios y Seguridad: autenticación JWT con 4 roles operativos (Administrador, Jefe DTIC, Subjefe DTIC, Técnico) y acceso de solo lectura para Directivos; control de acceso RBAC.
•  Módulo de Inventario: gestión del ciclo de vida completo de activos TI (PCs, laptops, impresoras), incluyendo especificaciones técnicas, historial de estados y carga masiva desde Excel.
•  Módulo  de  Incidentes:  mesa  de  ayuda  con  tickets  auto-numerados  (TKT-YYYYMM-NNNN),  SLAs  por  tipo  y generación de actas PDF al cierre.
•  Módulo de Reportes y Dashboard: paneles diferenciados por perfil, KPIs en tiempo real y exportación Excel/PDF.
•  Módulo de Notificaciones: alertas automáticas internas al panel del usuario cuando el stock de equipos caiga bajo el umbral configurable o un ticket supere su SLA.
•  Módulo de Monitoreo y Operaciones: stack Prometheus + Grafana + Loki para visibilidad operativa; backup automático diario (mysqldump); documentación técnica en línea (Docusaurus).

Quedan  explícitamente  fuera  del  alcance  de  la  presente  versión:  la  integración  con  Active
Directory, un portal de autoservicio para usuarios finales no-DTIC, notificaciones por correo SMTP y la gestión de activos distintos a equipos informáticos.

EMCH “CFB” | Grupo 03 | Página 5 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

1.3 Objetivos

ID

Objetivo Estratégico

Criterio de Éxito

OBJ-
01

OBJ-
02

OBJ-
03

OBJ-
04

OBJ-
05

Digitalizar el proceso de gestión de inventario y
atención de incidentes del Dpto. DTIC

Cobertura del 100% de los
procesos identificados en el
levantamiento de información

Garantizar la calidad del software entregado
conforme a estándares ISO/IEC 25010

0 bugs críticos al momento de la
implementación en producción

Cumplir los plazos del cronograma Scrum con el
deadline académico del 16/07/2026

Sprint 6 (Cierre/UAT)
finalizado y entregado el 16/07/2026

Proveer trazabilidad completa del parque
informático con identificador único institucional

0% de activos sin estado o
trazabilidad definida en el sistema

Implementar un motor de SLAs que controle
tiempos de respuesta por tipo de incidente

Al menos el 90% de los tickets
resueltos dentro de los SLAs
definidos

EMCH “CFB” | Grupo 03 | Página 6 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

2. INFORMACIÓN DEL DOMINIO DEL PROBLEMA

2.1 Introducción al Dominio del Problema

La gestión de activos de Tecnologías de la Información (IT Asset Management, ITAM) constituye una
disciplina crítica dentro del marco ITIL v4 y estándares como ISO/IEC 19770-1. En el contexto de la
EMCH  “CFB”,  dicha  gestión  comprende  el  control  del  ciclo  de  vida  completo  de  los  equipos
informáticos (adquisición, asignación, mantenimiento, traslado y baja), así como la orquestación de
incidentes técnicos bajo Acuerdos de Niveles de Servicio (SLAs).

El dominio del problema abarca a cinco tipos de usuarios con roles diferenciados (Administrador,
Jefe  DTIC,  Subjefe  DTIC,  Técnico  de  Campo  y  Directivo),  cuya  interacción  con  el  sistema  debe
respetar  el  principio  de  mínimo  privilegio  (RBAC  –  Role-Based  Access  Control),  garantizando  la
integridad de los datos y la trazabilidad de las operaciones.

2.2 Glosario de Términos

Término / Acrónimo  Definición

DTIC

EMCH “CFB”

Departamento de Tecnologías de la Información y Comunicaciones de la
EMCH “CFB”.

Escuela  Militar  de  Chorrillos  “Coronel  Francisco  Bolognesi”,  institución  de
educación superior del Ejército del Perú.

Código_Ejército

Identificador  único  institucional  de  cada  equipo  informático.  Formato:
C1010-EMCH-XXXX. Es el campo llave del módulo de inventario.

RBAC

SLA

ITAM

CRUD

MVC

ORM

Ticket

Audit Trail

Stock Crítico

Role-Based  Access  Control:  modelo  de  control  de  acceso  que  asigna
permisos a roles y roles a usuarios, impidiendo el acceso no autorizado a
módulos o endpoints.

Service  Level  Agreement:  acuerdo  de  nivel  de  servicio  que  define  los
tiempos máximos de respuesta y resolución para cada tipo de incidente
técnico.

IT  Asset  Management:  disciplina  para  el  control  del  ciclo  de  vida  de  los
activos tecnológicos de una organización.

Create,  Read,  Update,  Delete:  conjunto  básico  de  operaciones  de
persistencia sobre entidades del sistema.

Model-View-Controller:  patrón  arquitectónico  de
responsabilidades empleado en el backend del sistema.

separación  de

Object-Relational  Mapping:  técnica  de  abstracción  de  acceso  a  BD
mediante Hibernate/JPA.

Registro  formal  de  un  incidente  técnico  en  el  sistema,  auto-numerado  y
vinculado al Código_Ejército del activo afectado.

Registro cronológico e inalterable de todas las acciones realizadas sobre
los datos críticos del sistema (quién, cuándo, qué).

Estado que se activa cuando el inventario disponible de una categoría de
equipo desciende por debajo del umbral configurable (20% por defecto).

EMCH “CFB” | Grupo 03 | Página 7 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

BCrypt

TLS

Algoritmo  de  hashing  adaptativo  para  el  almacenamiento  seguro  de
contraseñas, resistente a ataques de fuerza bruta.

Transport Layer Security: protocolo de cifrado de comunicaciones (versión
1.2 o superior requerida).

JPA / Hibernate

Java  Persistence  API  e  implementación  de  referencia  para  el  mapeo
objeto-relacional con MySQL.

Scrum

Marco  de  trabajo  ágil  de  gestión  de  proyectos  basado  en  sprints  de
entrega incremental (Schwaber & Sutherland, 2020).

EMCH “CFB” | Grupo 03 | Página 8 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

3. DESCRIPCIÓN DE LA SITUACIÓN ACTUAL

3.1 Pros y Contras de la Situación Actual

3.1.1 Fortalezas de la Situación Actual

ID

Nombre

Descripción

FOR-01

Familiaridad
personal con Excel

del

El personal DTIC domina el manejo de hojas de cálculo Excel,
lo cual facilitó la migración de datos históricos y el diseño de
la plantilla de carga masiva del nuevo sistema.

FOR-02

Datos
disponibles

históricos

La  institución  cuenta  con  un  inventario  documentado  en
Excel que servirá como insumo para la carga masiva inicial al
sistema.

FOR-03

Infraestructura
tecnológica propia

La  EMCH  “CFB”  dispone  de  servidor  institucional  para  el
despliegue interno, eliminando costos de infraestructura en la
nube.

3.1.2 Debilidades de la Situación Actual

ID

Nombre

Descripción / Impacto Operativo

DEB-01

Inconsistencias  en
registros

DEB-02

Ausencia
trazabilidad
activos

DEB-03

alertas

Sin
reposición

de
de

de

El manejo manual de hojas Excel genera duplicidades, datos
desactualizados
único,
imposibilitando el control preciso del inventario.

identificador

y  activos

sin

No  existe  registro  cronológico  de  los  cambios  de  estado
(asignación, reparación, baja) de cada equipo, lo que impide
la auditoría de activos.

La  gestión  reactiva  del  stock  genera  desabastecimiento
la
imprevisto  y  compras  no  planificadas,  afectando
continuidad operativa.

DEB-04

Gestión  informal  de
incidentes

Los incidentes técnicos se registran verbalmente o por correo,
sin  tickets  formales,  sin  SLAs  y  sin  generación  de  actas  de
conformidad.

DEB-05

Reportes  manuales
e imprecisos

La generación de informes para directivos es lenta, propensa
a  errores  y  no  permite  análisis  en  tiempo  real  del  parque
informático.

EMCH “CFB” | Grupo 03 | Página 9 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

3.2 Modelos de Procesos de Negocio Actuales

3.2.1 Descripción de los Actores de Negocio Actuales

ID

Actor

Descripción

ANA-01

Jefe DTIC

Responsable  de la toma de decisiones estratégicas sobre el
parque
informático.  Actualmente  aprueba  compras  y
asignaciones con base en reportes Excel.

ANA-02

Subjefe DTIC

Coordina las operaciones técnicas diarias. Recibe reporte de
incidentes verbalmente y asigna técnicos.

ANA-03

Técnico de Campo

Ejecuta  el  mantenimiento,  asignación  y  reparación  de
equipos. Actualiza el Excel manualmente.

ANA-04

Directivo EMCH

Consume reportes ad-hoc  generados  manualmente para la
toma de decisiones institucionales.

ANA-05

Dpto. Logística

Recibe solicitudes de reposición de equipos basadas en hojas
Excel sin criterios automáticos de stock mínimo.

3.2.2 Descripción de Procesos de Negocio Actuales

ID

Proceso

Descripción

Debilidad Asociada

PNA-01

Registro  de  nuevo
equipo

PNA-02

Asignación de equipo

PNA-03

Atención de incidente
técnico

técnico

El
actualiza
manualmente  una  hoja  Excel
los  datos  del  equipo
con
recibido.

jefe

El
aprueba
DTIC
verbalmente  la  asignación;  el
técnico  anota  el  cambio  en
Excel.

DEB-01:  duplicidades  y
campos incompletos.

DEB-02:  sin  trazabilidad
automática.

incidente

El
reporta
verbalmente; el técnico atiende
sin ticket ni registro formal.

se

DEB-04: sin SLAs ni actas.

PNA-04

Baja de equipo

Se elimina el registro del Excel  o
se  marca  manualmente  como
“baja” sin historial.

DEB-02:
auditado.

sin

historial

PNA-05

Generación
reporte

de

jefe

DTIC

genera
El
manualmente
de
inventario  para  directivos  y
logística.

informes

DEB-05:
impreciso.

lento

e

EMCH “CFB” | Grupo 03 | Página 10 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

3.3 Entorno Tecnológico Actual

3.3.1 Descripción del Entorno de Hardware Actual

La EMCH “CFB” cuenta con servidor institucional interno (especificaciones exactas a confirmar con
el  DTIC  durante  la  Fase  0),  red  de  intranet  con  protocolo  HTTPS  habilitado,  y  equipos  de
escritorio/laptops  para  el  personal  DTIC.  No  existe  un  servidor  de  aplicaciones  dedicado  para
sistemas de información internos del DTIC.

3.3.2 Descripción del Entorno de Software Actual

Componente

Descripción

Sistema operativo

Windows (estaciones de trabajo del personal DTIC)

Gestión de inventario  Microsoft Excel (hojas de cálculo no estructuradas, sin versionamiento)

Notificaciones

Solo notificaciones internas al panel del usuario (no SMTP)

Navegadores
disponibles

Google Chrome, Mozilla Firefox, Microsoft Edge (versiones recientes)

Base de datos actual

No aplica – la información se almacena en archivos .xlsx locales

EMCH “CFB” | Grupo 03 | Página 11 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

4. NECESIDADES DE NEGOCIO

4.1 Objetivos de Negocio

ID

Descripción

Criterio de Éxito

Prioridad

ON-01

ON-02

ON-03

ON-04

ON-05

ON-06

Digitalizar  el  ciclo  de  vida  de
activos TI con identificación única
institucional (Código_Ejército)

100%  de  equipos  registrados
con  identificador  único  en  el
sistema

Alta

Implementar mesa de ayuda con
SLAs  formalizados  por  tipo  de
incidente

≥90%  de
dentro
correspondiente

tickets
del

resueltos
SLA

Alta

Automatizar  alertas  preventivas
de  stock  crítico  al  Jefe  DTIC  y
Logística

eventos

0
desabastecimiento
notificado  en
post-implantación

de
no
los  6  meses

Alta

Proveer
diferenciados  por
toma de decisiones

dashboards
la
rol  para

Tiempo  de  generación  de
reporte  ≤  5  segundos  vs.
proceso manual actual

Media

Garantizar
seguridad,
la
integridad  y  disponibilidad  de  la
parque
información
informático

del

Disponibilidad  del
sistema
≥99%  en  horario  operativo;  0
incidentes  de  pérdida  de
datos

Alta

Generar  actas  de  conformidad
PDF  automáticas  al  cierre  de
cada incidente

100% de tickets cerrados con
acta
y
generada
disponible para descarga

PDF

Media

4.2 Modelos de Procesos de Negocio a Implantar

4.2.1 Descripción de los Actores de Negocio a Implantar

ID

Actor

Descripción en el nuevo sistema

Actor Actual Relacionado

ANI-01

Administrador

ANI-02

Jefe DTIC

ANI-03

Subjefe DTIC

Gestiona usuarios, roles y catálogos
del  sistema.  Único  con  acceso
total  a
la  configuración  del
sistema.

Personal DTIC asignado

Aprueba  asignaciones,  visualiza
dashboards  estratégicos,
recibe
alertas de stock crítico y SLA.

ANA-01

Supervisa la operación de tickets e
inventario.  Escala
incidentes
fuera de SLA.

los

ANA-02

ANI-04

Técnico
Campo

de

actualiza
equipos,
Registra
estados, crea y gestiona tickets de
incidentes. Genera actas PDF.

ANA-03

EMCH “CFB” | Grupo 03 | Página 12 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

ANI-05

Directivo

ANI-06

Motor de Notificaciones Internas

Acceso  de
lectura  al
solo
dashboard ejecutivo y exportación
de reportes institucionales.

ANA-04

NotificadorService: componente interno del backend que
genera y persiste notificaciones en la base de datos
para consulta desde el panel del usuario.

N/A

4.2.2 Descripción de Procesos de Negocio a Implantar

ID

Proceso

Descripción

Actores

PNI-01

Registro  y  gestión  de
activo TI

El  Técnico
registra  el  equipo  con
Código_Ejército,  metadatos  técnicos  y
estado
inicial.  El  sistema  persiste  el
registro y genera evento en el Audit Trail.

ANI-04, ANI-02

PNI-02

Asignación de equipo

PNI-03

Apertura  y  gestión  de
ticket

PNI-04

Baja de equipo

PNI-05

Alerta de stock crítico

PNI-06  Generación de reporte

El  Jefe  DTIC  asigna  un  equipo  a  un
usuario  de  un  área.  El  sistema  cambia
a
automáticamente
“Asignado”  y  registra  el  evento  con
timestamp.

estado

el

El  Técnico  abre  un  ticket  vinculado  al
Código_Ejército. El motor de SLA inicia el
contador. El flujo de estados es: Abierto
→ En Proceso → Resuelto → Cerrado. Al
cerrar, el sistema genera el acta PDF.

El  Técnico  registra  la  baja  indicando
causa y responsable. El sistema marca el
equipo como “Dado de Baja” y archiva
el registro en el histórico inalterable.

Cuando el inventario disponible de una
categoría  cae  bajo  el  umbral  (20%),  el
sistema  dispara  automáticamente  una
notificación  interna  al  panel  del  Jefe  DTIC.

El  Directivo  o  Jefe  DTIC  selecciona  el
tipo  de  reporte  (por  área,  antigüedad,
incidentes) y exporta en PDF o Excel.

ANI-02, ANI-04

ANI-04,
ANI-02

ANI-03,

ANI-04, ANI-02

ANI-02, ANI-06

ANI-02, ANI-05

EMCH “CFB” | Grupo 03 | Página 13 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

5. DESCRIPCIÓN DE LOS SUBSISTEMAS DEL SISTEMA A DESARROLLAR

ID

Subsistema

Descripción

Importancia  Prioridad

SS-01

Usuarios y Seguridad

los

requisitos

de
Agrupa
autenticación  local,  gestión  del
ciclo  de  vida  de  cuentas  (CRUD)
con validación de DNI y control de
acceso RBAC a nivel de endpoint
y vista.

Crítica

Alta

SS-02

Inventario de Activos TI

SS-03

Mesa  de  Ayuda
Incidentes

/

Agrupa  los  requisitos  de  registro,
estados,  asignación,  histórico  de
bajas  y  carga  masiva  de  activos
con
único
identificador
Código_Ejército.

Agrupa los requisitos de gestión de
tickets  auto-numerados,  motor  de
SLAs por tipo de incidente, flujo de
estados y generación  automática
de actas PDF.

Crítica

Alta

Alta

Alta

SS-04

Business Intelligence

SS-05

Notificaciones
Automáticas

los

requisitos

Agrupa
de
dashboards  diferenciados  por
inventario  e
perfil,  reportes  de
exportación  a
incidentes
Excel/PDF.

y

Agrupa los requisitos del motor de
alertas
crítico,
notificaciones internas al panel del Jefe DTIC.

stock

de

Media

Media

Media

Media

EMCH “CFB” | Grupo 03 | Página 14 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

6. CATÁLOGO DE REQUISITOS DEL SISTEMA A DESARROLLAR

6.1 Requisitos Generales del Sistema

Los siguientes requisitos generales (características del sistema) definen las capacidades de alto nivel
que debe ofrecer el sistema, derivadas directamente de los objetivos de negocio.

RG-01

Gestión Integral de Identidades y Accesos

Dependencias

ON-05

Descripción

El sistema deberá gestionar el ciclo de vida completo de cuentas de usuario
(creación,  lectura,  actualización  y  baja  lógica)  con  5  roles  diferenciados
(Administrador,  Jefe  DTIC,  Subjefe  DTIC,  Técnico  de  Campo,  Directivo),
validación de duplicidad de DNI y control de acceso por endpoints (RBAC).

Importancia

Crítica

Prioridad

Estado

Alta

Aprobado

RG-02

Control del Ciclo de Vida de Activos TI

Dependencias

ON-01, ON-04

Descripción

El  sistema  deberá  registrar  y  gestionar  el  ciclo  de  vida  completo  de  los
activos  TI  (PCs  y  laptops)  mediante  el  identificador  único  Código_Ejército,
controlando  los  estados  (En  Bodega,  Asignado,  En  Reparación,  Prestado,
Dado de Baja) y manteniendo un histórico inalterable de todos los cambios.

Importancia

Crítica

Prioridad

Estado

Alta

Aprobado

RG-03

Mesa de Ayuda con Motor de SLAs

Dependencias

ON-02, ON-06

Descripción

Importancia

Prioridad

Estado

El sistema deberá gestionar tickets de incidentes técnicos auto-numerados,
vinculados  al  Código_Ejército  del  activo  afectado,  con  flujo  de  estados
(Abierto → En Proceso → Resuelto → Cerrado), cálculo automático de SLAs
por tipo de incidente y generación automática de actas PDF al cierre.

Alta

Alta

Aprobado

EMCH “CFB” | Grupo 03 | Página 15 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

RG-04

Inteligencia de Negocio y Reportes

Dependencias

ON-04

Descripción

Importancia

Prioridad

Estado

El sistema deberá proveer dashboards diferenciados por perfil de usuario con
visualizaciones en tiempo real, reportes por área, antigüedad e incidentes, y
exportación de datos en formatos PDF y Excel.

Media

Media

Aprobado

RG-05

Notificaciones Automáticas de Stock Crítico

Dependencias

ON-03

Descripción

El sistema deberá disparar automáticamente notificaciones internas al panel del usuario
cuando el inventario disponible de cualquier categoría de equipo caiga por
debajo del umbral configurable (20% por defecto, configurable por tipo de equipo).

Importancia

Alta

Prioridad

Estado

Media

Aprobado

EMCH “CFB” | Grupo 03 | Página 16 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

6.2 Casos de Uso del Sistema

6.2.1 Diagramas de Casos de Uso del Sistema

Los casos de uso se organizan por subsistema. A continuación se detallan los actores y casos de uso
identificados. Los diagramas UML de casos de uso se adjuntan como Anexo B.

Figura 1. Diagrama General de Casos de Uso del Sistema

EMCH “CFB” | Grupo 03 | Página 17 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

Figura 2. Diagrama de Casos de Uso del Módulo Usuarios y Seguridad

EMCH “CFB” | Grupo 03 | Página 18 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

Figura 3. Diagrama de Casos de Uso del Módulo Inventario de Activos TI

EMCH “CFB” | Grupo 03 | Página 19 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

Figura 4. Diagrama de Casos de Uso del Módulo Mesa de Ayuda e Incidentes

EMCH “CFB” | Grupo 03 | Página 20 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

Figura 5. Diagrama de Casos de Uso del Módulo Dashboard y Reportes

EMCH “CFB” | Grupo 03 | Página 21 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

Figura 6. Diagrama de Casos de Uso del Módulo Notificaciones y Alertas

EMCH “CFB” | Grupo 03 | Página 22 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

6.2.2 Especificación de Actores del Sistema

ID

Actor

Descripción del Rol en el Sistema

Actor Negocio

ACT-01

Administrador

ACT-02

Jefe DTIC

roles  y
Gestiona  el  catálogo  de  usuarios,
parámetros del sistema. Acceso total a todos los
módulos incluyendo configuración de umbrales
de stock y SLAs.

Aprueba  asignaciones  de  equipos,  visualiza  el
dashboard  estratégico  completo,
recibe
notificaciones de stock crítico y tickets fuera de
SLA.

ANI-01

ANI-02

ACT-03

Subjefe DTIC

Supervisa y escala tickets de incidentes. Acceso
al dashboard operativo y reportes de incidentes.

ANI-03

ACT-04

Técnico
Campo

de

Opera  el  módulo  de  inventario  (CRUD  de
equipos,  cambios  de  estado)  y  el  módulo  de
incidentes  (apertura,  actualización  y  cierre  de
tickets, generación de PDF).

ANI-04

ACT-05

Directivo

Acceso de solo lectura al dashboard ejecutivo.
Puede exportar reportes en PDF y Excel.

ANI-05

ACT-06

NotificadorService

Componente interno del backend (@Scheduled + @Service).
Genera notificaciones internas en la BD ante eventos de
stock crítico o SLA vencido. No requiere SMTP externo.

ANI-06

6.2.3 Especificación de Casos de Uso del Sistema

CU-01

Autenticación de Usuario

Dependencias

RG-01

Precondición

El usuario dispone de credenciales activas en el sistema.

Descripción

El sistema deberá comportarse como sigue cuando el usuario accede a la
URL del sistema: (1) El usuario ingresa usuario y contraseña en el formulario de
login. (2) El sistema valida las credenciales contra la BD (BCrypt). (3) Si son
correctas, redirige al dashboard según su rol. (4) Si son incorrectas, muestra
mensaje de error genérico.

Postcondición

Sesión autenticada creada; acceso restringido al rol correspondiente.

Excepciones

Actores

Prioridad

E1: Credenciales inválidas → mensaje genérico, sin revelar campo específico
incorrecto. E2: Cuenta bloqueada → notificación al Administrador.

ACT-01, ACT-02, ACT-03, ACT-04, ACT-05

Alta

EMCH “CFB” | Grupo 03 | Página 23 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

CU-02

Registrar Equipo Informático

Dependencias

RG-02

Precondición

El usuario autenticado tiene rol Técnico de Campo, Subjefe o Jefe DTIC.

Descripción

El sistema deberá comportarse como sigue cuando el Técnico selecciona
“Nuevo Equipo”: (1) El Técnico completa el formulario con Código_Ejército
(máscara C1010-EMCH-XXXX), tipo, marca, modelo, número de serie, CPU,
RAM,  disco,
IP,  MAC  y  área.  (2)  El  sistema  valida  unicidad  del
Código_Ejército.  (3)  Persiste  el  registro  con  estado  inicial  “En  Bodega”  y
genera evento en Audit Trail.

Postcondición

Equipo  registrado  en  BD;  evento  registrado  en  Audit  Trail  con  timestamp  y
usuario responsable.

Excepciones

Actores

Prioridad

E1: Código_Ejército duplicado → mensaje de error, no persiste. E2: Campos
obligatorios vacíos → validación cliente/servidor.

ACT-04

Alta

EMCH “CFB” | Grupo 03 | Página 24 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

CU-03

Apertura y Cierre de Ticket de Incidente

Dependencias

RG-03

Precondición

El equipo afectado está registrado en el sistema con Código_Ejército válido.

Descripción

registra

Técnico

incidente

(1)
tipo
(Hardware/Software/Red/Impresora)  y  descripción.  (2)  Sistema  asigna
número automático e inicia cronómetro SLA. (3) Técnico actualiza estado a
“En Proceso”. (4) Al resolver, Técnico cierra el ticket. (5) Sistema genera acta
PDF automáticamente.

vinculando  Código_Ejército,

Postcondición

Ticket en estado “Cerrado”; acta PDF generada y disponible para descarga.

Excepciones

E1:  SLA  excedido  →  ticket  marcado  “Fuera  de  SLA”  y  notificación
automática al Jefe/Subjefe DTIC.

Actores

ACT-04, ACT-03, ACT-02

Rendimiento

Generación de acta PDF: ≤ 3 segundos.

Prioridad

Alta

EMCH “CFB” | Grupo 03 | Página 25 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

6.3 Requisitos Funcionales del Sistema

6.3.1 Requisitos de Información del Sistema

El sistema deberá almacenar y mantener la integridad de las siguientes entidades de información:

ID

Entidad

Datos Específicos

RI-01

Equipo
Informático

RI-02

Usuario
Sistema

del

RI-03

Ticket
Incidente

de

RI-04

Audit Trail

Código_Ejército (PK, máscara C1010-EMCH-XXXX), tipo (PC/Laptop),
marca,  modelo, número de serie, CPU, RAM (GB),  disco (GB/tipo),
dirección  MAC,  dirección  IP,  área  asignada,  usuario  asignado,
estado, fecha de registro, fecha de última modificación.

ID  de  usuario  (PK  autoincremental),  nombre  completo,  DNI
(UNIQUE),  nombre  de  usuario,  hash  de  contraseña  (BCrypt),  rol
(ENUM:  Administrador  |  Jefe  DTIC  |  Subjefe  DTIC  |  Técnico  |
Directivo), área, estado (activo/inactivo), fecha de creación, último
acceso.

Número de ticket (PK auto-numerado), Código_Ejército (FK), tipo de
incidente  (ENUM:  Hardware  |  Software  |  Red  |  Impresora),
descripción,  estado  (Abierto  |  En  Proceso  |  Resuelto  |  Cerrado),
técnico  asignado  (FK  usuario),  fecha/hora  apertura,  fecha/hora
cierre, cumple SLA (booleano), ruta del acta PDF.

ID  evento  (PK),  entidad  afectada,  ID  entidad,  tipo  de  operación
(CREATE  |  UPDATE  |  DELETE  |  ASSIGN  |  STATUS_CHANGE),  valor
anterior, valor nuevo, usuario responsable (FK), timestamp (UTC).

RI-05

Catálogo
Áreas

de

ID  área  (PK),  nombre  del  área,  código  institucional,  responsable,
estado (activo/inactivo).

RI-06

Notificación

ID notificación (PK), tipo (ENUM: STOCK_CRÍTICO | SLA_VENCIDO |
TICKET_CERRADO),  mensaje,  destinatario  (FK  usuario),  fecha/hora
generación, estado (leída/no leída).

EMCH “CFB” | Grupo 03 | Página 26 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

6.3.2 Requisitos de Reglas de Negocio del Sistema

ID

Nombre

Descripción

RN-01

Unicidad
Código_Ejército

de

El  sistema  deberá  rechazar  el  registro  de  un  equipo  cuyo
Código_Ejército  ya  exista  en  la  BD,  independientemente  del
estado del equipo existente.

RN-02

Unicidad  de  DNI
de usuario

El sistema deberá rechazar la creación de una cuenta de usuario
con un DNI ya registrado, incluso si el usuario previo está en estado
inactivo.

RN-03

Cálculo
automático  de
SLA

El sistema deberá iniciar el contador de SLA en el momento exacto
de apertura del ticket y marcarlo como “Fuera de SLA” si el tiempo
de  resolución  excede:  Hardware  ≤24h,  Software  ≤8h,  Red  ≤4h,
Impresora ≤48h.

RN-04

Umbral  de  stock
crítico

El  sistema  deberá  disparar  la  alerta  cuando  la  cantidad  de
equipos  en  estado  “En  Bodega”  sea  inferior  al  20%  del  total
registrado en esa categoría. El umbral debe ser configurable por
el Administrador.

RN-05

Inviolabilidad  del
Audit Trail

Ningún  usuario,  incluyendo  el  Administrador,  podrá  modificar  o
eliminar  registros  del  Audit  Trail.  El  acceso  al  mismo  es  de  solo
lectura.

RN-06

Transición
estados
equipo

de
de

Los cambios de estado deben seguir el flujo permitido: En Bodega
→  Asignado  |  Prestado  |  En  Reparación.  Asignado  →  En
Reparación | Prestado | Dado de Baja. Cualquier estado → Dado
de Baja (con causa documentada).

RN-07

RBAC  estricto  a
nivel de endpoint

El  control  de  acceso  debe  aplicarse  tanto  en  la  capa  de
presentación  (vistas)  como  en  la  capa  de  negocio  (endpoints
REST/HTTP), impidiendo el acceso a recursos no autorizados incluso
mediante manipulación de URL.

6.3.3 Requisitos de Conducta del Sistema

ID

Nombre

Descripción

Interfaz

RC-01

Generación  de
acta PDF

RC-02

Notificación  de
SLA vencido

El sistema deberá generar automáticamente un acta
de  conformidad  en  formato  PDF  cuando  un  ticket
transite al estado “Cerrado”, incluyendo: número  de
ticket,  equipo  afectado,  descripción  del  incidente,
técnico  responsable,  fechas  de  apertura  y  cierre,  y
campo de firma física.

El  sistema  deberá  notificar  automáticamente  al  Jefe
DTIC  y  Subjefe  DTIC  mediante  notificación  interna  al  panel  cuando  un  ticket
supere el tiempo de resolución establecido en el SLA
correspondiente.

RC-03

Alerta  de  stock
crítico

El sistema deberá verificar el nivel de stock cada vez
que  se  registre  una  salida  o  baja  de  equipo  y,  si  se

No

Sí

Sí

EMCH “CFB” | Grupo 03 | Página 27 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

supera  el  umbral,  generar  notificación  interna  al  panel  del  Jefe
DTIC de manera automática.

RC-04

Exportación  de
reportes

El sistema deberá permitir la exportación de cualquier
reporte o listado en formato .xlsx (Apache POI) y .pdf
(OpenPDF), sin límite de registros.

No

RC-05

Carga  masiva
con validación

El  sistema  deberá  procesar  archivos  .csv  o  .xlsx  para
ingesta  masiva  de  equipos,  validando  el  esquema
(tipos  de  datos,  campos  obligatorios,  duplicados)
antes de persistir, y generando un reporte  de errores
por fila.

No

EMCH “CFB” | Grupo 03 | Página 28 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

6.4 Requisitos No Funcionales del Sistema

6.4.1 Requisitos de Fiabilidad

ID

Nombre

Especificación Técnica

Prioridad

RNF-01

Disponibilidad
del sistema

RNF-02

Respaldo
automático

El  sistema  deberá  mantener  una  disponibilidad
mínima  del  99.0%  durante  el  horario  operativo
inactividad  no
institucional.  Tiempo  máximo  de
planificada: 7.2 horas/mes.

El  sistema  deberá  ejecutar  backups  automáticos
diarios  de  la  base  de  datos  (mysqldump)  con
retención de 30 días. El proceso de backup no deberá
afectar la disponibilidad del servicio.

Alta

Alta

RNF-03

Tolerancia
fallos parciales

a

Un  fallo  en  el  módulo  de  notificaciones  internas  no
deberá  afectar  la  operatividad  de  los  módulos  de
inventario e incidentes.

Media

6.4.2 Requisitos de Usabilidad

ID

Nombre

Especificación Técnica

Prioridad

RNF-04

Tiempo
aprendizaje

de

RNF-05

Diseño
responsivo

RNF-06

Identidad  visual
institucional

El personal administrativo sin formación específica en
TI  deberá  ser  capaz  de  operar  los  módulos  de
inventario  e  incidentes  después  de  una  sesión  de
capacitación de 2 horas.

Alta

La  interfaz  deberá  ser  completamente  funcional  en
resoluciones  de  escritorio  (mínimo  1280x720),  con
diseño  responsivo  implementado  con  Bootstrap  5  /
Tailwind CSS.

Media

La  paleta  de  colores  deberá  respetar  la  identidad
visual  de  la  EMCH:  primario  #1B4332  (verde  oscuro
militar),  secundario  #2D6A4F  (verde  medio),  acento
#D8F3DC (verde claro).

Baja

6.4.3 Requisitos de Eficiencia

ID

Nombre

Especificación Técnica

Prioridad

RNF-07

Tiempo
respuesta

de

El sistema deberá responder a cualquier petición del
usuario en menos de 2 segundos bajo carga normal
(hasta 50 usuarios concurrentes).

Alta

RNF-08

Escalabilidad  de
datos

El  sistema  deberá  operar  sin  degradación  de
rendimiento  con  hasta  10,000  registros  de  equipos  y
50,000 registros de eventos en el Audit Trail.

Media

RNF-09

Concurrencia

El  sistema  deberá  soportar  hasta  50  usuarios
concurrentes  sin  generar  condiciones  de  carrera
(race  conditions)  en  las  operaciones  de  escritura
sobre el inventario.

Alta

EMCH “CFB” | Grupo 03 | Página 29 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

6.4.4 Requisitos de Mantenibilidad

ID

Nombre

Especificación Técnica

Prioridad

RNF-
10

Arquitectura
modular

El sistema deberá implementarse bajo el patrón MVC
(o Clean Architecture) con separación estricta entre
capa de presentación, lógica de negocio y acceso a
datos,  permitiendo  actualizaciones  independientes
por módulo.

Alta

RNF-
11

Documentación  de
código

El código fuente deberá incluir Javadoc en todas las
clases de servicio y repositorio, con cobertura mínima
del 80% de los métodos públicos.

Media

RNF-
12

Catálogos
parametrizables

La  parametrización  de  marcas,  modelos  y  tipos  de
interfaz  de
equipos  deberá  realizarse  desde
administración, sin requerir modificaciones al código
fuente ni recompilación.

la

Alta

6.4.5 Requisitos de Portabilidad

ID

Nombre

Especificación Técnica

Prioridad

RNF-
13

Compatibilidad  de
navegadores

El sistema deberá ser 100% funcional en las versiones
más  recientes  de  Google  Chrome,  Mozilla  Firefox  y
Microsoft Edge.

Alta

RNF-
14

Instalabilidad
documentada

Se  deberá  proveer  un  manual  de  instalación  que
permita  al  personal  DTIC  desplegar  el  sistema  en  el
servidor institucional de forma autónoma.

Media

6.4.6 Requisitos de Seguridad

ID

Nombre

Especificación Técnica

RNF-15

Cifrado
contraseñas

de

Todas las contraseñas deberán almacenarse en base
de  datos  únicamente  en  forma  de  hash  generado
con el algoritmo BCrypt (factor de coste ≥10). Queda
prohibido el almacenamiento en texto plano.

Prioridad

Crítica

RNF-16

Comunicación
cifrada

Todo el tráfico HTTP deberá redirigirse forzosamente a
HTTPS. El certificado TLS deberá ser TLS 1.2 o superior.
Se prohíbe el uso de protocolos SSLv3 y TLS 1.0/1.1.

Crítica

RNF-17

Audit
inalterable

Trail

El  sistema  deberá  registrar  en  el  Audit  Trail  toda
operación  de  escritura  (CREATE,  UPDATE,  DELETE,
ASSIGN,  STATUS_CHANGE)  sobre  entidades  críticas,
incluyendo actor, entidad, valores anterior/posterior y
timestamp UTC. Los registros del Audit Trail son de solo
lectura para todos los roles.

Alta

EMCH “CFB” | Grupo 03 | Página 30 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

RNF-18

Protección
contra  ataques
web

El sistema deberá implementar protección contra SQL
Injection
(mediante  consultas  parametrizadas
JPA/Hibernate),  XSS  (saneamiento  de  entradas)  y
CSRF (token en formularios).

Alta

6.4.7 Otros Requisitos No Funcionales

ID

Nombre

Especificación Técnica

Prioridad

RNF-19

Normativa
uso interno

de

RNF-20

Idioma

El  sistema  opera  en  el  servidor  institucional  de  la  EMCH  “CFB”,
accesible  mediante  el  dominio  https://sgi.escuelamilitar.edu.pe
bajo  HTTPS.  El  acceso  requiere  autenticación  obligatoria  (JWT + RBAC);
no se permite el acceso sin credenciales válidas.

La  interfaz  de  usuario  y  toda  la  documentación
técnica  (manual  de  usuario,  manual  de  instalación)
deberán estar en idioma español.

Alta

Alta

6.5 Restricciones Técnicas del Sistema

ID

Nombre

Descripción

RT-01

Backend Java

El backend deberá desarrollarse en Java SE con JDK
17 LTS o superior, empleando Spring Boot o Jakarta EE
framework.  Queda  prohibido  el  uso  de
como
lenguajes de backend distintos (Python, PHP, Node.js)
en esta versión.

Prioridad

Crítica

RT-02

Base  de  datos
MySQL

La capa de persistencia deberá implementarse sobre
MySQL  8.x.  El  acceso  a  la  BD  se  realizará  mediante
Hibernate/JPA.  Se  permiten  triggers  de  BD  para  la
lógica de alertas de stock (RF09).

Crítica

RT-03

Frontend
React SPA

RT-04

Servidor
Spring Boot
+ Docker

RT-05

Control
versiones Git

de

RT-06

Generación  de
PDF

El frontend se implementa como Single Page Application
con React 18 + TypeScript + Vite 6. La comunicación con
el backend se realiza mediante fetchWithAuth (JWT Bearer).
La librería de componentes UI es shadcn/ui.

El  backend  se  ejecuta  con  el  servidor  embebido  de  Spring
Boot  3.5  (Tomcat  embebido).  El  despliegue  completo  se
realiza  mediante  Docker  Compose  en  el  servidor  institucional
de  la  EMCH  “CFB”  (6  servicios:  db,  backend,  frontend,  docs,
backup, redis).

El proyecto se gestiona con Git y GitHub, con la estrategia
de  rama  única  main  (producción  directa).  Las  funcionalidades
se  desarrollan  en  ramas  feature/<nombre>  y  se  integran  a
main  mediante  Pull  Request.  Los  commits  siguen  la  convención
Conventional Commits (feat/fix/docs/refactor).

La generación de documentos PDF se realiza mediante
OpenPDF (fork de iText 2, librería Java de código abierto).
Queda prohibido el uso de servicios de terceros en la
nube para la generación de PDF.

Alta

Alta

Alta

Alta

RT-07

Despliegue en servidor institucional con acceso público autenticado

El sistema se desplegará en el servidor institucional de la EMCH "CFB" mediante Docker Compose, accesible públicamente a través del dominio https://sgi.escuelamilitar.edu.pe con autenticación JWT obligatoria (RBAC). Queda prohibido el despliegue en servicios cloud públicos (AWS, Azure, GCP) sin autorización del Sponsor.

Crítica

DTIC

6.6 Requisitos de Integración e Interfaces del Sistema

ID

Componente

Descripción

Prioridad

RI-INT-01

NotificadorService
(interno)

RI-INT-02

Apache
(Excel)

POI

RI-INT-03

OpenPDF

RI-INT-04

MySQL
(triggers)

8.x

El sistema utiliza el componente interno NotificadorService
(@Scheduled + @Service de Spring Boot) para generar
notificaciones internas ante eventos de stock crítico y SLA
vencido. No requiere integración con servidor SMTP externo.

El sistema deberá utilizar la librería Apache POI para
la  lectura  de  archivos  .xlsx  en  la  función  de  carga
masiva  (RF05)  y  para  la  exportación  de  reportes  en
formato Excel (RF10).

El sistema deberá utilizar OpenPDF para
la generación automática de actas de conformidad
en  PDF  al  cierre  de  tickets  (RC-01)  y  para  la
exportación de reportes institucionales.

El sistema podrá utilizar triggers nativos de MySQL para
la  detección  automática  de  condiciones  de  stock
crítico,  garantizando  la  consistencia  del  disparador
aun  cuando  el  servidor  de  aplicaciones  no  esté
procesando peticiones activas.

Alta

Alta

Alta

Media

6.7 Información Sobre Trazabilidad

La siguiente matriz establece la trazabilidad entre los Requisitos Generales (RG) y los Objetivos de
Negocio (ON):

Requisito
General

ON-01

ON-02

ON-03

ON-04

ON-05

ON-06

Sprint

RG-01
Identidades

Gest.

RG-02  Ciclo  de
Vida Activos

✔

RG-03  Mesa  de
Ayuda SLAs

RG-04
Reportes

BI

y

✔

✔

✔

Sprint 1

Sprint 2

✔

Sprint 3

Sprint 4

✔

✔

EMCH “CFB” | Grupo 03 | Página 32 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

RG-05
Notificaciones

✔

Sprint 5

EMCH “CFB” | Grupo 03 | Página 33 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

7. CRONOGRAMA SCRUM

Sprint

Módulo / Entregable

Responsables

Fechas Ajustadas  Deadline

Fase 0

Sprint 1

Sprint 2

Sprint 3

Sprint 4

Sprint 5

Kick-off,
arquitectura,
Product Backlog y entorno
configurado

Todos

30/03/2026
05/04/2026

Usuarios

Módulo
y
Seguridad (autenticación,
5 roles, CRUD, RBAC)

Módulo  Inventario  (CRUD
equipos,
estados,
histórico, carga masiva)

Módulo
Incidentes
(tickets,  motor  SLA,  PDF
automático)

Reportes,
Módulo
Dashboard  y  exportación
Excel/PDF

Notificaciones,
integración,
pruebas
finales  y  corrección  de
bugs

Chavarría  /  Andia  /
Orozco

06/04/2026
19/04/2026

Chavarría / Orozco /
Pariona / Andia

20/04/2026
10/05/2026

Chavarría / Orozco /
Pariona / Andia

11/05/2026
31/05/2026

Chavarría / Orozco /
Pariona / Andia

01/06/2026
14/06/2026

Todos

15/06/2026
28/06/2026

–

–

–

–

–

–

05/04/2026

19/04/2026

10/05/2026

31/05/2026

14/06/2026

28/06/2026

Cierre

Pruebas  de  aceptación,
despliegue en producción
y entrega final

Todos

29/06/2026
 – 16/07/2026

16/07/2026

★ Los Sprints 5 y Cierre forman parte de la fase de producción.

EMCH “CFB” | Grupo 03 | Página 34 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

ANEXOS

Anexo A: SLAs Definidos por Tipo de Incidente

Tipo de Incidente

T. Respuesta

T. Resolución

Acción si se Excede el SLA

Hardware
RAM, HDD)

(CPU,

Software
aplicaciones)

(SO,

Red
(conectividad,
WiFi)

Impresora
(hardware/driver)

2 horas

24 horas

1 hora

8 horas

30 minutos

4 horas

2 horas

48 horas

Ticket  marcado  “Fuera  de  SLA”;
notificación automática al Jefe DTIC.

Ticket  marcado  “Fuera  de  SLA”;
escalado al Subjefe DTIC.

Ticket  marcado  “Fuera  de  SLA”;
alerta de alta prioridad al Jefe DTIC.

Ticket  marcado  “Fuera  de  SLA”;
evaluación de reparación o baja del
activo.

Anexo B: KPIs del Sistema

KPI

Disponibilidad  del  sistema  (Up-
time)

Meta

≥99.0%

Frecuencia de Medición

Mensual (horario operativo)

Tickets resueltos dentro del SLA

≥90%

Semanal por tipo de incidente

Tiempo  promedio  de  resolución
de incidentes

< 12 horas (promedio)  Mensual por técnico

Equipos con stock crítico activo

0 (alertas ≤24h)

Tiempo real (trigger automático)

Activos  sin  trazabilidad  o  estado
indefinido

0%

Diario (reporte automático)

Tiempo  de  respuesta  del  sistema
por petición

< 2 segundos

Continuo (monitoreo rendimiento)

Backups
correctamente

diarios

ejecutados

100%

Diario (log de ejecución)

EMCH “CFB” | Grupo 03 | Página 35 de 36

Sistema Web de Gestión de Inventario de Equipos Informáticos – EMCH “CFB”
Especificación de Requerimiento de Software

DTIC

Anexo C: Glosario de Acrónimos y Abreviaturas

Acrónimo

Definición

DTIC

Departamento de Tecnologías de la Información y Comunicaciones

EMCH “CFB”

Escuela Militar de Chorrillos “Coronel Francisco Bolognesi”

SRS

RBAC

SLA

CRUD

MVC

ORM

JPA

ITAM

SMTP

TLS

PDF

POI

IEEE

ISO/IEC

BPMN

UML

MADEJA

Especificación  de  Requerimientos  de  Software  (Software  Requirements
Specification)

Role-Based Access Control – Control de Acceso Basado en Roles

Service Level Agreement – Acuerdo de Nivel de Servicio

Create, Read, Update, Delete

Model-View-Controller – Patrón Arquitectónico

Object-Relational Mapping

Java Persistence API

IT Asset Management – Gestión de Activos TI

Simple Mail Transfer Protocol

Transport Layer Security

Portable Document Format

Poor Obfuscation Implementation – librería Apache para gestión de archivos
Office

Institute of Electrical and Electronics Engineers

International Organization for Standardization / International Electrotechnical
Commission

Business Process Model and Notation

Unified Modeling Language

Marco de Desarrollo de la Junta de Andalucía – metodología de referencia
para SRS

Anexo D: Referencias Normativas

•
•

IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications.
ISO/IEC/IEEE  29148:2018:  Systems  and  software  engineering  –  Life  cycle  processes  –
Requirements engineering.
ISO/IEC 25010:2011: Systems and software Quality Requirements and Evaluation (SQuaRE).
ITIL v4 Foundation: IT Asset Management (ITAM) practices.

•
•
•  MADEJA: Marco de Desarrollo de la Junta de Andalucía – Plantillas y guías para ERS.
•  Schwaber, K. & Sutherland, J. (2020). The Scrum Guide. Scrum.org.
•  Project Management Institute. (2021). PMBOK® Guide, 7ª Edición. PMI.

EMCH “CFB” | Grupo 03 | Página 36 de 36


