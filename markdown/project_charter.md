# PROJECT CHARTER
## Sistema Web de Gestion de Inventario de Equipos Informaticos para la EMCH "CFB"

**Facultad de Ingenieria**
**Carrera Profesional de Ingenieria de Sistemas e Informatica**
**Curso:** Integrador II -- Sistemas | Universidad Tecnologica del Peru

---

## 1. Identificacion del Proyecto

| Campo | Valor |
|---|---|
| **Nombre del proyecto** | Sistema Web de Gestion de Inventario de Equipos Informaticos -- EMCH "CFB" (SGI-EMCH) |
| **Nombre corto** | SGI-EMCH |
| **Jefe de Proyecto** | Pariona Torres, Jonas Efrain |
| **Sponsor / Patrocinador** | TCO2 EP MORALES PEREZ Edgar Oscar -- Departamento DTIC, Escuela Militar de Chorrillos "Coronel Francisco Bolognesi" |
| **Fecha de inicio** | 30/03/2026 |
| **Fecha de fin** | 16/07/2026 |
| **Duracion total** | ~15 semanas (Sprint 0 + 6 Sprints) |
| **Repositorio** | https://github.com/Jnasus/sgi-emch |
| **Sistema en produccion** | https://sgi.escuelamilitar.edu.pe |
| **Documentacion** | https://sgi-docs.escuelamilitar.edu.pe |

---

## 2. Necesidad del Negocio

El Departamento de Tecnologias de la Informacion y Comunicaciones (DTIC) de la Escuela Militar de Chorrillos "Coronel Francisco Bolognesi" (EMCH "CFB") gestionaba su inventario de equipos informaticos de manera completamente manual, empleando hojas de calculo Microsoft Excel como unico repositorio de informacion.

Esta situacion generaba las siguientes problematicas criticas:

| ID | Problema | Impacto |
|---|---|---|
| P-01 | Inconsistencias de datos: diferentes versiones del Excel con informacion contradictoria sobre estado y ubicacion de equipos | Imposibilidad de conocer el inventario real en tiempo real |
| P-02 | Ausencia de trazabilidad: sin registro historico de cambios de estado (asignaciones, reparaciones, bajas, prestamos) | Perdida de informacion critica; imposibilidad de auditar movimientos |
| P-03 | Sin alertas de reposicion: el DTIC no recibe notificaciones cuando el stock cae bajo un umbral minimo | Riesgo de desabastecimiento sin tiempo de reaccion |
| P-04 | Gestion informal de incidentes: reportes de fallas por via verbal o correo, sin tickets formales, sin SLA, sin actas de cierre | Falta de metricas de servicio; imposibilidad de medir el rendimiento del equipo tecnico |
| P-05 | Reportes manuales e imprecisos: generacion de reportes para la direccion requiere horas de trabajo manual con datos desactualizados | Decisiones directivas basadas en informacion imprecisa |

El SGI-EMCH resuelve estas problematicas mediante una plataforma web centralizada que digitaliza el ciclo de vida de los activos TI, formaliza la mesa de ayuda tecnica y proporciona informacion en tiempo real al Jefe DTIC y Directivos.

---

## 3. Alcance del Proyecto

### 3.1. Descripcion del sistema

Sistema web para la gestion integral del inventario de equipos informaticos y la atencion de incidentes tecnicos en la EMCH "CFB". Desplegado en el servidor institucional y accesible mediante el dominio https://sgi.escuelamilitar.edu.pe, con autenticacion JWT obligatoria y control de acceso basado en roles (RBAC).

### 3.2. Modulos incluidos

