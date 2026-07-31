import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useCreateTask } from '../../src/hooks/useCreateTask';
import { createTask } from '../../src/services/taskService';
import { Task } from '../../src/types';

// ============================================================
// NUEVOS CASOS DE PRUEBA — Actividad Unidad 2 (Punto 3: hooks)
// ============================================================

// Mock de taskService: aislamos createTask porque es la dependencia externa del hook
// (en producción llamaría a una API real por red). Mockearla evita I/O real y tiempos
// de espera de red, y nos permite controlar manualmente cuándo se resuelve la promesa
// para poder probar el orden de las transiciones de estado (idle -> loading -> success/error).
jest.mock('../../src/services/taskService', () => ({
  createTask: jest.fn(),
}));

const mockCreateTask = createTask as jest.Mock;

describe('useCreateTask — casos nuevos (Actividad Unidad 2)', () => {
  beforeEach(() => {
    // Limpiamos el historial de llamadas del mock entre pruebas para que una prueba
    // no contamine el conteo/implementación configurada en la siguiente.
    mockCreateTask.mockReset();
  });

  it('inicia con status "idle" y sin tareas', async () => {
    const { result } = await renderHook(() => useCreateTask());
    expect(result.current.status).toBe('idle');
    expect(result.current.tasks).toEqual([]);
  });

  it('pasa por el estado "loading" antes de llegar a "success" (orden de las actualizaciones de estado)', async () => {
    // Arrange: en vez de mockResolvedValue (que resuelve inmediato), controlamos
    // manualmente cuándo se resuelve la promesa para poder inspeccionar el estado intermedio.
    let resolveCreateTask: (task: Task) => void = () => {};
    mockCreateTask.mockImplementation(
      () =>
        new Promise<Task>((resolve) => {
          resolveCreateTask = resolve;
        })
    );

    const { result } = await renderHook(() => useCreateTask());

    // Act: llamamos submit sin esperar a que la promesa interna resuelva (a propósito),
    // para poder capturar el estado intermedio. Esperamos el wrapper de act(), no submit().
    await act(() => {
      result.current.submit('Nueva tarea');
    });
    // Assert intermedio: el estado debe ser "loading" mientras la promesa sigue pendiente
    await waitFor(() => {
      expect(result.current.status).toBe('loading');
    });

    // Act: ahora sí resolvemos la promesa mockeada
    await act(async () => {
      resolveCreateTask({ id: '1', title: 'Nueva tarea', status: 'pending' });
    });
    // Assert: el estado avanzó correctamente de "loading" a "success"
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
  });

  it('agrega la tarea creada al inicio del arreglo cuando el servicio responde con éxito', async () => {
    // Arrange
    mockCreateTask.mockResolvedValueOnce({ id: '1', title: 'Nueva tarea', status: 'pending' });
    const { result } = await renderHook(() => useCreateTask());

    // Act
    await act(async () => {
      await result.current.submit('Nueva tarea');
    });

    // Assert
    expect(result.current.status).toBe('success');
    expect(result.current.tasks[0]).toEqual({ id: '1', title: 'Nueva tarea', status: 'pending' });
  });

  it('cambia a estado "error" y no agrega tareas cuando el servicio falla', async () => {
    // Arrange
    mockCreateTask.mockRejectedValueOnce(new Error('Fallo de red simulado'));
    const { result } = await renderHook(() => useCreateTask());

    // Act
    await act(async () => {
      await result.current.submit('Nueva tarea');
    });

    // Assert
    expect(result.current.status).toBe('error');
    expect(result.current.tasks).toEqual([]);
  });
});
