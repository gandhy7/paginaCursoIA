# Pruebas realizadas · Gandhy

11 grupos de pruebas aprobados. Ejecutados con los scripts reales y una representación DOM instrumentada del HTML, mediante Node VM. No se utilizó navegador ni renderizador visual.

- Aprobado: Gandhy: inicio vacío, indicadores reales y pestañas accesibles
- Aprobado: Gandhy: guardar/editar desde formulario y mantener confirmación visible
- Aprobado: Gandhy: fechas, relaciones y eliminación sin datos huérfanos
- Aprobado: Gandhy: indicadores excluyen cerradas y respetan fecha de corte
- Aprobado: Gandhy: importación CSV revisada, cancelable y completa
- Aprobado: Gandhy: CSV duplicado o inválido no produce importaciones parciales
- Aprobado: Gandhy: respaldo preview y validación atómica de relaciones
- Aprobado: Gandhy: textos peligrosos se muestran como texto y exportación neutraliza fórmulas
- Aprobado: Gandhy: memoria y almacenamiento corrupto preservan el original
- Aprobado: 03: contacto prepara, copia y limpia borrador sin enviar
- Aprobado: Gandhy: el guion sigue las ediciones y se oculta al eliminar el registro

Auditoría del conjunto: enlaces y fragmentos locales, identificadores únicos, recursos, etiquetas de campos y sintaxis JavaScript. Los datos de pruebas no están precargados en la herramienta.

## Revisión del 26 de noviembre de 2026

Los 22 grupos de regresión de ambos proyectos volvieron a pasar. Se añadieron las siguientes comprobaciones de problemas concretos:

- Aprobado: Gandhy: búsqueda por acentos y palabras en orden libre
- Aprobado: Gandhy: edición pendiente protege cambio de registro y exportación
- Aprobado: Gandhy: salir avisa por borrador y guardar limpia el aviso
- Aprobado: Gandhy: error tardío de un CSV anterior no invalida la revisión nueva
- Aprobado: Límite de respaldo: datos demasiado grandes no sustituyen el estado

Sin inspección visual en navegador.