| Modulo | Descripcion |
|---|---|
| **Usuarios y Seguridad** | Autenticacion JWT (access 1 h + refresh 24 h), 5 roles RBAC (ADMINISTRADOR, JEFE_DTIC, SUBJEFE_DTIC, TECNICO, DIRECTIVO), CRUD de usuarios, auditoria de acciones |
| **Inventario de Equipos** | Registro del ciclo de vida completo (alta, asignacion, reparacion, prestamo, transferencia, baja), especificaciones tecnicas, historial de estados inmutable, carga masiva desde Excel |
| **Incidentes y Tickets** | Tickets auto-numerados (TKT-YYYYMM-NNNN), SLAs por tipo de incidente (Hardware, Software, Red, Impresora), historial de cambios, generacion de acta PDF al cierre |
| **Reportes y Dashboard** | Dashboard con KPIs en tiempo real diferenciado por perfil, 6 tipos de reporte exportables a Excel y PDF, filtros por area, estado, tipo y antiguedad |
| **Notificaciones** | Alertas internas automaticas al panel del usuario: SLA vencido, stock critico, ticket asignado; scheduler @Scheduled cada 5 minutos |
| **Monitoreo y Backup** | Prometheus + Grafana 11.5.2 + Loki + Promtail (17 paneles pre-provisionados); backup automatico diario (mysqldump + gzip, retencion 7 dias) |
| **Documentacion** | Sitio Docusaurus con 20+ paginas: arquitectura, API, guia de usuario, guia de administrador |

### 3.3. Fuera del alcance

- Integracion con Active Directory o directorio LDAP institucional.
- Portal de autoservicio para usuarios finales (usuarios comunes).
- Gestion de activos distintos a equipos informaticos (vehiculos, armas, infraestructura civil).
- Modulo de facturacion o gestion financiera.
- Notificaciones por correo electronico externo (SMTP); solo notificaciones internas al panel.

---

## 4. Entregables del Proyecto

| N° | Entregable | Sprint | Estado |
|---|---|---|---|
| E-01 | Sistema de autenticacion JWT con 5 roles RBAC y CRUD de usuarios | Sprint 1 | [OK] Entregado |
| E-02 | Modulo de inventario con ciclo de vida completo y carga masiva Excel | Sprint 2 | [OK] Entregado |
| E-03 | Modulo de incidentes con SLA automatico, historial y PDF al cierre | Sprint 3 | [OK] Entregado |
| E-04 | Dashboard con KPIs y modulo de reportes exportables Excel/PDF | Sprint 4 | [OK] Entregado |
| E-05 | Notificaciones internas, monitoreo Grafana y backup automatico | Sprint 5 | [OK] Entregado |
| E-06 | Documentacion Docusaurus publicada en produccion | Sprint 5-6 | [OK] Entregado |
| E-07 | Modulo de bajas y transferencias con flujo formal de aprobacion | Sprint 6 | [En curso] |
| E-08 | Pruebas de aceptacion de usuario (UAT) con personal DTIC-EMCH | Sprint 6 | [En curso] |
| E-09 | Acta de aceptacion firmada por el Sponsor | Sprint 6 | [Pendiente] |
| E-10 | Informe academico final y documentacion tecnica completa | Sprint 6 | [En curso] |

---

## 5. Riesgos Principales

| ID | Riesgo | Probabilidad | Impacto | Estrategia de mitigacion |
|---|---|---|---|---|
| R1 | Cambio del representante o Sponsor de la EMCH (TCO2 EP MORALES PEREZ) | Baja | Alto | Documentar todos los acuerdos por escrito; mantener comunicacion con la jefatura del DTIC |
| R2 | Poca disponibilidad del personal DTIC para levantamiento de informacion y validaciones | Media | Alto | Jonas Pariona Torres actua como enlace interno; sesiones de validacion agendadas con anticipacion |
| R3 | Acceso limitado o tardio al servidor institucional para despliegue y pruebas | Media | Alto | Entorno de desarrollo local con Docker; migracion a produccion planificada al inicio del Sprint 5 |
| R4 | Migracion incompleta o inconsistente de datos historicos desde hojas Excel existentes | Media | Medio | Modulo de carga masiva con validacion previa (fase de verificar antes de confirmar); plantilla Excel con dropdowns controlados |
| R5 | Resistencia al cambio por parte del personal habituado al manejo de inventario en Excel | Baja | Medio | Documentacion Docusaurus con guias de usuario; sesiones de capacitacion durante UAT |
| R6 | Cambios en la estructura organizativa de areas o departamentos durante el desarrollo | Baja | Bajo | Catalogo de areas configurable por el Administrador sin necesidad de modificar codigo |

---

## 6. Suposiciones y Dependencias

### Suposiciones

