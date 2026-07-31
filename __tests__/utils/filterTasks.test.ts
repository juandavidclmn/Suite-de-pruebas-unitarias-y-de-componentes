import { filterTasksByStatus } from '../../src/utils/filterTasks';
import { Task } from '../../src/types';

const mockTasks: Task[] = [
  { id: '1', title: 'Comprar leche', status: 'pending' },
  { id: '2', title: 'Estudiar React Native', status: 'completed' },
  { id: '3', title: 'Hacer ejercicio', status: 'pending' },
  { id: '4', title: 'Leer documentación de Jest', status: 'completed' },
];

describe('filterTasksByStatus', () => {
  it('devuelve solo las tareas con el estado indicado', () => {
    const result = filterTasksByStatus(mockTasks, 'completed');
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Estudiar React Native');
  });

  it('devuelve un arreglo vacío cuando no hay coincidencias', () => {
    const result = filterTasksByStatus(mockTasks, 'archived');
    expect(result).toEqual([]);
  });

  it('devuelve todas las tareas cuando el estado es "all"', () => {
    const result = filterTasksByStatus(mockTasks, 'all');
    expect(result).toHaveLength(4);
  });

  it('lanza un error cuando el estado es inválido', () => {
    // @ts-expect-error probando entrada inválida en runtime
    expect(() => filterTasksByStatus(mockTasks, 'invalido')).toThrow();
  });
});

// ============================================================
// NUEVOS CASOS DE PRUEBA — Actividad Unidad 2
// (No modifica nada de lo que ya existía arriba)
// ============================================================
describe('filterTasksByStatus — casos nuevos (Actividad Unidad 2)', () => {
  it('devuelve un arreglo vacío cuando el arreglo de tareas de entrada ya está vacío (valores vacíos)', () => {
    // Arrange: arreglo de entrada vacío (distinto del caso ya probado de "sin coincidencias")
    // Act
    const result = filterTasksByStatus([], 'completed');
    // Assert
    expect(result).toEqual([]);
  });

  it('el resultado contiene el título de la tarea pendiente esperada', () => {
    // Arrange: mockTasks ya definido arriba
    // Act
    const result = filterTasksByStatus(mockTasks, 'pending');
    const titles = result.map((t) => t.title);
    // Assert: toContain verifica que el arreglo de títulos incluye el valor esperado
    expect(titles).toContain('Comprar leche');
  });

  it('lanza un error en tiempo de ejecución si el arreglo de tareas es null (valor nulo inesperado)', () => {
    // Arrange: tasks llega como null en runtime aunque el tipo declarado sea Task[]
    // Act: la función intenta ejecutar tasks.filter(...), que no existe en null
    // Assert
    // @ts-expect-error probando un valor null en runtime
    expect(() => filterTasksByStatus(null, 'completed')).toThrow();
  });
});
