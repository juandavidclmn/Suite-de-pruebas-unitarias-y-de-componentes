# Mapa de Estrategia de Pruebas — Task Manager

Este documento identifica los tipos de prueba aplicables a la aplicación, dónde se ubican en la pirámide de pruebas, un ejemplo concreto sobre el código de este proyecto, y por qué detectar el defecto en esa capa sale más barato que dejarlo llegar a producción (con un caso real de la industria por tipo).

## La pirámide (y sus excepciones)

```
        /\
       /E2E\          pocas, lentas, caras, alta confianza
      /------\
     /Contrato\       validan la "forma" de los datos entre sistemas
    /----------\
   /Integración \     varias piezas trabajando juntas
  /--------------\
 /   Unitarias    \   muchas, rápidas, baratas
/------------------\
```

Accesibilidad no encaja en un solo nivel: es una preocupación **transversal** (como seguridad o performance) que se puede probar tanto a nivel de componente como en un flujo E2E. Se incluye aparte por eso mismo.

---

## 1. Pruebas unitarias

**Propósito:** validar una función o hook puro en aislamiento total, sin renderizar UI ni tocar red.

**Nivel en la pirámide:** base — la capa más numerosa, rápida (ms) y barata de mantener.

**Ejemplo concreto:** `src/utils/validateTask.ts` y `src/utils/filterTasks.ts` (`__tests__/utils/`) — dado un título vacío, ¿`validateTask` rechaza correctamente? Dado un array de tareas y un filtro `"completed"`, ¿`filterTasks` devuelve solo las completadas? También `useCounter` (`__tests__/hooks/useCounter.test.ts`).

**Costo-beneficio (caso real):** el cohete **Ariane 5** explotó 37 segundos después del despegue en 1996 porque se reutilizó, sin volver a probar, un módulo de conversión de velocidad horizontal (de 64 bits a 16 bits) heredado del Ariane 4, cuyos parámetros de vuelo eran distintos. Un valor superó el rango esperado, causó un overflow no capturado, y el sistema de guiado colapsó. Pérdida: ~$370 millones USD en el cohete y su carga. Una prueba unitaria sobre ese módulo con los nuevos parámetros de vuelo habría costado minutos; el defecto en producción costó una misión completa.

---

## 2. Pruebas de integración

**Propósito:** verificar que varias piezas (componente + hook + estado) colaboran correctamente, sin mockear todo hasta el hueso.

**Nivel en la pirámide:** capa intermedia — menos numerosas que las unitarias, más lentas, pero cubren interacción real entre módulos.

**Ejemplo concreto:** `__tests__/integration/CreateTaskScreen.test.tsx` — renderiza `CreateTaskScreen` completa (que usa `TaskForm` + `useCreateTask` + `TaskList`), escribe un título, presiona "Guardar", y verifica que el mensaje "Tarea creada exitosamente" aparezca. Esto no lo detecta un test unitario de `TaskForm` solo, porque el bug podría estar en cómo `CreateTaskScreen` conecta el `onSubmit` con el hook.

**Costo-beneficio (caso real):** **Knight Capital Group** perdió **$440 millones USD en 45 minutos** en 2012. Al desplegar código nuevo, un ingeniero olvidó actualizar uno de ocho servidores de producción; ese servidor reactivó una ruta de código obsoleta ("Power Peg") que nadie esperaba que corriera junto al código nuevo. No fue un bug de una función aislada — fue la *interacción* entre el código nuevo y el viejo, en producción, lo que nadie probó integrado. Una suite de integración que ejercitara el sistema desplegado como un todo (no servidor por servidor de forma aislada) habría expuesto el problema antes del mercado abierto.

---

## 3. Pruebas de contrato

**Propósito:** validar que la *forma* de los datos que entran/salen de una API (tipos, campos requeridos, enums válidos) cumple lo acordado, sin depender de que el backend real esté disponible.

**Nivel en la pirámide:** frontera entre integración y E2E — no cubre lógica de UI ni el backend real, solo el "acuerdo" de datos entre las dos partes.

**Ejemplo concreto:** `__tests__/contract/taskApi.contract.test.ts` — usa `TaskSchema`/`TaskListSchema` (Zod) para comprobar que una respuesta simulada de `GET /tasks` tiene `id: string`, `title: string` y `status` dentro del enum permitido; y que se detecta cuando falta un campo o el tipo es incorrecto.