1. La EMCH "CFB" provee acceso al servidor institucional para pruebas y despliegue productivo.
2. El personal DTIC tiene disponibilidad para sesiones de validacion y pruebas UAT segun el cronograma.
3. Los datos actuales del inventario en Excel seran entregados para la migracion inicial mediante el modulo de carga masiva.
4. La red interna y el acceso a internet del servidor institucional son estables para el uso continuo del sistema.
5. El dominio https://sgi.escuelamilitar.edu.pe permanece activo y configurado durante todo el ciclo del proyecto.

### Dependencias

| Dependencia | Responsable | Critica |
|---|---|---|
| Acceso al servidor institucional EMCH | DTIC -- EMCH "CFB" | Si |
| Inventario actual en Excel para migracion inicial | DTIC -- EMCH "CFB" | No |
| Disponibilidad de usuarios DTIC para UAT | DTIC -- EMCH "CFB" | Si |
| Dominio y certificado SSL activos | Administrador de red EMCH | Si |
| Firma del acta de aceptacion por el Sponsor | TCO2 EP MORALES PEREZ | Si |

---

## 7. Presupuesto del Proyecto

El proyecto es de naturaleza academica; el equipo de desarrollo no percibe remuneracion. Las herramientas utilizadas (Spring Boot, React, MySQL, Docker, Git/GitHub) son de codigo abierto sin costo de licencia.

El presupuesto refleja los **costos operativos institucionales** que la EMCH "CFB" incurre para sostener el desarrollo y despliegue del sistema.

**Periodo de calculo:** 05/04/2026 -- 16/07/2026 (~3.5 meses)

| N° | Rubro | Descripcion | Costo mensual (S/.) | Meses | Total (S/.) |
|---|---|---|---|---|---|
| 1 | Internet institucional | Fibra optica 1 Gbps (contrato anual S/. 90,000/anio); necesario para el despliegue y operacion continua del sistema | 7,500.00 | 3.5 | 26,250.00 |
| 2 | Energia electrica | Consumo de la sala de servidores del DTIC (servidor principal, switches, UPS) | 620.00 | 3.5 | 2,170.00 |
| 3 | Aire acondicionado | Consumo electrico y mantenimiento mensual del equipo de climatizacion de la sala de servidores | 340.00 | 3.5 | 1,190.00 |
| 4 | Fluido electrico | Suministro electrico general del area DTIC (iluminacion, estaciones de trabajo, equipos de red) | 280.00 | 3.5 | 980.00 |
| 5 | Mantenimiento de servidor | Mantenimiento correctivo y preventivo del servidor institucional | 400.00 | 3.5 | 1,400.00 |
| 6 | Soporte de infraestructura TI | Costo proporcional del tecnico institucional asignado al soporte de red y servidor | 220.00 | 3.5 | 770.00 |
| | **TOTAL ESTIMADO** | | **9,360.00** | -- | **S/. 32,760.00** |

*Fuente: contrato institucional EMCH "CFB" (internet 1 Gbps -- S/. 90,000/anio), tarifas Enel/Luz del Sur para uso comercial Lima 2026, proveedores de mantenimiento TI Lima 2026.*
*Nota: El servidor es infraestructura propia de la EMCH; no incluye costo de hardware ni licencias de software.*

---

## 8. Cronograma de Hitos

Ver Gantt completo en: `gantt.md`

| Hito / Entregable | Responsable | Fecha programada | Estado |
|---|---|---|---|
| Sprint 0 -- Kick-off, arquitectura, Product Backlog y entorno de desarrollo | Todos | 05/04/2026 | [OK] Completado |
| Sprint 1 -- Modulo Usuarios y Seguridad (JWT, RBAC, CRUD) | Chavarria / Andia / Orozco | 19/04/2026 | [OK] Completado |
| Sprint 2 -- Modulo Inventario (CRUD, estados, historial, carga masiva Excel) | Chavarria / Orozco / Pariona / Andia | 10/05/2026 | [OK] Completado |
| Sprint 3 -- Modulo Incidentes (tickets, SLAs, historial, PDF al cierre) | Chavarria / Orozco / Pariona / Andia | 31/05/2026 | [OK] Completado |
| Sprint 4 -- Modulo Reportes, Dashboard con KPIs y exportacion Excel/PDF | Chavarria / Orozco / Pariona / Andia | 14/06/2026 | [OK] Completado |
| Sprint 5 -- Notificaciones, monitoreo (Grafana), backup y documentacion | Todos | 28/06/2026 | [OK] Completado |
| Sprint 6 -- UAT, correccion de defectos, modulo bajas/transferencias y entrega final | Todos | 16/07/2026 | [En curso] |

