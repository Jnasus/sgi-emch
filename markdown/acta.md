**ACTA DE CONSTITUCIÓN DEL PROYECTO**

|  |  |  |  |
| --- | --- | --- | --- |
| **Nombre del Proyecto:** | Sistema Web de Gestión de Inventario de Equipos Informáticos para la EMCH "CFB" | | |
| **Fecha:** | 05/04/2026 | **Jefe de Proyecto:** | Pariona Torres, Jonas Efrain |
| **Sponsor / Patrocinador:** | TCO2 EP MORALES PEREZ Edgar Oscar  Departamento de DTIC – Escuela Militar de Chorrillos "Coronel Francisco Bolognesi" | | |
| **1. JUSTIFICACIÓN** | | | |
| El Departamento de Tecnologías de la Información y Comunicaciones (DTIC) de la Escuela Militar de Chorrillos "Coronel Francisco Bolognesi" (EMCH "CFB") gestiona actualmente el inventario de equipos informáticos de manera manual, empleando hojas de cálculo Excel. Este método genera inconsistencias en los registros, dificulta la trazabilidad de los activos, impide la generación oportuna de alertas de reposición y limita la capacidad de respuesta ante incidentes técnicos.  Ante esta situación, el miembro del equipo Jonas Efrain Pariona Torres, quien trabaja en la institución, ha identificado la necesidad de desarrollar un sistema web interno que centralice la gestión del inventario, registre incidentes técnicos con niveles de servicio (SLAs), y automatice las notificaciones de stock mínimo, brindando información precisa y oportuna al Jefe DTIC y a los Directivos para la toma de decisiones. | | | |
| **2. OBJETIVOS ESTRATÉGICOS Y CRITERIOS DE ÉXITO** | | | |
| **Objetivos Estratégicos** | | **Criterios de Éxito** | |
| 1. Identificar y digitalizar los procesos de gestión de inventario y atención de incidentes del Dpto. DTIC de la EMCH "CFB". | | El sistema debe cubrir el 100% de los procesos de inventario e incidentes identificados en el levantamiento de información. | |
| 2. Cumplir con los estándares de calidad del producto de software desarrollado. | | El sistema no debe presentar errores de funcionalidad crítica al momento de su implementación (0 bugs críticos). | |
| 3. Cumplir con los plazos establecidos para el desarrollo, pruebas y despliegue del sistema. | | No exceder los plazos del cronograma de sprints. El sistema debe estar en producción el 16/07/2026. | |
| 4. Desarrollar el Sistema Web de Gestión de Inventario de Equipos Informáticos para la EMCH "CFB". | | No exceder el presupuesto de recursos aprobado. Entregar todos los módulos funcionales definidos en el alcance. | |
| **3. BREVE DESCRIPCIÓN DEL PROYECTO** | | | |
| El proyecto consiste en el desarrollo e implementación de un sistema web para la gestión integral del inventario de equipos informáticos y el registro de incidentes técnicos en la EMCH "CFB", desplegado en el servidor institucional y accesible mediante el dominio https://sgi.escuelamilitar.edu.pe. El sistema integra los siguientes módulos:  • Módulo de Usuarios y Seguridad: autenticación JWT con 4 roles operativos (Administrador, Jefe DTIC, Subjefe DTIC, Técnico) y acceso de Directivos al dashboard.  • Módulo de Inventario: registro y gestión del ciclo de vida completo de equipos (PCs, laptops, impresoras), control de estados, historial de cambios, especificaciones técnicas y carga masiva desde Excel.  • Módulo de Incidentes: tickets auto-numerados (TKT-YYYYMM-NNNN), SLAs por tipo de incidente (Hardware, Software, Red, Impresora) y generación automática de PDF al cierre.  • Módulo de Reportes y Dashboard: paneles diferenciados por perfil, KPIs en tiempo real, reportes por área y antigüedad, exportación a Excel y PDF.  • Módulo de Notificaciones: alertas automáticas internas al panel del usuario cuando el stock de equipos caiga por debajo del umbral configurable o un ticket supere su SLA.  El desarrollo se realiza bajo metodología ágil Scrum, con Sprint 0 de inicio y 6 Sprints de desarrollo. El proyecto se ejecuta entre el 30/03/2026 y el 16/07/2026. | | | |
| **Responsables por la EMCH "CFB"** | | **Responsables del Equipo de Desarrollo** | |
| • TCO2 EP MORALES PEREZ Edgar Oscar (Sponsor / Representante DTIC)  • Jefe DTIC – EMCH "CFB"  • Subjefe DTIC – EMCH "CFB" | | • Pariona Torres, Jonas Efrain (Jefe de Proyecto)  • Chavarría Navarro, Aldair  • Andia Canchi, Henrry Jhon  • Orozco Romero, Kattia | |
| **4. PRINCIPALES INTERESADOS** | | | |
| 1. TCO2 EP MORALES PEREZ Edgar Oscar – Representante de la EMCH "CFB" y Sponsor del proyecto.  2. Jefe del Departamento DTIC – Usuario principal y aprobador de entregables.  3. Subjefe DTIC – Usuario clave en la validación de requerimientos.  4. Técnicos de Campo del DTIC – Usuarios operativos del módulo de incidentes e inventario.  5. Directivos de la EMCH "CFB" – Usuarios del dashboard ejecutivo.  6. Departamento de Logística – Receptor de informes de reposición de equipos.  7. Personal del Departamento DTIC en general – Usuarios del sistema. | | | |
| **5. REQUISITOS GENERALES Y RESTRICCIONES** | | | |
| **Requisitos del Proyecto** | | **Requisitos del Producto** | |
| 1. La EMCH "CFB" debe asignar un líder usuario (TCO2 EP MORALES PEREZ) para coordinar el levantamiento de información.  2. La EMCH debe proveer acceso al servidor institucional para pruebas y despliegue.  3. Se debe entregar el inventario actual en Excel para la migración inicial de datos.  4. La institución debe asignar disponibilidad del personal DTIC para validaciones. | | 1. El sistema debe registrar y gestionar el ciclo de vida completo de equipos informáticos (PCs, laptops, impresoras).  2. El sistema debe gestionar 4 roles operativos (Administrador, Jefe DTIC, Subjefe DTIC, Técnico) con control de acceso por módulo y rol.  3. El sistema debe registrar incidentes técnicos con tickets numerados automáticamente, control de SLAs y generación de PDF al cierre.  4. El sistema debe generar reportes exportables a Excel y PDF con filtros por área, estado y tipo.  5. El sistema debe enviar alertas automáticas de stock mínimo y SLA vencido mediante notificaciones internas al panel del usuario. | |
| **Restricciones** | | | |
| 1. El proyecto debe realizarse dentro de los plazos establecidos en el cronograma (30/03/2026 – 16/07/2026).  2. El sistema se desplegará en el servidor institucional de la EMCH "CFB", accesible mediante dominio propio con autenticación obligatoria (RBAC).  3. En la fase actual no se contempla integración con Active Directory ni portal de autoservicio para usuarios finales.  4. Cada integrante del equipo debe cumplir sus entregables en los plazos de cada sprint. | | | |
| **6. RIESGOS PRINCIPALES** | | | |
| R1: Cambio del representante o sponsor de la EMCH "CFB" (TCO2 EP MORALES PEREZ Edgar Oscar).  R2: Poca disponibilidad del personal DTIC de la EMCH "CFB" para el levantamiento de información y validaciones.  R3: Acceso limitado o tardío al servidor institucional para despliegue y pruebas.  R4: Migración incompleta o inconsistente de datos históricos desde las hojas Excel existentes.  R5: Resistencia al cambio por parte del personal habituado al manejo de inventario en Excel.  R6: Cambios en la estructura organizativa de áreas/departamentos durante el desarrollo. | | | |
| **7. CRONOGRAMA DE HITOS PRINCIPALES** | | | |
| **Hito / Entregable** | | **Responsable** | **Fecha Programada** |
| Sprint 0 – Kick-off, arquitectura, Product Backlog y entorno de desarrollo listo | | Todos | 05/04/2026 |
| Sprint 1 – Módulo Usuarios y Seguridad (autenticación JWT, roles RBAC, CRUD) | | Chavarría / Andia / Orozco | 19/04/2026 |
| Sprint 2 – Módulo Inventario (CRUD, estados, historial, especificaciones, carga masiva Excel) | | Chavarría / Orozco / Pariona / Andia | 10/05/2026 |
| Sprint 3 – Módulo Incidentes (tickets, SLAs automáticos, historial, PDF al cierre) | | Chavarría / Orozco / Pariona / Andia | 31/05/2026 |
| Sprint 4 – Módulo Reportes, Dashboard con KPIs y exportación Excel/PDF | | Chavarría / Orozco / Pariona / Andia | 14/06/2026 |
| Sprint 5 – Notificaciones internas, monitoreo (Grafana), backup automático y documentación | | Todos | 28/06/2026 |
| Sprint 6 – UAT, corrección de defectos, módulo bajas/transferencias y entrega final | | Todos | 16/07/2026 |
| **8. PRESUPUESTO GLOBAL PRELIMINAR** | | | |
| El proyecto es de naturaleza académica; el equipo de desarrollo no percibe remuneración. Las herramientas utilizadas (Spring Boot, React, MySQL, Docker, Git/GitHub) son de código abierto y sin costo de licencia. El presupuesto refleja los **costos operativos institucionales** que la EMCH "CFB" incurre para sostener el desarrollo y despliegue del sistema durante el período 05/04/2026 – 16/07/2026 (aprox. 3.5 meses). | | | |
| **N°** | **Rubro** | **Costo mensual (S/.)** | **Total estimado (S/.)** |
| 1 | Servicio de Internet institucional (1 Gbps, fibra óptica) | 7,500.00 × 3.5 meses | 26,250.00 |
| 2 | Energía eléctrica — sala de servidores DTIC | 620.00 × 3.5 meses | 2,170.00 |
| 3 | Aire acondicionado — consumo y mantenimiento mensual | 340.00 × 3.5 meses | 1,190.00 |
| 4 | Fluido eléctrico — suministro general área DTIC | 280.00 × 3.5 meses | 980.00 |
| 5 | Mantenimiento correctivo/preventivo del servidor institucional | 400.00 × 3.5 meses | 1,400.00 |
| 6 | Soporte de infraestructura TI (técnico institucional asignado) | 220.00 × 3.5 meses | 770.00 |
| **TOTAL PRESUPUESTO** | | **S/. 9,360.00 / mes** | **S/. 32,760.00** |
| *Fuente: contrato institucional EMCH "CFB" (internet 1 Gbps — S/. 90,000/año), tarifas Enel/Luz del Sur para uso comercial Lima 2026 (energía eléctrica y fluido eléctrico), proveedores de mantenimiento TI Lima 2026. El servidor es infraestructura propia de la EMCH; los montos de mantenimiento y soporte corresponden al costo proporcional asignado al proyecto.* | | | |
| **9. CRITERIOS DE APROBACIÓN** | | | |
| 1. El sistema debe contemplar al 100% los módulos y funcionalidades definidos en el alcance.  2. Todos los entregables de cada sprint deben ser validados y aprobados por el representante de la EMCH "CFB".  3. Las pruebas de aceptación deben ser realizadas con el personal DTIC y no presentar errores críticos.  4. La documentación técnica y el manual de usuario deben ser entregados antes de la puesta en producción.  5. El sistema debe desplegarse correctamente en el servidor institucional y estar operativo al cierre del proyecto. | | | |
| **10. CRITERIOS PARA ABORTAR EL PROYECTO** | | | |
| 1. Que el equipo de desarrollo no cumpla con las fechas acordadas en el cronograma de sprints por causas imputables al equipo.  2. Que la EMCH "CFB" no provea acceso al servidor institucional ni a la información necesaria para el desarrollo.  3. Que se presenten problemas insuperables al momento del despliegue en el ambiente de producción.  4. Que la EMCH "CFB" solicite formalmente la cancelación del proyecto. | | | |
| **11. NIVEL DE AUTORIDAD DEL JEFE DE PROYECTO** | | | |
| **Autorización** | | | **Aplica** |
| Acceder a la información del cliente y negociar cambios en el alcance | | | ✓ |
| Programar reuniones del proyecto con el equipo y los representantes de la EMCH "CFB" | | | ✓ |
| Aprobar la distribución de tareas del equipo y sus modificaciones | | | ✓ |
| Gestionar el cronograma y reportar avances al Sponsor | | | ✓ |
| Negociar con el representante de la EMCH los recursos necesarios para el proyecto | | | ✓ |
| **12. APROBACIÓN Y FIRMAS** | | | |
| **Rol** | **Nombre** | **Firma** | **Fecha** |
| Sponsor / Representante EMCH "CFB" | TCO2 EP MORALES PEREZ Edgar Oscar |  | \_\_\_/\_\_\_/2026 |
| Jefe de Proyecto | Pariona Torres, Jonas Efrain |  | \_\_\_/\_\_\_/2026 |
| Desarrollador | Chavarría Navarro, Aldair |  | \_\_\_/\_\_\_/2026 |
| Desarrollador | Andia Canchi, Henrry Jhon |  | \_\_\_/\_\_\_/2026 |
| Desarrolladora | Orozco Romero, Kattia |  | \_\_\_/\_\_\_/2026 |

*Documento elaborado por el Grupo 03 – EMCH "CFB" | Proyecto: Sistema Web de Gestión de Inventario de Equipos Informáticos*