**Costo-beneficio (caso real):** la sonda **Mars Climate Orbiter** de la NASA se perdió en 1999 (**$327.6 millones USD**) porque el equipo de Lockheed Martin enviaba datos de empuje en **libras-fuerza por segundo** mientras el software de navegación del JPL esperaba **newtons por segundo** — dos sistemas que "hablaban" entre sí sin un contrato de datos verificado. Es exactamente el tipo de discrepancia que una prueba de contrato (validar unidades/esquema antes de confiar en los datos del otro sistema) habría detectado en segundos, en vez de perder la sonda al entrar a la atmósfera marciana.

---

## 4. Pruebas end-to-end (E2E)

**Propósito:** simular el flujo completo de un usuario real sobre la app corriendo de verdad (dispositivo/emulador), sin mockear nada del stack de UI.

**Nivel en la pirámide:** cúspide — pocas, lentas (segundos/minutos), costosas de mantener, pero son las que más se parecen a "lo que ve el usuario".

**Ejemplo concreto (no implementado aún en este proyecto):** con una herramienta como **Detox** o **Maestro**, abrir la app en un emulador Android/iOS real, escribir un título en el campo de texto, tocar "Guardar", y verificar visualmente que la tarea aparece en la lista y se muestra la confirmación — cubriendo cosas que Jest + jsdom no puede (renderizado nativo real, gestos táctiles, navegación entre pantallas). *Nota: hoy el proyecto solo tiene el equivalente "de integración" corriendo en jsdom (`__tests__/integration/`), no E2E real sobre el runtime nativo — sería la siguiente pieza a agregar en una carpeta `e2e/`.*

**Costo-beneficio (caso real):** el lanzamiento de **Healthcare.gov** en 2013 casi no soportó tráfico real el primer día: la mayoría de usuarios no pudo completar el flujo de registro. Las piezas se habían probado por separado, pero nunca se ejecutó el flujo completo de extremo a extremo bajo condiciones realistas antes del lanzamiento. El remedio post-lanzamiento (equipo de rescate técnico, reescritura de partes del sistema) costó **cientos de millones de dólares adicionales**, además del daño reputacional. Un conjunto de pruebas E2E ejecutando el flujo real de registro antes del día de lanzamiento habría expuesto los cuellos de botella con una fracción de ese costo.

---

## 5. Pruebas de accesibilidad

**Propósito:** verificar que la UI es usable con lectores de pantalla y tecnología de asistencia (`accessibilityLabel`, `accessibilityRole`), no solo "visualmente correcta".

**Nivel en la pirámide:** transversal — en este proyecto se prueba a nivel de componente (`__tests__/accessibility/TaskCard.a11y.test.tsx`), pero el mismo criterio aplica a nivel E2E con un lector de pantalla real.

**Ejemplo concreto:** `TaskCard.a11y.test.tsx` verifica que el botón de eliminar tenga `accessibilityLabel` y `accessibilityRole="button"`, y `ConfirmDeleteDialog.tsx` expone `accessibilityLabel="Cancelar"` / `"Confirmar eliminación"` en sus botones — sin esto, un usuario con lector de pantalla no sabría qué hace cada botón del diálogo.

**Costo-beneficio (caso real):** **Robles v. Domino's Pizza** (caso que llegó hasta la Corte Suprema de EE.UU., certiorari denegado en 2019) — un usuario ciego no pudo completar un pedido en la app/sitio de Domino's porque no era compatible con su lector de pantalla (faltaban labels/alt text). La corte confirmó que el ADA aplica a apps y sitios web. El resultado fue una demanda, remediación forzada de toda la plataforma bajo presión legal, y costo reputacional — muchísimo más caro que haber puesto `accessibilityLabel` en cada control interactivo desde el principio, como ya hace este proyecto.

---

## Resumen

| Tipo | Nivel pirámide | Ubicación en el repo | Caso real referenciado |
|---|---|---|---|
| Unitarias | Base | `__tests__/utils/`, `__tests__/hooks/` | Ariane 5 (1996) — ~$370M |
| Integración | Media | `__tests__/integration/` | Knight Capital (2012) — $440M/45min |
| Contrato | Frontera integración/E2E | `__tests__/contract/` | Mars Climate Orbiter (1999) — $327.6M |
| E2E | Cúspide | *pendiente* (`e2e/` sugerido) | Healthcare.gov (2013) — cientos de millones en remediación |
| Accesibilidad | Transversal | `__tests__/accessibility/` | Robles v. Domino's Pizza (2019) |

**Patrón común en los cinco casos:** el costo de un defecto crece por órdenes de magnitud entre "detectarlo en una prueba antes del commit" (minutos) y "detectarlo después de que llegó a producción/al usuario" (millones de dólares, demandas, o pérdida total del sistema). Ninguno de los cinco incidentes fue causado por falta de talento técnico — fue causado por una capa de prueba que faltaba o no se ejecutó sobre el escenario real.