---

## 9. Equipo del Proyecto

### 9.1. Equipo de desarrollo

| Rol | Nombre | Responsabilidad principal |
|---|---|---|
| **Jefe de Proyecto / Desarrollador** | Pariona Torres, Jonas Efrain | Lider de proyecto, enlace con la EMCH, desarrollo full-stack, despliegue y monitoreo |
| **Desarrollador** | Chavarria Navarro, Aldair | Desarrollo backend (Spring Boot), modulo de inventario, modulo de incidentes |
| **Desarrollador** | Andia Canchi, Henrry Jhon | Desarrollo backend (Spring Boot), modulo de usuarios, modulo de reportes |
| **Desarrolladora** | Orozco Romero, Kattia | Desarrollo frontend (React/TypeScript), pruebas, documentacion Docusaurus |

### 9.2. Comite de aprobacion

| Rol | Nombre / Cargo | Responsabilidad |
|---|---|---|
| **Sponsor** | TCO2 EP MORALES PEREZ Edgar Oscar | Aprobacion de entregables, firma del acta de aceptacion, acceso al servidor institucional |
| **Aprobador tecnico** | Jefe del Departamento DTIC -- EMCH "CFB" | Validacion funcional del sistema, coordinacion de pruebas UAT con el personal DTIC |
| **Usuario clave** | Subjefe DTIC -- EMCH "CFB" | Validacion de requerimientos, participacion en pruebas de aceptacion |

---

## 10. Criterios de Aprobacion y Exito

1. El sistema debe implementar al 100% los modulos y funcionalidades definidos en el alcance.
2. Todos los entregables de cada sprint deben ser validados por el representante de la EMCH "CFB".
3. Las pruebas de aceptacion (UAT) deben realizarse con el personal DTIC sin errores criticos (0 bugs criticos al cierre).
4. La documentacion tecnica (Docusaurus) y el manual de usuario deben estar publicados antes de la puesta en produccion definitiva.
5. El sistema debe estar desplegado y operativo en https://sgi.escuelamilitar.edu.pe al cierre del proyecto (16/07/2026).
6. El Sponsor debe firmar el acta de aceptacion antes del 16/07/2026.

---

## 11. Criterios para Abortar el Proyecto

1. El equipo de desarrollo no cumple con las fechas acordadas en el cronograma por causas imputables al equipo.
2. La EMCH "CFB" no provee acceso al servidor institucional ni a la informacion necesaria para el desarrollo.
3. Problemas insuperables durante el despliegue en el ambiente de produccion.
4. La EMCH "CFB" solicita formalmente la cancelacion del proyecto.

---

## 12. Nivel de Autoridad del Jefe de Proyecto

| Autorizacion | Aplica |
|---|---|
| Acceder a la informacion del cliente y negociar cambios en el alcance | Si |
| Programar reuniones del proyecto con el equipo y representantes de la EMCH "CFB" | Si |
| Aprobar la distribucion de tareas del equipo y sus modificaciones | Si |
| Gestionar el cronograma y reportar avances al Sponsor | Si |
| Negociar con el representante de la EMCH los recursos necesarios para el proyecto | Si |

---

## 13. Aprobacion y Firmas

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Sponsor / Representante EMCH "CFB" | TCO2 EP MORALES PEREZ Edgar Oscar | __________ | ___/___/2026 |
| Jefe de Proyecto | Pariona Torres, Jonas Efrain | __________ | ___/___/2026 |
| Desarrollador | Chavarria Navarro, Aldair | __________ | ___/___/2026 |
| Desarrollador | Andia Canchi, Henrry Jhon | __________ | ___/___/2026 |
| Desarrolladora | Orozco Romero, Kattia | __________ | ___/___/2026 |

---

*Documento elaborado por el Grupo 03 -- EMCH "CFB"*
*Proyecto: Sistema Web de Gestion de Inventario de Equipos Informaticos*
*Version: 1.0 | Fecha: 05/04/2026 | Ultima actualizacion: 10/06/2026*
